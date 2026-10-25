# Paris Devs — frontend

Website interno de gestão financeira do Grupo Paris 6. Stack do design brief: React, TypeScript, Vite, Tailwind CSS e Recharts.

## Arquitetura (componentes)

- **`src/app/`** — bootstrap: `App`, `routes`, `providers`, guards de rota.
- **`src/pages/`** — uma rota por módulo; orquestram layout e reexportam features quando necessário.
- **`src/features/`** — domínio de produto: ops (`documentos`, `extratos`, `conciliacao`, `ia`, `transactions`), fin (`plano-contas`, `contas`, `fluxo-caixa`, `dre`, `analytics`, `alertas`) e config (`configuracao/core`, `empresa`, `integracoes`, `auditoria`).
- **`src/components/ui/`** — primitivos reutilizáveis (Button, Card, Table…); **`components/layout/`** e **`components/charts/`** — shell e gráficos.
- **`src/domain/`** + **`src/lib/`** — regras e utilitários sem React; **`src/state/`** — contexto global; **`src/data/`** — fixtures.

Regra: UI → features → pages → app; domain/lib não importam componentes.

## Como rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. A landing está em `/`; o sistema, após o login, em `/dashboard`. Sem cadastro público: entre com um e-mail das fixtures, por exemplo `gabriela.verissimo@paris6.com.br` ou `marcelo.santos@paris6.com.br`, e qualquer senha. SSO e MFA são simulados.

Wiki do repositório: [`../wiki/Home.md`](../wiki/Home.md).

## Contas de demonstração

| Pessoa | E-mail | Perfil |
|---|---|---|
| Marcelo Santos | marcelo.santos@paris6.com.br | Gestor |
| Gabriela Veríssimo | gabriela.verissimo@paris6.com.br | Analista |
| Ana Souza | ana.souza@paris6.com.br | Administrador |
| Patrícia Rocha | patricia.rocha@paris6.com.br | Auditor |

## Telas

As rotas cobrem os IDs do briefing (`AUTH-*`, `EMP-*`, `DASH-*`, `DOC-*`, `EXT-*`, `CONC-*`, `IA-*`, `PC-*`, `FIN-*`, `FC-*`, `DRE-*`, `ANA-*`, `ALT-*`, `CONF-*`). Estados da mesma tela (dashboard consolidado, DRE por CNPJ, filtros de alerta) reutilizam a página pai, como a planilha descreve.
