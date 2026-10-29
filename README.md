# Paris Devs

Sistema interno de gestão financeira do **Grupo Paris 6**.

Integra Open Finance (ou extrato importado), conciliação bancária, classificação assistida por IA, fluxo de caixa e **DRE gerencial** no mesmo recorte — uma empresa ou o grupo.

A meta é reduzir o fechamento de cerca de **45 dias em planilha** para uma **visão diária** de caixa e resultado, sem tratar transferência interna como receita ou despesa.

| | |
|---|---|
| Cliente | Grupo Paris 6 · Cultura & Gastronomia |
| Tipo | Website interno (sem cadastro público) |
| Turma | ADS A · 3º semestre · Grupo 9 |
| Frontend | React 19 (JSX, MVVM) + Vite 8 |
| API | Spring Boot 4.1.1 · Java 21 · PostgreSQL · JWT |

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

Cargos no banco: `ADMINISTRADOR`, `CONTADOR`, `FINANCEIRO`, `GERENTE`.

### O que o sistema não faz

- Não substitui a DRE **contábil/fiscal**. A visão é gerencial.
- Não trata **transferência interna** como receita ou despesa.
- Open Finance, SSO e MFA são **simulados**. Não há Spring Security nem BCrypt.

### Empresas de demonstração (seed)

| Unidade | Endereço | CNPJ |
|---|---|---|
| Paris 6 Classique (Matriz 24h) | Rua Haddock Lobo, 1240 – Jardins, São Paulo – SP | `12345678000190` |
| Paris 6 Vaudeville | Rua Haddock Lobo, 1159 – Cerqueira César, São Paulo – SP | `98765432000110` |
| Paris 6 (Aeroporto de Guarulhos) | Terminal 3, Embarque Internacional – Guarulhos – SP | `11222333000181` |
| Paris 6 Petit (Shopping Anália Franco) | Av. Regente Feijó, 1739 – São Paulo – SP | `44555666000172` |
| Paris 6 Petit (Shopping Cidade São Paulo) | Av. Paulista, 1230 – Bela Vista, São Paulo – SP | `77888999000163` |
| Paris 6 Grande SP | Rua José Versolato, 111 – São Bernardo do Campo – SP | `15678912000104` |

Contas de seed: Itaú, XP, BTG Pactual, Bradesco e Santander (uma inativa). Operações de **nov/2025 a out/2026**.

---

## Estado do repositório

| Pasta | Papel |
|---|---|
| [`frontend/`](frontend/) | Website React (JSX MVVM). Consome a API nas telas listadas abaixo. |
| [`backend/`](backend/) | API Spring Boot + PostgreSQL + JWT + Swagger. |
| [`wiki/`](wiki/) | Wiki: produto, uso, rotas, frontend, backend, domínio. |
| [`docs/`](docs/) | Especificação de produto e design brief. |

### Ligado à API

Login, dashboard, operações, conciliação, usuários, organização (filiais) e contas bancárias (cadastro e agrupamento em Bancos).

### Ainda local (fixtures / `localStorage`)

Extratos, documentos, DRE, fluxo de caixa, alertas, conexões (Open Finance simulado), IA, contas a pagar/receber e parâmetros locais de configuração.

Onde a especificação fala de AWS, mensageria ou Open Finance real, trate como **destino**, não como código já entregue.

---

## Como rodar

Os dois processos precisam estar no ar: PostgreSQL, API (`:8080`) e Vite (`:5173`).

### 1. PostgreSQL

Crie o banco **`PARIS_DEVS`** e o usuário **`springuser`** / senha **`spring`** (os mesmos de `backend/src/main/resources/application.properties`).

O Hibernate usa `ddl-auto=update` e **não executa** `schema.sql` nem `data.sql`. Sem o seed, a API sobe com tabelas vazias e o login falha.

Na primeira vez (ou depois de dropar o banco), rode no Postgres, nesta ordem:

1. [`backend/src/main/resources/schema.sql`](backend/src/main/resources/schema.sql)
2. [`backend/src/main/resources/data.sql`](backend/src/main/resources/data.sql)

### 2. Backend (API)

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

API em `http://localhost:8080`. Swagger em `http://localhost:8080/swagger-ui.html` (Authorize com Bearer).

### 3. Frontend

Requisito: **Node.js 20+**.

```bash
cd frontend
npm install
npm run dev
```

Abre em `http://localhost:5173` (ou a próxima porta livre, por exemplo `5174`). Com `VITE_API_URL` vazio, o Vite faz proxy dos endpoints da API para `:8080`.

| Comando | Efeito |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Bundle de produção |
| `npm run preview` | Serve o `dist/` |
| `npm run lint` | Oxlint |

Landing: `/`. Sistema após o login: `/dashboard`.

---

## Como entrar

Não há cadastro público. Senha em texto puro no banco (sem BCrypt). O login devolve JWT; as demais rotas da API exigem `Authorization: Bearer`.

1. `/` → **Acessar sistema**, ou vá a `/login`.
2. E-mail e senha da tabela abaixo.
3. Abre `/dashboard`.

Idioma do login: Português (Brasil) ou English, no canto da barra.

SSO (`/sso`) e MFA (`/verificacao`) existem como telas de demonstração e **não** emitem JWT.

| Pessoa | E-mail | Senha | Cargo |
|---|---|---|---|
| Carlos Silva | `carlos@techsolutions.com` | `senha123` | Administrador |
| Ana Souza | `ana@techsolutions.com` | `senha456` | Financeiro |
| Pedro Santos | `pedro@inovacaodigital.com` | `senha789` | Gerente |

Sessão: `pd.usuario` e `pd.token` no `localStorage`. Token vale 8 horas. 401 limpa a sessão e manda para `/login?motivo=expirada`.

---

## Recorte, período e atalhos

- **Topbar:** grupo ou filial e mês (`YYYY-MM`). O recorte vale para dashboard, operações, conciliação e contas.
- **Menu:** Operação, Análise, Configuração. A lista rola; **Sair** e o Grupo Paris 6 ficam no rodapé.
- **Sair:** confirma e encerra a sessão.
- **Assistente (IA):** botão circular no canto inferior direito. Localiza saldo, DRE, conciliação, classificação e conexões — não classifica sozinho.

---

## Módulos e rotas

Rotas públicas não exigem sessão. As demais passam por `ProtectedRoute` (usuário **e** token) e o `AppShell`.

### Públicas

| Caminho | Tela |
|---|---|
| `/` | Landing |
| `/login` | Entrar (API + JWT) |
| `/recuperar-senha` | Recuperar ou atualizar senha |
| `/verificacao` | Duas etapas (demo) |
| `/authenticator` | Autenticador (demo) |
| `/sso` | SSO (provedor não configurado) |
| `/senha-alterada` | Senha atualizada |
| `/sessao-expirada` | Sessão encerrada |

### Contexto e operação

| Caminho | Tela | Dados |
|---|---|---|
| `/dashboard` | Visão financeira do dia | API |
| `/operacoes` | Lançamentos (CRUD) | API |
| `/conciliacao` | Conciliação sobre `operacao` | API |
| `/configuracoes/usuarios` | Cadastro de usuários | API |
| `/configuracoes/organizacao` | Empresas / filiais | API |
| `/configuracoes/contas` | Cadastro de contas bancárias | API |
| `/configuracoes/bancos` | Instituições (leitura) | API |
| `/conexoes` | Instituições e consentimento | fixture |
| `/extratos` · `/extratos/importar` | Movimentações e importação | fixture |
| `/documentos` | Central de documentos | fixture |
| `/ia` · `/ia/fila` · `/ia/revisao/:id` | Classificação e revisão humana | fixture |
| `/contas-a-pagar` · `/contas-a-receber` | Agenda | fixture |

