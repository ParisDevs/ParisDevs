# Plataforma Inteligente de Conciliação Financeira, BPO e DRE com IA
### Especificação de Produto, Negócio e Arquitetura Técnica

---

## 1. Resumo Executivo

A **Plataforma Inteligente de Conciliação Financeira e DRE** é um produto SaaS B2B voltado para empresas multi-CNPJ e operações de **BPO financeiro** que precisam transformar dados bancários brutos em informação financeira confiável, classificada e atualizada diariamente.

O produto integra **Open Finance**, um **motor de conciliação bancária**, **IA híbrida de classificação** (regras + histórico + machine learning + LLM) e módulos gerenciais de **fluxo de caixa** e **DRE gerencial**, entregando ao gestor uma visão financeira consolidada em tempo próximo do real — em vez do ciclo manual atual, que pode levar até 45 dias.

O sistema não é "um leitor de extrato". É uma cadeia de valor completa:

```
dados bancários brutos → normalização → conciliação → classificação (IA) →
plano de contas → consolidação por CNPJ → fluxo de caixa → DRE gerencial →
indicadores → alertas → insights
```

A arquitetura é construída para ser **desacoplada de bancos específicos**, **auditável em cada alteração de classificação**, **assíncrona nos processamentos pesados** e **configurável** nas regras gerenciais e no plano de contas — nunca fixando no código valores, limites ou integrações que pertencem à camada de negócio ou dependem de documentação externa não verificada.

---

## 2. Problema Atual

Hoje, o processo financeiro da operação é majoritariamente manual:

- Múltiplos CNPJs, cada um com múltiplas contas bancárias;
- Extratos obtidos de bancos e ERPs distintos, sem padronização;
- Um analista interpreta cada lançamento manualmente para decidir sua natureza (mercadorias, mão de obra, energia, aluguel, impostos, estornos, etc.);
- Classificação, conferência e consolidação dependem fortemente de intervenção humana;
- O ciclo completo — do lançamento bancário até a visão financeira consolidada — pode levar **cerca de 45 dias**.

Esse modelo gera riscos e ineficiências recorrentes:

| Problema | Efeito |
|---|---|
| Erro de lançamento | Informação financeira incorreta |
| Erro de classificação | DRE e indicadores distorcidos |
| Duplicidade | Dados de caixa e resultado inflados |
| Falha de comunicação entre sistemas | Retrabalho e divergências |
| Dependência de processos manuais | Lentidão e alto custo operacional |
| Atraso na geração de informação | Decisões tomadas com dados velhos |
| Dificuldade de consolidar múltiplos CNPJs | Visão de grupo pouco confiável |

---

## 3. Objetivo

Substituir o ciclo manual e lento por um fluxo automatizado, auditável e assistido por IA que produza:

- Conciliação bancária diária;
- Classificação de transações com alta automação e revisão humana onde necessário (human-in-the-loop);
- Consolidação financeira por CNPJ e por grupo empresarial;
- Fluxo de caixa realizado e projetado;
- DRE gerencial atualizada;
- Indicadores, alertas e insights de IA.

**Meta central:** reduzir o tempo de fechamento financeiro de ~45 dias para uma visão **diária**, sem eliminar a validação humana em pontos críticos.

---

## 4. Público-alvo

- Empresas com **múltiplos CNPJs** e múltiplas contas bancárias (redes de lojas, restaurantes, franquias, grupos empresariais);
- **Operações de BPO financeiro** que prestam serviço de conciliação, contas a pagar/receber e reporting para terceiros;
- Escritórios de contabilidade gerencial e controllers que precisam de uma visão financeira diária, não apenas contábil/fiscal;
- Gestores e sócios que precisam de indicadores e alertas financeiros sem depender do fechamento mensal.

---

## 5. BPO Financeiro

**BPO = Business Process Outsourcing** (terceirização de processos de negócio).

No contexto deste projeto, BPO financeiro é a **operação/serviço** — interna ou terceirizada — responsável por processos como:

- Contas a pagar;
- Contas a receber;
- Conciliação bancária;
- Classificação financeira;
- Fluxo de caixa;
- Fechamento periódico;
- Relatórios gerenciais;
- Acompanhamento financeiro e suporte à gestão.

É importante não confundir camadas:

> **BPO é o processo/serviço financeiro. O software é a ferramenta que automatiza, organiza e acelera parte desse processo — não é uma etapa da DRE, nem um sinônimo dela.**

A plataforma pode ser usada tanto por uma empresa que opera seu próprio financeiro internamente quanto por uma operação de BPO que atende múltiplos clientes (multi-tenant), mas essa segunda hipótese deve ser tratada como uma decisão de modelo de negócio a ser validada, não uma premissa fixa da arquitetura inicial.

---

## 6. Demonstrativos Financeiros

