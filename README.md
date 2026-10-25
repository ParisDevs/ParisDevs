# Paris Devs

Sistema interno de gestão financeira do **Grupo Paris 6**.

Integra Open Finance (ou extrato importado), conciliação bancária, classificação assistida por IA, fluxo de caixa e **DRE gerencial** no mesmo recorte — uma empresa ou o grupo.

A meta é reduzir o fechamento de cerca de **45 dias em planilha** para uma **visão diária** de caixa e resultado, sem tratar transferência interna como receita ou despesa.

| | |
|---|---|
| Cliente | Grupo Paris 6 · Cultura & Gastronomia |
| Tipo | Website interno (convite do administrador; sem cadastro público) |
| Turma | ADS A · 3º semestre · Grupo 9 |
| Demo | Frontend com fixtures + `localStorage` |
| API | Spring Boot em construção; ainda não alimenta as telas |

Documentação complementar: [wiki](wiki/Home.md) · [especificação](docs/especificacao-plataforma-conciliacao-financeira.md) · [design brief](docs/design-brief-paris-devs.md)

---

## Sumário

1. [O que o produto faz](#o-que-o-produto-faz)
2. [Estado do repositório](#estado-do-repositório)
3. [Como rodar](#como-rodar)
4. [Como entrar](#como-entrar)
5. [Recorte, período e atalhos](#recorte-período-e-atalhos)
6. [Módulos e rotas](#módulos-e-rotas)
7. [Regras de domínio](#regras-de-domínio)
8. [Arquitetura](#arquitetura)
9. [Frontend](#frontend)
10. [Backend](#backend)
11. [Identidade visual](#identidade-visual)
12. [Documentos](#documentos)
13. [Equipe](#equipe)

---

## O que o produto faz

Não é um leitor de extrato. É a operação financeira do grupo:

```
banco / extrato → normalização → conciliação → classificação (IA + analista) →
plano de contas → consolidação por CNPJ ou grupo → caixa e DRE → alertas
```

1. O titular autoriza o banco (Open Finance) **ou** o analista importa o extrato.
2. O sistema normaliza o lançamento e tenta conciliar com documento.
3. Regras, histórico e IA sugerem a conta do plano.
4. O analista confirma, altera ou rejeita (**human-in-the-loop**).
5. Fluxo de caixa e DRE gerencial atualizam no recorte escolhido.

### Papéis

| Papel | Uso |
|---|---|
| Gestor / sócio | Saldo, caixa e DRE do dia, no CNPJ ou no grupo |
| Analista / contador | Concilia, classifica e revisa a fila da IA |
| Administrador | Convite, permissão, CNPJ, banco, Open Finance e auditoria |
| Auditor | Lê a trilha e os recortes; não altera classificação |

### O que o sistema não faz

- Não substitui a DRE **contábil/fiscal**. A visão é gerencial.
- Não trata **transferência interna** como receita ou despesa.
- Neste ambiente, Open Finance, SSO e MFA são **simulados**.

### Empresas de demonstração

| Código | Fantasia | Segmento |
|---|---|---|
| CNPJ 01 | Paris Centro | Restaurante |
| CNPJ 02 | Paris Bistrô | Restaurante |
| CNPJ 03 | Paris Distribuição | Distribuição de alimentos |

Contas de seed: Itaú, XP, BTG Pactual, Bradesco e Santander. Catálogo de conexão inclui também Nubank, Banco do Brasil, Caixa, Inter, C6, Sicoob e Sicredi.

Período das fixtures: abril–setembro de 2026. Data de referência: **2026-10-02**.

---

## Estado do repositório

| Pasta | Papel |
|---|---|
| [`frontend/`](frontend/) | Website React. É a aplicação demonstrável. |
| [`backend/`](backend/) | API Spring Boot (usuários, filiais; contas/operações incompletas). |
| [`wiki/`](wiki/) | Wiki: produto, uso, rotas, frontend, backend, domínio. |
| [`docs/`](docs/) | Especificação de produto e design brief. |

O frontend **não** chama a API. Estado da demo: fixtures + chaves `pd.*` no `localStorage`.

Onde a especificação fala de AWS, mensageria ou Open Finance real, trate como **destino**, não como código já entregue.

---

## Como rodar

### Frontend (aplicação)

Requisito: **Node.js 20+**.

```bash
cd frontend
npm install
npm run dev
```

Abre em `http://localhost:5173` (ou a próxima porta livre, por exemplo `5174`).

| Comando | Efeito |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Typecheck (`tsc --noEmit`) + bundle |
| `npm run preview` | Serve o `dist/` |
| `npm run lint` | Oxlint |

Landing: `/`. Sistema após o login: `/dashboard`.

### Backend (API)

Requisito: **Java 21**. Maven Wrapper incluso.

```bash
cd backend
./mvnw spring-boot:run
```

Windows:

```bash
cd backend
mvnw.cmd spring-boot:run
```

H2 em memória + springdoc (OpenAPI). As telas **não** consomem esses endpoints ainda.

---

## Como entrar

Não há cadastro público. Use um e-mail da tabela e **qualquer senha**.

1. `/` → **Acessar sistema**, ou vá a `/login`.
2. E-mail da fixture + senha qualquer.
3. Verificação em duas etapas: qualquer código de **6 dígitos**.
4. Escolha o contexto (grupo ou um CNPJ).
5. Abre `/dashboard`.

Idioma do login: Português (Brasil) ou English, no canto da barra.

SSO: tela `/sso` preparada, sem provedor. Há opção de continuar com usuário de demonstração.

| Pessoa | E-mail | Perfil |
|---|---|---|
| Marcelo Santos | `marcelo.santos@paris6.com.br` | Gestor |
| Gabriela Veríssimo | `gabriela.verissimo@paris6.com.br` | Analista |
| Ana Souza | `ana.souza@paris6.com.br` | Administrador |
| Patrícia Rocha | `patricia.rocha@paris6.com.br` | Auditor |

Para voltar ao seed: limpe o `localStorage` deste origin (chaves `pd.*`).

---

## Recorte, período e atalhos

- **Topbar:** empresa, filial e mês. O recorte vale para saldo, extrato, conciliação e DRE.
- **Menu:** Operação, Análise, Configuração. A lista rola; **Sair** e o Grupo Paris 6 ficam no rodapé.
- **Sair:** confirma e encerra a sessão.
- **Assistente (IA):** botão circular no canto inferior direito. Localiza saldo, DRE, conciliação, classificação e conexões — não classifica sozinho.

---

## Módulos e rotas

Rotas públicas não exigem sessão. As demais passam por `ProtectedRoute` e o `AppShell`.

### Públicas

| Caminho | Tela |
|---|---|
| `/` | Landing |
| `/login` | Entrar |
| `/recuperar-senha` | Recuperar ou atualizar senha |
| `/verificacao` | Duas etapas |
| `/authenticator` | Autenticador (demo) |
| `/sso` | SSO (provedor não configurado) |
| `/senha-alterada` | Senha atualizada |
| `/sessao-expirada` | Sessão encerrada |

### Contexto e operação

| Caminho | Tela |
|---|---|
| `/contexto` | Escolher grupo ou CNPJ |
| `/dashboard` | Visão financeira do dia |
| `/conexoes` | Instituições e consentimento |
| `/extratos` · `/extratos/importar` | Movimentações e importação |
| `/documentos` | Central de documentos (lista distinta do extrato) |
| `/conciliacao` | Conciliação e pendências |
| `/ia` · `/ia/fila` · `/ia/revisao/:id` | Classificação e revisão humana |
| `/contas-a-pagar` · `/contas-a-receber` | Agenda |

### Análise e configuração

| Caminho | Tela |
|---|---|
| `/dre` · `/dre/comparativa` | DRE gerencial |
| `/fluxo-de-caixa` | Caixa realizado |
| `/analytics` · `/alertas` | Indicadores e alertas |
| `/plano-de-contas` | Plano gerencial |
| `/configuracoes/*` | Perfil, usuários, CNPJs, Open Finance, IA, auditoria |

Mapa completo: [wiki/Rotas.md](wiki/Rotas.md).

---

## Regras de domínio

Implementadas em `frontend/src/domain/` — não devem viver só no JSX.

- **Caixa / extrato:** o que entrou ou saiu na conta, na data bancária.
- **DRE gerencial:** só lançamento **classificado**. Não é o saldo bancário.
- Transferência interna, aplicação e resgate **não** entram como receita ou despesa.
- Documento e extrato **não** compartilham a mesma lista.
- Conta desconectada ou com consentimento expirado **não** entra no saldo como zero; fica indisponível.
- Toda reclassificação pede motivo e vai para a **auditoria**.
- Catálogo de bancos (`institutions.ts`) é desacoplado do motor de conciliação.

Texto integral: especificação, seções 10–23 · [wiki/Dominio-e-regras.md](wiki/Dominio-e-regras.md).

---

## Arquitetura

```
navegador  →  frontend (React, estado local)
                 ↳ domain/ calcula DRE, caixa, conciliação e alertas nas fixtures

API Spring  →  usuários e filiais (H2)
                 ↳ contas e operações ainda sem contrato completo
```

Princípios (especificação): desacoplar banco específico do motor; não fixar no código limite, plano ou provedor que pertence à configuração; trilha em toda reclassificação; processamentos pesados, quando existirem, assíncronos.

---

## Frontend

Pasta [`frontend/`](frontend/). Stack: **React 19**, **TypeScript**, **Vite 8**, **Tailwind CSS v4**, **Recharts**, **React Router 7**.

```
frontend/src/
  app/           rotas, guards, providers
  pages/         uma tela por rota (auth, dash, ops, fin, conf, marketing)
  features/      documentos, extratos, conciliação, IA, DRE, contas…
  components/    ui/, layout/, charts/, BankLogo, BrandMark, AiChatbot
  domain/        regras sem React
  state/         AppContext + persistência local
  data/          fixtures
  lib/           formatação pt-BR e i18n do login
  styles/        tokens.css
```

Regra de importação: UI → features → pages → app. `domain/` e `lib/` não importam componentes.

README técnico: [`frontend/README.md`](frontend/README.md).

---

## Backend

Pasta [`backend/`](backend/). **Spring Boot** (parent 4.1.1), **Java 21**, JPA, Bean Validation, H2, springdoc-openapi.

Pacote: `com.parisdevs.api`.

| Recurso | Caminho | Situação |
|---|---|---|
| Usuários | `/usuarios` | CRUD |
| Filiais | `/filiais` | CRUD |
| Operações | `/operacoes` | Controller criado; implementação pendente |
| Contas bancárias | — | Controller vazio |

Camadas: `controller` → `service` → `repository`, com `dto`, `mapper`, `entity`, `enums` e exceções de domínio.

Próximo passo: autenticar de fato, expor contas e operações, e substituir as fixtures do frontend por HTTP — sem copiar regra de DRE ou limite para código quando isso é configuração.

---

## Identidade visual

- Sidebar floresta `#062921`, canvas sage `#f3f7f5`, ouro `#c9b07a` na marca.
- Aplicação: **Inter**. Landing: **Manrope** + **Cormorant Garamond**.
- Landing em `/` com o texto **PARIS DEVS** (sem o selo do restaurante).
- Selo do grupo no rodapé do menu interno (`public/brand/paris6.png`).
- Logotipos de banco em `frontend/public/banks/`.

---

## Documentos

| Arquivo | Uso |
|---|---|
| [wiki/Home.md](wiki/Home.md) | Índice da wiki |
| [docs/especificacao-plataforma-conciliacao-financeira.md](docs/especificacao-plataforma-conciliacao-financeira.md) | Produto, regras, arquitetura-alvo |
| [docs/design-brief-paris-devs.md](docs/design-brief-paris-devs.md) | Personas, tokens, telas (Figma/Stitch) |
| [frontend/README.md](frontend/README.md) | Arquitetura do website |
| [frontend/docs/estrutura-checklist.md](frontend/docs/estrutura-checklist.md) | Extração de páginas em features |

---

## Equipe

**Grupo 9** · **ADS A** · 3º semestre

- Erick da Silva Victorino
- Felipe Barbosa do Patrocínio
- Giovanni Angel Alipaz Chambi
- Josué Alvarez Avendano
- Kayke Rodrigues da Silva
- Nicolly de Souza Olsak
- Samara da Silva Freitas Farias

Cliente de referência: **Grupo Paris 6**.