### Análise e configuração

| Caminho | Tela | Dados |
|---|---|---|
| `/dre` · `/dre/comparativa` | DRE gerencial | fixture |
| `/fluxo-de-caixa` | Caixa realizado | fixture |
| `/analytics` · `/alertas` | Indicadores e alertas | fixture |
| `/plano-de-contas` | Plano gerencial | fixture |
| `/configuracoes/*` | Demais parâmetros locais | misto |

Mapa completo: [wiki/Rotas.md](wiki/Rotas.md).

---

## Regras de domínio

Regras de produto em `frontend/src/models/domain/`. Persistência e contrato HTTP em `backend/` e `frontend/src/models/api/`.

- **Caixa / extrato:** o que entrou ou saiu na conta, na data bancária.
- **DRE gerencial:** só lançamento **classificado**. Não é o saldo bancário.
- Transferência interna, aplicação e resgate **não** entram como receita ou despesa.
- Documento e extrato **não** compartilham a mesma lista.
- Conta inativa **não** entra no saldo consolidado como zero.
- Operação: `valor` sempre positivo; `tipoOperacao` `RECEBIMENTO` ou `PAGAMENTO` (no banco, ordinal 0/1).
- Conciliação deste slice: categoria da operação (`deriveRecon`); sem tabela extra e sem matching de documento.
- Catálogo de bancos (`institutions.js`) é desacoplado do motor de conciliação.

Texto integral: especificação, seções 10–23 · [wiki/Dominio-e-regras.md](wiki/Dominio-e-regras.md).

---

## Arquitetura

```
navegador  →  frontend (React JSX, MVVM)
                 ↳ models/api  →  Spring Boot :8080 (JWT Bearer)
                 ↳ models/fixtures + localStorage (telas ainda locais)

API         →  PostgreSQL PARIS_DEVS
                 ↳ filial → usuario
                 ↳ filial → conta_bancaria → operacao
```

Princípios (especificação): desacoplar banco específico do motor; não fixar no código limite, plano ou provedor que pertence à configuração; trilha em toda reclassificação; processamentos pesados, quando existirem, assíncronos.

---

## Frontend

Pasta [`frontend/`](frontend/). Stack: **React 19**, **JSX**, **Vite 8**, **Tailwind CSS v4**, **Recharts**, **React Router 7**, **axios**, **lucide-react**.

```
frontend/src/
  app/           rotas, guards, providers
  views/         telas, layout e primitivos de UI
  viewmodels/    estado e orquestração por módulo
  models/        api/, domain/, fixtures, sessão
  lib/           formatação pt-BR e i18n do login
  styles/        tokens.css
```

README técnico: [`frontend/README.md`](frontend/README.md).

---

## Backend

Pasta [`backend/`](backend/). **Spring Boot** 4.1.1, **Java 21**, JPA, Bean Validation, PostgreSQL, springdoc-openapi 3.1.0, jjwt 0.12.6. Sem `spring-boot-starter-security`.

Pacote: `com.parisdevs.api`.

| Recurso | Caminho | Situação |
|---|---|---|
| Login | `POST /usuarios/login` | público; devolve `{ token, usuario }` |
| Usuários | `/usuarios` | CRUD |
| Filiais | `/filiais` | CRUD |
| Contas bancárias | `/contasBancarias` | CRUD |
| Operações | `/operacoes` | CRUD |
| Dashboard | `GET /dashboard/kpis` | KPIs do recorte (`inicio`, `fim`) |
| Swagger | `/swagger-ui.html` | OpenAPI; Authorize Bearer |

Demais rotas da API exigem JWT. CORS libera `http://localhost:5173` e `5174`.

Camadas: `controller` → `service` → `repository`, com `dto`, `mapper`, `entity`, `enums` e exceções de domínio. Filtro JWT: `JwtAuthFilter` (`OncePerRequestFilter`).

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