### O que são e por que existem

Demonstrativos financeiros são relatórios estruturados que traduzem a atividade econômica de uma empresa em informação organizada, permitindo entender **resultado**, **posição patrimonial** e **movimentação de caixa** em um período.

### Quem utiliza

- Sócios e gestores (decisão estratégica e operacional);
- Contabilidade e fiscal (obrigações legais);
- Bancos e investidores (avaliação de crédito/risco);
- Auditoria e controle interno.

### Visão contábil x visão gerencial

- **Visão contábil/fiscal:** segue normas contábeis e exigências legais/tributárias; é formal e tem finalidade de conformidade.
- **Visão gerencial:** é organizada para apoiar decisão, podendo agrupar contas de forma diferente da contábil oficial, com mais granularidade operacional (ex.: por loja, por categoria de custo).

Este projeto tem **foco gerencial**, não substitui a contabilidade formal.

### Principais demonstrativos

- **Balanço Patrimonial** — retrata a posição de ativos, passivos e patrimônio líquido em um momento específico. *(Fora do escopo funcional inicial deste sistema, mencionado apenas para contextualização.)*
- **DRE (Demonstração do Resultado do Exercício)** — mostra como a empresa chegou a um resultado (lucro ou prejuízo) em um período.
- **DFC / Fluxo de Caixa** — mostra entradas e saídas efetivas de caixa.

**Escopo deste sistema:** **DRE gerencial + Fluxo de Caixa + Conciliação Bancária**, com o Balanço Patrimonial fora do escopo do MVP e das fases iniciais.

---

## 7. DRE (Demonstração do Resultado do Exercício)

A DRE tem a finalidade de **identificar como a empresa chegou a determinado resultado em um período** — não é simplesmente "receita menos despesa".

### Estrutura gerencial simplificada

```
Receita Bruta
(-) Deduções
= Receita Líquida
(-) Custos
= Lucro Bruto
(-) Despesas Operacionais
= Resultado Operacional
(-) Despesas Financeiras
= Resultado antes dos Tributos
(-) Tributos sobre o Lucro
= Resultado Líquido
```

O formato exato varia conforme normas contábeis aplicáveis, regime tributário e características do negócio — **isso deve ser validado com a contabilidade/consultoria fiscal da empresa**, e não assumido como fórmula universal pelo sistema.

Componentes que a plataforma deve reconhecer como distintos:

- Receitas;
- Deduções (impostos sobre venda, devoluções);
- Custos (diretamente ligados à operação/produto/serviço);
- Despesas operacionais (estrutura, administrativo);
- Resultado financeiro (juros, tarifas, encargos);
- Tributos sobre o lucro;
- Resultado final.

---

## 8. Competência x Caixa

Este é um dos pontos mais críticos da modelagem de dados e **nunca deve ser simplificado**.

### Regime de competência

O reconhecimento econômico ocorre **no período a que a operação pertence**, independentemente de quando o dinheiro efetivamente circula.

### Regime de caixa

O foco está **no momento em que o dinheiro entra ou sai** da conta.

### Exemplo

Uma venda de R$ 10.000 ocorre em 10/08, mas o recebimento (ex.: via cartão de crédito) só acontece em 10/09.

- **Competência → agosto** (mês da venda)
- **Caixa → setembro** (mês do recebimento)

O mesmo raciocínio vale para fornecedores, aluguel e impostos: a data da obrigação/direito pode ser diferente da data de liquidação financeira.

### Datas que a arquitetura deve suportar, quando aplicável

- Data da operação;
- Data de competência;
- Data de vencimento;
- Data de pagamento/recebimento;
- Data de liquidação.

> **Regra arquitetural crítica:** o sistema **nunca deve misturar automaticamente** a DRE por competência com o fluxo de caixa realizado. São visões complementares, mas não intercambiáveis — misturá-las produz relatórios financeiros incorretos.

---

## 9. Fluxo de Negócio: Processo Atual x Processo Futuro

### Processo atual

```
Banco
↓
Extrato
↓
ERP / sistemas
↓
Analista
↓
Classificação manual
↓
Conferência
↓
Consolidação
↓
Relatório
↓
Gestor
```

Problema central: **cada seta depende de trabalho humano**, o que introduz atraso, erro e falta de padronização.

### Processo futuro (com a plataforma)

```
Banco
↓
Open Finance
↓
Extrato bruto
↓
Normalização
↓
Motor de conciliação
↓
IA + regras
↓
Plano de contas
↓
Revisão humana quando necessário
↓
Consolidação
↓
Fluxo de Caixa
↓
DRE Gerencial
↓
Indicadores
↓
Alertas / Insights
↓
Gestor
```

O que cada etapa resolve:

