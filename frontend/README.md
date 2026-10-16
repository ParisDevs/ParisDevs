# Paris Devs — frontend

Website interno de gestão financeira do Grupo Paris 6. Stack do design brief: React, TypeScript, Vite, Tailwind CSS e Recharts.

## Como rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Sem cadastro público: entre com um e-mail das fixtures, por exemplo `gabriela.verissimo@paris6.com.br` ou `marcelo.santos@paris6.com.br`, e qualquer senha. SSO e MFA são simulados.

## Contas de demonstração

| Pessoa | E-mail | Perfil |
|---|---|---|
| Marcelo Santos | marcelo.santos@paris6.com.br | Gestor |
| Gabriela Veríssimo | gabriela.verissimo@paris6.com.br | Analista |
| Ana Souza | ana.souza@paris6.com.br | Administrador |
| Patrícia Rocha | patricia.rocha@paris6.com.br | Auditor |

## Telas

As rotas cobrem os IDs do briefing (`AUTH-*`, `EMP-*`, `DASH-*`, `DOC-*`, `EXT-*`, `CONC-*`, `IA-*`, `PC-*`, `FIN-*`, `FC-*`, `DRE-*`, `ANA-*`, `ALT-*`, `CONF-*`). Estados da mesma tela (dashboard consolidado, DRE por CNPJ, filtros de alerta) reutilizam a página pai, como a planilha descreve.
