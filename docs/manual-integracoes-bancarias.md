# Manual das integrações bancárias — Paris Devs

Este texto descreve o que o portal lê hoje, de onde cada número sai e o que a empresa precisa contratar ou autorizar para Itaú, XP, Open Finance (Pluggy) e lançamento manual.

Sandbox é o padrão. Produção do Itaú e da Pluggy só liga com flag explícita no servidor. A XP ainda não tem GET de extrato neste produto.

Portais oficiais:

- Itaú Account Statement 1.33.0 — [Itaú for Developers](https://devportal.itau.com.br)
- XP Data Access — [developer.xpinc.com/documentacao](https://developer.xpinc.com/documentacao)
- Pluggy sandbox — [docs.pluggy.ai/pt/docs/guides/sandbox](https://docs.pluggy.ai/pt/docs/guides/sandbox)

---

## 1. Como o portal pensa os dados

O financeiro não consulta o banco na tela de dashboard, extrato ou DRE. Essas telas leem só o que já está no PostgreSQL.

| O que a tela mostra | Tabela | De onde veio |
|---|---|---|
| Saldo consolidado | `conta_bancaria.saldo` | Soma das contas ativas (`GET /dashboard/kpis`) |
| Entradas / saídas / resultado | `operacao` | Soma do período, sem texto `transfer` |
| Linha do extrato | `operacao` | `GET /operacoes` |
| Origem da linha | `operacao.origem` | `MANUAL`, `IMPORTACAO`, `ITAU`, `XP`, `PLUGGY` |

Regra de saldo:

- **Manual e importação de arquivo:** cada criar, editar ou apagar ajusta `conta.saldo` (SaldoMovimento).
- **Itaú e Pluggy:** o lançamento **não** mexe no saldo. O saldo da conta vira o snapshot do GET de saldo do provedor, na sincronização.
- **XP:** nenhum GET. Saldo e lançamento da conta XP continuam os que já estavam (em geral, manuais).

Uma conta tem **uma** origem ativa. Não sincroniza Itaú e Pluggy ao mesmo tempo na mesma conta.

---

## 2. Mapa campo a campo

O `GET /operacoes` devolve o mesmo JSON para qualquer origem. O que muda é o GET externo que preenche a linha.

### 2.1 Saldo da conta e do dashboard

| Campo na tela | Manual | Itaú | Pluggy | XP |
|---|---|---|---|---|
| `conta.saldo` | Ajuste a cada lançamento | `GET /balances` → `amount.value` da conta cujo texto contém o `statementId`. Se a resposta tiver um único `amount.value`, esse valor vale. Se houver vários e nenhum casar com a conta, o saldo local **não muda**. | `GET /accounts?itemId=` → `balance`. Se `balance` não vier, `bankData.closingBalance`. | Não há GET. O saldo cadastrado permanece. |
| Dashboard “Saldo” | Soma de `conta.saldo` das contas ativas | Idem, depois da sincronização | Idem | Idem |

O extrato do Itaú **não** atualiza saldo. O OpenAPI público não nomeia um campo de saldo no GET de statements.

### 2.2 Lançamento (`GET /operacoes`)

| Campo Paris Devs | Manual (`POST /operacoes`) | Itaú `GET /statements/{statementId}` | Pluggy `GET /transactions` | XP |
|---|---|---|---|---|
| `origem` | `MANUAL` | `ITAU` | `PLUGGY` | `XP` (ainda não gravada) |
| `valorOperacao` | Valor positivo informado | `amount.value` (absoluto) | `amount` (absoluto; o sinal original vai embora) | — |
| `tipoOperacao` | `RECEBIMENTO` ou `PAGAMENTO` | `operation` C/CREDIT → recebimento; D/DEBIT → pagamento; senão, o sinal de `amount.value` | `type` CREDIT → recebimento; DEBIT → pagamento | — |
| `razaoSocial` | Texto do formulário | `counterpart.name`; se vazio, `literal.complete` | `description`; se vazio, `descriptionRaw` | — |
| `categoria` | Texto do formulário | `literal.shortened`; se vazio, `"Extrato"` | `category`; se vazio, `"Extrato"` | — |
| `dtHora` | Data/hora informada | `date`, ou `date.event`, ou `date.accounting` | `date` | — |
| `contaBancariaDto` | Conta escolhida | Conta ligada à conexão | Conta BANK casada pelo número / corrente | Conta ligada, sem movimento novo |
| chave única | conta + data + tipo + razão + valor | `origem` + `id` do evento (ou hash) | `origem` + `id` da transação | — |

Condição para o Itaú virar operação: o JSON precisa ter **os dois** `literal.complete` e `amount.value`. Amostra pública `{"data":{}}` é extrato vazio, sem linha nova. Payload com outro formato fica só na captura bruta.

O que a Pluggy ainda devolve e **não** vira operação: `paymentData`, `creditCardMetadata`, `merchant`, `status`, `balance` da transação.

### 2.3 Entradas, saídas e DRE

Não há GET de “entradas” no banco. O dashboard soma `operacao.valorOperacao` no período.

- Recebimento → entradas.
- Pagamento → saídas.
- Texto com `transfer` na categoria ou na razão → fora do resultado (transferência entre contas).

### 2.4 Outros GETs (não são caixa)

| GET | Uso no Paris Devs |
|---|---|
| Itaú `GET /statements/{id}/interest-bearing-accounts` | Guardado. Não vira operação. |
| Itaú `GET /statements/{id}/judicial-orders` | Guardado. Não vira operação. |
| Itaú `GET /statements/{id}/investment-balances` | Guardado. Não vira operação. |
| Itaú `GET /accounts-receivable` | Guardado. PENDING não entra no resultado. PAID só viraria operação se o extrato ainda não tivesse o mesmo lançamento — hoje não promove sozinho. |
| Pluggy `GET /investments` | Guardado. Não vira operação de caixa. |
| Pluggy `GET /loans` | Guardado. Não vira operação de caixa. |
| Pluggy PIX/boleto (conectores 600 e 8) | Fora desta etapa. |

---

## 3. Lançamento manual

Não depende de banco.

1. Cadastre a filial e a conta em **Configurações → Contas**.
2. Lance em **Operações** ou importe arquivo em **Extratos**.
3. `POST /operacoes` grava `origem = MANUAL` e ajusta o saldo.
4. Editar ou apagar também ajusta o saldo. Linha `ITAU` / `PLUGGY` / `XP` não pode ser editada nem apagada; a correção é nova sincronização.

A conta sem conexão aparece em Conexões como **Lançamento manual**.

---

## 4. Itaú — API Account Statement 1.33.0

Uso: contas Itaú da empresa, API direta, sem Open Finance.

### 4.1 O que a empresa precisa obter

1. Cadastro no [Itaú for Developers](https://devportal.itau.com.br).
2. Projeto com a API **Account Statement**.
3. Contrato / onboarding de parceiro (o spec completo do extrato é restrito a quem já está no portal).
4. No sandbox: botão **Criar credenciais** (uma vez por sessão no portal). Guarde **client id** e **client secret**.
5. Escopos: `account-statement-account-statement.read` (extrato, saldos, aplicação automática, ordens judiciais, recebíveis) e `account-statement.investment.read` (saldo de investimento).
6. Produção: credencial de produção, token em `https://sts.itau.com.br/api/oauth/token`, e no servidor `app.itau.producao-habilitada=true`. Sem essa flag o portal recusa produção.

### 4.2 URLs

| | Sandbox | Produção (neste código) |
|---|---|---|
| Base | `https://sandbox.devportal.itau.com.br/itau-vw9-api-account-statement-v1-externo/v1` | `https://account-statement.api.dev.itau.com/account-statement/v1` |
| Token | `https://sts.rdhi.com.br/api/oauth/token` | `https://sts.itau.com.br/api/oauth/token` |

Toda chamada leva `Authorization: Bearer` e `x-itau-correlationid` (UUID gerado no servidor).

`statementId` = agência 4 dígitos + conta 7 + dígito 1. Exemplo do portal: agência 1500, conta 0123456, dígito 7 → `150001234567`. No Paris Devs isso sai de `ContaBancaria.agencia` + `numeroConta` + dígito.

### 4.3 GETs usados na sincronização

| Método | Caminho | Vira |
|---|---|---|
| GET | `/statements/{statementId}?type=&start_date=&end_date=&page=&page_size=100&statement_type=complete` | Operações |
| GET | `/balances` | Saldo da conta |
| GET | `/statements/{id}/interest-bearing-accounts` | Captura |
| GET | `/statements/{id}/judicial-orders` | Captura |
| GET | `/statements/{id}/investment-balances?date=` | Captura |
| GET | `/accounts-receivable?statement-id=&start-issue-date=` | Captura |

### 4.4 Como ligar no Paris Devs

1. Cadastre a conta Itaú (agência, número com dígito).
2. **Conexões → Ligar banco → Itaú**.
3. Passo 1: cole client id e client secret. O valor vai à memória do servidor (ou use `ITAU_CLIENT_ID` / `ITAU_CLIENT_SECRET` no ambiente). Não fica no navegador.
4. Passo 2: escolha a conta e o tipo (corrente ou poupança).
5. Na lista, **Sincronizar** com o período. O extrato vira `Operacao` com `origem=ITAU`. O saldo vem de `/balances`.

Sem credencial a API responde 503: a credencial não foi informada no servidor.

---

## 5. XP — Data Access

Uso: contas XP da empresa, API direta. **Hoje o Paris Devs não chama a XP.** Não existe path REST público neste briefing; inventar URL geraria lançamento falso.

### 5.1 O que a empresa precisa obter (ordem da XP)

Documentação: [developer.xpinc.com/documentacao](https://developer.xpinc.com/documentacao).

1. **Certificado digital** com OCSP ligado e EKU `1.3.6.1.5.5.7.3.2` (Client Authentication). Falta isso → 401. Não contorne.
2. Anote o **CName** (Common Name) do certificado.
3. Guarde certificado e segredos num **Key Vault**, fora do repositório.
4. Liste os **IPs** dos servidores que farão as chamadas.
5. No HUB Web, o MASTER do escritório: **Ferramentas → Data Access → Solicitar acesso**. O responsável técnico recebe o portal.
6. Abra o **chamado de avaliação de segurança** com CName e IPs.
7. Depois da aprovação, a **Subscription Key** chega por e-mail. Guarde no cofre na hora.
8. OAuth 2.0: Access Token em cada chamada, mais a Subscription Key.
9. Consultas em **OData** sobre o star schema (fatos e dimensões). Os recursos só aparecem no portal Data Access após o assessment.

Enquanto o spec técnico não estiver no time, o método de sincronização responde **Aguardando autorização** e a lista do que falta. Nenhum `GET /operacoes` nasce com `origem=XP`.

### 5.2 Como registrar no Paris Devs

1. **Conexões → Ligar banco → XP**.
2. Passo 1: client id, caminho do certificado no servidor, chave de assinatura (Subscription Key). Ambiente: `XP_CLIENT_ID`, `XP_CERTIFICADO_CAMINHO`, `XP_SUBSCRIPTION_KEY`.
3. Passo 2: conta XP, CName, IPs, se a avaliação já foi enviada.
4. Sincronizar **não** busca extrato. Serve para ver o checklist.

Quando o spec existir, o mesmo gravador canônico passa a escrever `Operacao` com `origem=XP`, no mesmo formato do Itaú e da Pluggy.

---

## 6. Open Finance — Pluggy

Uso: bancos que não usam a API direta (Bradesco, Nubank, etc.) e, se um dia fizer sentido, Itaú/XP sem o contrato direto.

### 6.1 O que a empresa precisa obter

1. Conta em [dashboard.pluggy.ai](https://dashboard.pluggy.ai).
2. Aplicativo com **Client ID** e **Client Secret**.
3. Produtos habilitados: contas e transações (investimentos e empréstimos são lidos e guardados, sem virar caixa).
4. Sandbox: no widget, `includeSandbox: true`. Sem widget, `GET /connectors?sandbox=true`. O id do **Pluggy Bank** não está fixo no código: o servidor lê a lista e ignora os conectores 600 (PIX) e 8 (boleto).
5. Produção: conectores Live. Só com `app.pluggy.producao-habilitada=true`.

O browser recebe só o **connect token** de curta duração. Client secret nunca sai do servidor.

Item sandbox parado **30 dias** é apagado pela Pluggy. A sincronização atualiza o item antes de ler.

### 6.2 Credenciais de teste (só sandbox)

- Senha: `password-ok`
- MFA: `123456`
- Fluxo básico: usuário `user-ok` → SUCCESS
- Open Finance simulado, CPF `76109277673` (só dígitos na API: `76109277673`), login `user-ok` / `password-ok`

Outros usuários do guia cobrem conta bloqueada, credencial inválida, MFA, autorização pendente, etc. Não use valor fixo do sandbox como teste automatizado: o ambiente muda.

### 6.3 GETs usados na sincronização

| Método | Caminho | Vira |
|---|---|---|
| POST | `/auth` | apiKey (servidor) |
| POST | `/connect_token` | token curto para o browser |
| POST | `/items` | conexão |
| PATCH | `/items/{id}` | evita exclusão de 30 dias |
| GET | `/items/{id}` | status da execução |
| GET | `/accounts?itemId=` | saldo (`balance`) e escolha da conta |
| GET | `/transactions?accountId=&from=&to=` | operações |
| GET | `/investments?itemId=` | captura |
| GET | `/loans?itemId=` | captura |

### 6.4 Como ligar no Paris Devs

1. Cadastre a conta do banco (qualquer instituição do catálogo).
2. **Conexões → Ligar banco → Open Finance**.
3. Passo 1: client id e secret da Pluggy (`PLUGGY_CLIENT_ID` / `PLUGGY_CLIENT_SECRET` no ambiente, se preferir).
4. Passo 2: escolha a conta interna que vai receber o extrato.
5. Passo 3: sandbox (`user-ok`, `password-ok`, MFA). CPF só no fluxo Open Finance.
6. **Sincronizar** o período. Operações com `origem=PLUGGY`. Saldo de `account.balance`.

---

## 7. Variáveis de ambiente do servidor

Não grave segredo no Git nem em `localStorage`.

```
ITAU_CLIENT_ID=
ITAU_CLIENT_SECRET=
PLUGGY_CLIENT_ID=
PLUGGY_CLIENT_SECRET=
XP_CLIENT_ID=
XP_SUBSCRIPTION_KEY=
XP_CERTIFICADO_CAMINHO=
```

Flags (ficam em `application.properties`):

- `app.itau.producao-habilitada=false`
- `app.pluggy.producao-habilitada=false`

A tela **Conexões → Ligar banco** também envia a credencial para a **memória do processo** (`PUT /conexoes/credencial`). Reiniciar a API apaga essa memória; a do ambiente permanece.

---

## 8. APIs internas (JWT)

| Método | Caminho | Função |
|---|---|---|
| GET | `/conexoes` | Lista conexões, **sem** segredo |
| POST | `/conexoes` | Liga conta a Itaú, XP ou Pluggy |
| DELETE | `/conexoes/{id}` | Desconecta; lançamentos já gravados ficam |
| PUT | `/conexoes/credencial` | Guarda client id/secret na memória |
| POST | `/conexoes/{id}/sincronizar` | Busca o período no provedor |
| POST | `/conexoes/sincronizar` | Todas as conexões ativas do recorte |
| POST | `/conexoes/{id}/pluggy` | Cria o item sandbox |
| POST | `/conexoes/{id}/pluggy/token` | Connect token para o widget |
| GET | `/operacoes` | Extrato canônico |
| POST/PUT/DELETE | `/operacoes` | Só linha MANUAL / IMPORTACAO |
| GET | `/dashboard/kpis` | Saldo + entradas + saídas |
| GET/POST | `/dre` | Lê as mesmas operações |

Reprocessar a mesma janela atualiza a linha pela chave `origem + id externo`. Não duplica e não soma saldo duas vezes nas contas sincronizadas.

---

## 9. Quem faz o quê na empresa

| Papel | Função |
|---|---|
| Financeiro | Cadastra contas, liga o banco na tela, sincroniza o mês, lança ajuste manual |
| TI / responsável técnico | Credenciais no servidor ou no cofre, IPs, certificado XP, flags de produção |
| Jurídico / MASTER XP | Pedido de Data Access no HUB, avaliação de segurança |
| Contato Itaú | Projeto no portal, contrato Account Statement, credenciais sandbox/produção |
| Contato Pluggy | App no dashboard, produtos ACCOUNTS e TRANSACTIONS |

---

## 10. Limites atuais (ler antes de prometer prazo)

1. O OpenAPI 3.0.0 do extrato Itaú não está público. Sem `literal.complete` + `amount.value`, o JSON é guardado e o caixa não muda.
2. A XP não tem GET neste código. Checklist e estado “aguardando autorização” apenas.
3. Produção Itaú/Pluggy desligada por padrão.
4. Pagamentos PIX/boleto da Pluggy não estão nesta etapa.
5. Item sandbox Pluggy some em 30 dias sem atualização.
6. DRE gerada (`POST /dre/gerar`) é um retrato; não se atualiza sozinha quando entra extrato novo.

Critério prático de “integração no ar”: com credencial de sandbox do Itaú, um extrato vira linha em **Extratos** e o **Dashboard** daquele mês muda. O mesmo com client id/secret da Pluggy e o conector Sandbox. A XP mostra o que falta e não inventa movimento. O lançamento manual continua ao lado dos três.