| Etapa | Problema que resolve |
|---|---|
| Open Finance | Elimina coleta manual de extratos |
| Normalização | Elimina inconsistência de formatos entre bancos |
| Motor de conciliação | Elimina duplicidade e identifica movimentações internas |
| IA + regras | Reduz tempo e erro de classificação |
| Plano de contas | Padroniza a linguagem financeira da empresa |
| Revisão humana | Garante controle sobre casos de baixa confiança |
| Consolidação | Une múltiplos CNPJs em uma visão de grupo |
| Fluxo de Caixa / DRE | Transforma dados em demonstrativos financeiros |
| Indicadores / Alertas | Antecipa problemas e apoia decisão |

---

## 10. Regras de Negócio

### Passo 1 — Cadastro da organização

Cadastrar:

- Organização / grupo empresarial;
- CNPJ, razão social, nome fantasia;
- Segmento de atuação;
- Configurações financeiras (plano de contas padrão, regras gerenciais, moeda, fuso horário fiscal).

Uma organização pode possuir diversos CNPJs.

### Multi-CNPJ

```
Grupo Empresarial
│
├── CNPJ 01
│   ├── Conta Banco A
│   └── Conta Banco B
│
├── CNPJ 02
│   ├── Conta Banco A
│   └── Conta Banco C
│
└── CNPJ 03
    └── Conta Banco A
```

**Regra:** toda transação deve estar associada ao CNPJ correspondente.

O sistema deve suportar:

- Visão individual por CNPJ;
- Visão consolidada do grupo;
- Filtros por CNPJ;
- Consolidação com **eliminação de operações intercompany** — transferências e transações entre empresas do mesmo grupo não podem ser somadas ingenuamente como receita/despesa de grupo, sob risco de inflar artificialmente o resultado consolidado. O tratamento contábil exato de eliminações intercompany deve ser validado com a contabilidade responsável.

### Regras de integridade de dados

- Cada transação pertence a uma conta bancária;
- Cada conta pertence a um CNPJ;
- Cada CNPJ pertence a uma organização;
- Toda transação precisa de identificador de origem (para deduplicação);
- Duplicidades devem ser controladas ativamente;
- Toda classificação deve ser rastreável (quem, quando, de onde para onde);
- Alterações manuais geram registro de auditoria obrigatório;
- Transações internas (transferências entre contas da mesma empresa/grupo) não podem gerar receita ou despesa indevida;
- Toda categoria usada precisa pertencer a um plano de contas válido.

---

## 11. Open Finance

Open Finance é a **camada de obtenção dos dados bancários** — é fonte de dados, não regra de negócio.

```
Sistema
↓
Conector bancário
↓
Open Finance
↓
Banco
↓
Conta
↓
Transações
```

### Abstração de conectores

```
BankConnector (interface)
├── ItauConnector
├── XPConnector
└── OtherBankConnector
```

O restante do sistema (normalização, conciliação, classificação, DRE) **não deve depender diretamente da API específica de nenhum banco**. Toda peculiaridade de formato ou de comportamento de uma instituição fica isolada dentro do respectivo `Connector`.

> **Importante:** disponibilidade de APIs, escopos de dados, limites de uso e exigências de credenciamento no Open Finance variam por instituição e mudam ao longo do tempo. Essas informações **devem ser validadas na documentação oficial vigente de cada banco/participante do Open Finance Brasil** antes da implementação — nenhuma integração específica deve ser assumida como disponível apenas com base neste documento.

---

## 12. Extrato Bruto e Normalização

### Dados típicos recebidos de um extrato

- Data;
- Valor;
- Tipo (crédito/débito);
- Descrição;
- Identificador da transação;
- Conta;
- Banco;
- Contraparte;
- Documento associado;
- Dados adicionais (variam por banco).

### Exemplo de extrato bruto (ilustrativo)

```json
{
  "data": "2026-08-10",
  "valor": -4800.00,
  "tipo": "DEBITO",
  "descricao": "PAGTO FORNECEDOR AMBEV SA",
  "id_transacao": "BCO-98213-XT",
  "conta": "12345-6",
  "banco": "Itaú",
  "contraparte": "AMBEV S.A.",
  "documento": "NF 55231"
}
```

### Por que normalizar

Bancos diferentes entregam formatos, nomenclaturas e granularidades diferentes. Sem uma etapa de normalização, o motor de conciliação e a IA de classificação precisariam conhecer as particularidades de cada banco — o que quebra o desacoplamento.

### Modelo interno padronizado

```
transaction_id
company_id
bank_account_id
transaction_date
amount
transaction_type
description
counterparty
document
source
```

A normalização acontece **antes** das regras de classificação e conciliação — é um pré-requisito, não uma etapa opcional.

---

## 13. Conciliação Bancária

