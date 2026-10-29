# Paris Devs — frontend

Website interno de gestão financeira do Grupo Paris 6. Stack: React 19 (JSX), Vite 8, Tailwind CSS v4, Recharts, React Router 7 e axios.

A API Spring Boot precisa estar em `http://localhost:8080`. Com `VITE_API_URL` vazio, o Vite faz proxy de `/usuarios`, `/filiais`, `/contasBancarias`, `/operacoes`, `/dashboard/kpis` e `/dre`.

## Arquitetura (MVVM)

- **`src/app/`** — rotas, guards e providers.
- **`src/views/`** — telas, layout e primitivos de UI.
- **`src/viewmodels/`** — estado e orquestração por módulo.
- **`src/models/`** — `api/` (HTTP), `domain/` (regras), fixtures e sessão (`pd.usuario`, `pd.token`).
- **`src/lib/`** — formatação pt-BR e i18n do login.

Telas na API: login, dashboard, operações, conciliação, usuários, perfil (foto), organização, contas bancárias e DRE diária (D-1 + histórico). Extratos, DRE comparativa, fluxo de caixa, alertas e conexões ainda usam fixture / `localStorage`.

Tema claro/escuro: `pd.config.theme` (`light` | `dark`). Escuro usa paleta preta; claro mantém sage/floresta. Toggle na topbar e em Preferências.

## Como rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. A landing está em `/`; o sistema, após o login, em `/dashboard`. Sem cadastro público.

Wiki do repositório: [`../wiki/Home.md`](../wiki/Home.md). Passo a passo completo (Postgres + seed + API): [`../README.md`](../README.md).

## Contas de demonstração

| Pessoa | E-mail | Senha | Cargo |
|---|---|---|---|
| Carlos Silva | carlos@techsolutions.com | senha123 | Administrador |
| Ana Souza | ana@techsolutions.com | senha456 | Financeiro |
| Pedro Santos | pedro@inovacaodigital.com | senha789 | Gerente |

SSO e MFA são telas de demonstração e não emitem JWT.

## Telas

As rotas cobrem os IDs do briefing (`AUTH-*`, `EMP-*`, `DASH-*`, `DOC-*`, `EXT-*`, `CONC-*`, `IA-*`, `PC-*`, `FIN-*`, `FC-*`, `DRE-*`, `ANA-*`, `ALT-*`, `CONF-*`). Estados da mesma tela (dashboard consolidado, DRE por CNPJ, filtros de alerta) reutilizam a página pai, como a planilha descreve.