**Conciliação bancária** é o processo de confirmar que os lançamentos financeiros da empresa correspondem, de forma correta e sem duplicidade, aos registros efetivamente movimentados nas contas bancárias.

O motor de conciliação deve verificar:

- Duplicidade de lançamentos;
- Identificação/correspondência entre transações e lançamentos esperados;
- Transferências internas entre contas da mesma empresa;
- Divergências de valor, data ou conta;
- Possíveis correspondências (matching) entre lançamentos pendentes e transações recebidas.

### Regra crítica

> Transferência entre contas da mesma empresa **não deve ser tratada automaticamente como receita ou despesa**.

Exemplo:

```
Itaú → XP
R$ 10.000
```

Isso é movimentação interna de caixa, não resultado.

### Detecção de duplicidade

Combinação de atributos para identificar duplicidade:

- Identificador bancário;
- Banco;
- Conta;
- Data;
- Valor;
- Descrição;
- Contraparte.

Regra: nenhuma transação de origem pode gerar mais de um registro financeiro definitivo no sistema — reimportações, ressincronizações ou reprocessamentos devem ser idempotentes.

---

## 14. IA de Classificação

A IA analisa cada transação normalizada e sugere:

- Natureza;
- Categoria;
- Subcategoria;
- Centro de custo (quando aplicável);
- Score de confiança.

### Exemplo

```
AMBEV S.A.
R$ 4.800
↓
Mercadorias
↓
Bebidas
↓
Cervejas
↓
97% confiança
```

### Arquitetura híbrida (não totalmente autônoma)

```
regras determinísticas + histórico da empresa/fornecedor + modelo de ML + LLM (casos ambíguos) + validação humana
```

Diferenças entre as abordagens:

| Abordagem | Quando é melhor |
|---|---|
| Regras determinísticas | Padrões estáveis e conhecidos (ex.: sempre que contraparte = "SABESP", categoria = Água) |
| Histórico do fornecedor/CNPJ | Fornecedores recorrentes com padrão consistente de classificação anterior |
| Machine Learning (ex.: classificador supervisionado) | Grande volume de dados históricos rotulados, padrões não totalmente explícitos |
| LLM | Descrições ambíguas, pouco estruturadas, ou que exigem raciocínio contextual sobre texto livre |

### Aprendizado por histórico

```
Fornecedor X
↓
100 classificações anteriores
↓
98 como Manutenção > Equipamentos
↓
nova transação recebe alta confiança
```

O histórico por fornecedor, descrição e CNPJ deve alimentar continuamente o modelo de decisão, mas sempre com rastreabilidade de qual mecanismo gerou a sugestão.

### Score de confiança (exemplo configurável)

- **95–100%** → classificação automática;
- **80–94%** → sugestão para aprovação do analista;
- **< 80%** → revisão humana obrigatória.

Esses valores são **exemplos** e devem ser parâmetros configuráveis por organização, não constantes fixas no código.

### Human-in-the-loop

O analista pode:

- Aceitar;
- Alterar;
- Rejeitar;
- Reclassificar;
- Registrar motivo da alteração.

Toda alteração gera histórico de auditoria.

### IA de classificação x IA analítica/generativa

- **IA de classificação:** decide categoria/subcategoria/centro de custo de uma transação.
- **IA analítica/generativa (insights):** analisa padrões agregados e gera observações em linguagem natural, por exemplo:
  - "As despesas com manutenção aumentaram 24% em relação ao período anterior."
  - "O CNPJ 02 apresenta previsão de caixa negativo nos próximos dias."
  - "Mercadorias estão acima do limite configurado."
  - "A receita apresenta queda em relação ao período comparável."

Essas são responsabilidades distintas e devem ser tratadas como módulos separados de IA.

---

## 15. Plano de Contas e Centro de Custo

### Estrutura hierárquica (exemplo)

```
RECEITAS
├── Vendas
├── Serviços
└── Outras Receitas

CUSTOS
├── Mercadorias
│   ├── Alimentos
│   └── Bebidas
│       ├── Cerveja
│       ├── Vinho
│       ├── Água
│       └── Refrigerante
└── Mão de Obra

DESPESAS OPERACIONAIS
├── Ocupação
├── Manutenção
│   ├── Estrutura
│   ├── Hidráulica
│   ├── Elétrica
│   ├── Pintura
│   └── Equipamentos
├── Contas
├── Marketing
└── Administrativo

DESPESAS FINANCEIRAS
├── Juros
├── Tarifas
└── Encargos
```

Essa granularidade é importante porque indicadores gerenciais (ex.: "custo de manutenção hidráulica por loja") exigem nível de detalhe abaixo da categoria macro. O plano de contas deve ser **configurável por empresa/segmento**, já que restaurantes, redes de varejo e prestadoras de serviço têm estruturas de custo diferentes.

### Centro de custo

Permite associar uma transação a uma dimensão operacional: loja, restaurante, unidade, departamento, operação ou projeto.

```
Categoria: Manutenção
Centro de custo: Loja 01
```

---

## 16. Multi-CNPJ

Já detalhado nas seções 10 e regras de integridade (11). Pontos adicionais:

- A visão consolidada de grupo deve permitir alternância rápida entre "visão por CNPJ" e "visão de grupo";
- Consolidação societária pode envolver eliminações de operações intercompany — **não deve ser tratada como soma bruta** dos CNPJs;
- Comparações entre CNPJs (ex.: margem, custo de mercadorias/receita) devem ser suportadas nativamente nos indicadores.

---

## 17. Fluxo de Caixa

### Fluxo de caixa realizado

Visão das entradas e saídas **efetivamente realizadas**:

```
Saldo Inicial
+ Entradas
- Saídas
= Saldo Final
```

Deve permitir visualização por dia, semana, mês ou período customizado.

### Fluxo de caixa projetado

Diferencia-se claramente do realizado:

```
Saldo atual
↓
Contas a pagar futuras
↓
Recebimentos previstos
↓
Saldo projetado
```

Inclui contas futuras, recebimentos esperados e pagamentos programados.

### Calendário financeiro

Exibe, por dia: receitas previstas, despesas previstas e resultado esperado.

```
14/08
Receita: R$ 35.000
Despesa: R$ 18.000
Resultado: +R$ 17.000
```

---

## 18. DRE Gerencial

Após classificação e tratamento das transações, o sistema consolida os dados em uma DRE gerencial.

Distinções que o sistema deve manter explícitas:

- **Transação bancária** (movimento financeiro bruto);
- **Classificação financeira** (categoria/subcategoria atribuída);
- **Dado de caixa** (quando o dinheiro efetivamente moveu);
- **Dado de competência** (a qual período econômico a operação pertence);
- **Resultado gerencial** (a síntese produzida pela DRE).

> **Princípio arquitetural:** uma movimentação bancária isolada **não é suficiente** para produzir automaticamente uma DRE contábil formal. A DRE gerencial produzida pelo sistema é uma visão de apoio à decisão, construída a partir de classificação e regras definidas pela empresa — não substitui a DRE contábil oficial, que segue normas e critérios que devem ser validados com a contabilidade responsável.

---

## 19. Indicadores

Exemplos de indicadores a serem calculados:

- Receita (total, por período, por CNPJ);
- Despesas (total, por categoria);
- Resultado (bruto, operacional, líquido);
- Margem (bruta, operacional, líquida);
- Custo de mercadorias / Receita;
- Mão de obra / Receita;
- Despesas operacionais / Receita;
- Evolução mensal;
- Evolução diária;
- Comparação entre CNPJs;
- Previsão de caixa (saldo projetado vs. realizado).

---

## 20. Regras Gerenciais Configuráveis

Exemplo de regra mencionada pelo negócio: **mercadorias + mão de obra ≤ 30% da receita**.

> Esse valor **não deve ser codificado como verdade universal** — é uma política gerencial do negócio, e deve ser modelada como parâmetro configurável por organização/segmento.

### Modelagem

```
Regra:
(Custo Mercadorias + Mão de Obra) / Receita ≤ Limite
```

### Exemplo de cálculo

```
Receita = R$ 100.000
Mercadorias = R$ 22.000
Mão de Obra = R$ 12.000

(22.000 + 12.000) / 100.000 = 34%
```

Se o limite configurado for 30%, o resultado gera **alerta de desvio** (34% > 30%).

Regras desse tipo pertencem às políticas gerenciais do negócio e devem viver em uma tabela de `financial_rules` configurável, não em lógica fixa de código.

---

## 21. Alertas

- Caixa projetado negativo;
- Aumento anormal de despesas;
- Categoria acima do limite configurado;
- Divergência de conciliação;
- Transação não classificada;
- Baixa confiança da IA em classificação pendente;
- Banco sem sincronização recente;
- Queda relevante de receita;
- Aumento expressivo de determinada categoria;
- Inconsistências entre períodos comparáveis.

---

## 22. Insights de IA

Complementares aos alertas, os insights são gerados por um módulo analítico/generativo que observa padrões agregados (ver seção 14 para a distinção entre IA de classificação e IA analítica). Exemplos já citados na seção 14.

### Histórico e comparações

O módulo de histórico/analytics deve permitir análise diária, semanal, mensal, trimestral e anual, comparando receita, despesa, resultado, margem, categorias e CNPJs entre períodos.

---

## 23. Auditoria

Todo evento financeiro relevante deve ter rastreabilidade completa:

- Usuário responsável;
- Data e hora;
- Lançamento afetado;
- Valor anterior e valor novo (quando aplicável);
- Classificação anterior e nova;
- Motivo da alteração, quando informado.

### Exemplo de registro de auditoria

```
14/08/2026 15:32
Usuário: João
Antes: Mercadorias > Bebidas
Depois: Manutenção > Equipamentos
Motivo: Reclassificação após revisão de nota fiscal
```

---

## 24. Telas do Produto

| # | Tela | Conteúdo principal |
|---|---|---|
| 1 | Login | Autenticação, recuperação de senha, MFA, seleção de organização |
| 2 | Dashboard | Receita, despesas, resultado, saldo, contas futuras, gráficos, alertas, insights de IA |
| 3 | Conexões Bancárias | Bancos, contas, status, última sincronização, conectar/sincronizar |
| 4 | Extratos | Transações com filtros por CNPJ, banco, período, categoria, status |
| 5 | Detalhamento do Lançamento | Dados bancários, classificação, confiança, histórico, ação do analista |
| 6 | Conciliação | Conciliados, sugestões, pendências, divergências |
| 7 | Plano de Contas | Categorias, subcategorias, regras, centros de custo |
| 8 | Fluxo de Caixa | Realizado, previsto, calendário, saldo projetado |
| 9 | DRE | Receita, custos, despesas, resultado |
| 10 | Histórico / Analytics | Evolução, comparações, indicadores, CNPJs |
| 11 | Central de IA | Transações classificadas, confiança, pendências, insights, histórico de aprendizado |
| 12 | Alertas | Alertas financeiros, de conciliação, de integração e de IA |
| 13 | Multi-CNPJ | Empresas, receitas, despesas, resultados, consolidado |
| 14 | Configurações | Usuários, permissões, CNPJs, bancos, plano de contas, limites, regras |

---

## 25. Arquitetura Funcional (de negócio/produto)

```
API Bancária
↓
Open Finance
↓
Extrato Bruto
↓
Normalização / Depuração
↓
Motor de Conciliação
↓
IA de Classificação
↓
Plano de Contas
↓
Consolidação por CNPJ
↓
┌───────────────┬───────────────┐
↓                               ↓
Fluxo de Caixa                  DRE
↓                               ↓
└───────────────┬───────────────┘
                ↓
          Indicadores
                ↓
          Alertas / IA
```

---

## 26. Arquitetura Técnica

### Frontend
- React + TypeScript;
- Vite;
- Tailwind CSS;
- shadcn/ui;
- Recharts ou ECharts para visualizações.

### Backend
- Java 21 + Spring Boot;
- Spring Web, Spring Security;
- OAuth 2.0 + JWT;
- Spring Data JPA;
- Bean Validation;
- Actuator (health checks e métricas).

### IA
- Python + FastAPI;
- scikit-learn (classificação base);
- XGBoost, se necessário para ganho de acurácia;
- LLM para tarefas de linguagem natural (classificação de casos ambíguos, geração de insights) — **a escolha de provedor/modelo deve ser validada quanto a custo, latência e requisitos de segurança de dados financeiros**.

### Banco de dados
- PostgreSQL.

### Cache
- Redis.

### Mensageria
- RabbitMQ inicialmente;
- Kafka como possível evolução em escala (quando o volume de eventos justificar).

### Testes
- JUnit + Mockito (backend Java);
- Pytest (serviços Python);
- Testcontainers (testes de integração com banco/mensageria reais).

### DevOps
- GitHub + GitHub Actions (CI/CD);
- Docker;
- SonarQube (qualidade de código).

> **Opção recomendada → motivo → alternativa → quando usar:**
> RabbitMQ é recomendado no início por simplicidade operacional e adequação ao volume esperado do MVP. Kafka é a alternativa quando o volume de eventos e a necessidade de replay/streaming de dados crescerem significativamente (ex.: múltiplos milhões de transações/dia, necessidade de pipelines de analytics em tempo real).

---

## 27. Arquitetura AWS

### Fluxo de entrada

```
Usuário
↓
CloudFront
↓
S3 (frontend estático)
↓
ALB
↓
ECS Fargate
↓
Spring Boot
```

### Serviços em ECS Fargate

```
ECS Fargate
├── Spring Boot API
├── AI Service
├── Classification Worker
├── Reconciliation Worker
└── DRE/Finance Worker
```

### Demais serviços AWS

| Camada | Serviço |
|---|---|
| Banco de dados | RDS PostgreSQL |
| Cache | ElastiCache Redis |
| Fila | SQS |
| Agendamento/eventos | EventBridge |
| Armazenamento de arquivos | S3 |
| Autenticação | Amazon Cognito |
| Segredos | AWS Secrets Manager |
| Criptografia | AWS KMS |
| Logs | CloudWatch |
| Registro de imagens | Amazon ECR |
| Rede | VPC |

> As capacidades exatas, limites de serviço e formas de configuração de cada serviço AWS devem ser confirmadas na **documentação oficial da AWS vigente no momento da implementação**, já que features e limites evoluem com o tempo.

---

## 28. Segurança

Camadas de segurança recomendadas:

- **VPC** com subnets públicas (ALB) e privadas (ECS, RDS, Redis);
- **Security Groups** restritivos por serviço;
- **IAM** com privilégio mínimo por função/serviço;
- **Secrets Manager** para credenciais e chaves de API bancárias;
- **KMS** para criptografia gerenciada;
- **TLS** em trânsito;
- **Criptografia em repouso** (RDS, S3);
- **Autenticação** via Cognito + MFA;
- **Autorização** via RBAC (papéis: administrador, analista, gestor, auditor, etc.);
- **Audit log** para toda alteração financeira relevante (ver seção 23).

### Topologia recomendada

```
Internet
↓
ALB
↓
Private Subnet
├── ECS
├── RDS
└── Redis
```

> **Princípio inegociável:** o banco de dados nunca deve ser exposto diretamente à internet.

Dados financeiros são sensíveis por natureza — a segurança deve ser considerada **desde a arquitetura**, não como camada adicionada depois.

---

## 29. Mensageria e Processamento Assíncrono

Processamentos pesados (classificação em lote, conciliação, geração de DRE) não devem bloquear a API.

```
Open Finance
↓
5.000 transações
↓
SQS
↓
Worker de IA
↓
Worker de Conciliação
↓
Worker de DRE
```

### Eventos e automações (EventBridge)

- Sincronização diária com bancos;
- Processamento programado de classificação;
- Fechamento diário;
- Geração de indicadores;
- Tarefas automáticas recorrentes.

**Step Functions** deve ser considerado apenas quando houver necessidade real de orquestração complexa entre múltiplas etapas com dependências condicionais — não deve ser adotado por padrão.

---

## 30. CI/CD

- Repositório no GitHub, com branches protegidas;
- GitHub Actions para pipeline de build, teste (JUnit/Pytest/Testcontainers) e análise estática (SonarQube);
- Build de imagens Docker publicadas no Amazon ECR;
- Deploy para ECS Fargate via pipeline automatizado, com stages de homologação e produção;
- Gate de qualidade: testes e análise SonarQube devem passar antes de deploy em produção.

---

## 31. Observabilidade

- **CloudWatch** para logs centralizados de todos os serviços (API, workers, IA);
- **Actuator** (Spring Boot) expondo métricas de saúde e performance;
- Métricas de negócio específicas (ex.: tempo médio de classificação, taxa de conciliação automática) devem ser expostas como métricas customizadas, não apenas métricas técnicas de infraestrutura;
- Alertas operacionais (ex.: fila SQS crescendo, latência da API) separados dos alertas de negócio (seção 21), mas monitorados no mesmo painel de observabilidade.

---

## 32. Banco de Dados

### Entidades principais

```
organizations
companies
users
roles
bank_connections
bank_accounts
transactions
transaction_classifications
reconciliation_records
chart_of_accounts
categories
subcategories
cost_centers
ai_predictions
ai_feedback
financial_rules
cash_flow
dre_records
alerts
audit_logs
```

### Relacionamentos principais

- `organizations` 1:N `companies` (CNPJs);
- `companies` 1:N `bank_accounts`;
- `bank_accounts` 1:N `bank_connections` (histórico de conexões Open Finance);
- `bank_accounts` 1:N `transactions`;
- `transactions` 1:1 (ou 1:N histórico) `transaction_classifications`;
- `transaction_classifications` N:1 `categories` / `subcategories`, que por sua vez pertencem a `chart_of_accounts`;
- `transactions` N:1 `cost_centers` (quando aplicável);
- `transactions` 1:N `reconciliation_records` (histórico de tentativas de conciliação);
- `ai_predictions` associada a `transactions`, registrando sugestões e scores de confiança, com `ai_feedback` capturando correções humanas para retroalimentar o modelo;
- `financial_rules` associada a `organizations`/`companies`, parametrizando limites gerenciais (ex.: mercadorias + mão de obra / receita);
- `cash_flow` e `dre_records` como visões consolidadas derivadas de `transactions` + `transaction_classifications`, sempre marcadas com a dimensão temporal usada (competência ou caixa);
- `alerts` referenciando a entidade de origem (transação, CNPJ, regra violada);
- `audit_logs` referenciando qualquer entidade alterada, com usuário, timestamp e diffs de valor/classificação.

---

## 33. MVP

O MVP não deve implementar tudo simultaneamente. Escopo recomendado:

1. Login;
2. Cadastro de CNPJ;
3. Conexão com banco real/sandbox;
4. Importação de extrato;
5. Normalização;
6. Classificação por IA;
7. Plano de contas;
8. Revisão humana;
9. Conciliação;
10. Dashboard;
11. Fluxo de caixa;
12. DRE gerencial básica;
13. Histórico;
14. Alertas básicos.

> **Recomendação:** iniciar com **um banco real/sandbox** e **dados simulados para os demais**, caso as integrações reais completas não estejam disponíveis no momento da implementação. Isso permite validar toda a cadeia de valor (normalização → conciliação → IA → DRE) sem depender de todas as integrações bancárias reais desde o dia um.

---

## 34. Roadmap

### Fase 2
- Múltiplos bancos reais;
- Múltiplos CNPJs em produção;
- Aprendizado histórico mais robusto;
- Regras financeiras configuráveis pelo usuário final;
- Calendário financeiro;
- Previsão de caixa.

### Fase 3
- ML avançado para classificação;
- Insights de IA (módulo analítico/generativo);
- Detecção de anomalias;
- Previsões financeiras;
- Classificação automática com maior precisão e menor necessidade de revisão humana.

### Fase 4
- Integrações com ERPs;
- Maior automação de processos de BPO;
- APIs para parceiros/terceiros;
- Escalabilidade horizontal ampliada;
- Analytics avançado (ex.: benchmarking entre CNPJs/segmentos).

---

## 35. KPIs (Métricas de Sucesso do Produto)

| KPI | Meta/Referência |
|---|---|
| Tempo de fechamento financeiro | 45 dias → atualização diária |
| % de transações classificadas automaticamente | A definir por piloto |
| % de transações que exigem revisão humana | A definir por piloto |
| Taxa de acerto da classificação (vs. correção humana) | A definir por piloto |
| Taxa de conciliação automática | A definir por piloto |
| Quantidade de divergências identificadas | Monitorado continuamente |
| Tempo médio de processamento por lote | A definir por piloto |
| Tempo de sincronização bancária | A definir por piloto |
| Quantidade de CNPJs processados | Escala do produto |
| Redução de trabalho manual (horas/analista) | A definir por piloto |
| Diferença entre caixa projetado e realizado | Indicador de qualidade da previsão |

---

## 36. Riscos e Limitações

- **Disponibilidade e escopo de dados do Open Finance** variam por instituição financeira e podem mudar; qualquer integração específica precisa ser validada na documentação oficial vigente antes de compromissos de prazo.
- **A IA de classificação não deve ser tratada como 100% autônoma** — casos de baixa confiança, novos fornecedores ou descrições ambíguas exigem revisão humana; automação total desde o início é um risco de qualidade de dados financeiros.
- **DRE gerencial não substitui a DRE contábil formal** — decisões fiscais/contábeis continuam dependendo da contabilidade responsável pela empresa.
- **Regras gerenciais (ex.: limite de mercadorias + mão de obra) são políticas do negócio**, não verdades universais — devem ser configuráveis e revisadas periodicamente pelo cliente.
- **Consolidação multi-CNPJ com eliminação de intercompany** é uma área que exige validação contábil/societária específica, especialmente à medida que o grupo empresarial cresce em complexidade.
- **Segurança de dados financeiros** é um requisito não negociável; qualquer atraso na implementação de controles de segurança (VPC, IAM, criptografia, auditoria) representa risco elevado, dado o caráter sensível dos dados tratados.
- **Escala de mensageria (RabbitMQ → Kafka)** deve ser decidida com base em volume real observado, não antecipada sem necessidade, evitando complexidade arquitetural prematura.

---

## 37. Princípios Arquiteturais (Resumo)

1. Dados financeiros são sensíveis.
2. IA não deve substituir completamente a validação humana.
3. Toda classificação relevante precisa ser rastreável.
4. Integrações bancárias devem ser desacopladas (padrão `BankConnector`).
5. Open Finance é fonte de dados, não regra de negócio.
6. DRE e fluxo de caixa são conceitos diferentes.
7. Competência e caixa não devem ser confundidos.
8. O plano de contas deve ser configurável.
9. Regras gerenciais devem ser parametrizáveis.
10. Multi-CNPJ deve estar presente no modelo desde o início.
11. Processamentos pesados devem ser assíncronos.
12. Segurança deve ser considerada desde a arquitetura.
13. O sistema deve permitir auditoria de alterações.
14. O MVP deve ser implementável sem depender de todas as integrações bancárias reais.
15. Não adicionar microsserviços apenas por estética arquitetural.

---

*Este documento serve como base para documentação de projeto, reunião com stakeholders, apresentação acadêmica, definição de MVP, arquitetura, backlog, modelagem de banco de dados e validação de regras de negócio. Pontos que dependem de documentação bancária, regulatória (Open Finance Brasil) ou de normas contábeis devem ser confirmados junto às fontes oficiais vigentes antes da implementação.*
