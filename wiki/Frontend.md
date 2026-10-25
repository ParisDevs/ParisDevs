# Frontend

Pasta [`frontend/`](../frontend/). Stack do design brief: **React 19**, **TypeScript**, **Vite 8**, **Tailwind CSS v4**, **Recharts**.

## Pastas

```
frontend/src/
  app/           rotas, guards, providers
  pages/         uma tela por rota (auth, dash, ops, fin, conf, marketing)
  features/      domínio de produto (documentos, extratos, conciliação, IA, DRE…)
  components/    ui/, layout/, charts/, BankLogo, BrandMark, AiChatbot
  domain/        regras sem React (caixa, conciliação, instituições, importação)
  state/         AppContext + persistência local
  data/          fixtures (empresas, contas, lançamentos, usuários)
  lib/           formatação pt-BR e i18n do login
  styles/        tokens.css
```

Regra de importação: UI → features → pages → app. `domain/` e `lib/` não importam componentes.

Detalhe das extrações: [`frontend/docs/estrutura-checklist.md`](../frontend/docs/estrutura-checklist.md). README técnico: [`frontend/README.md`](../frontend/README.md).

## Estado

`AppContext` hidrata a sessão e os overrides a partir de `localStorage` (`pd.*`). Fixtures em `src/data/fixtures.ts` são o seed: três CNPJs, contas (Itaú, XP, BTG, Bradesco, Santander), plano de contas e transações.

Tema claro/escuro grava em `pd.config`. Idioma do login (`pt` / `en`) em `pd.lang`.

## Identidade

- Sidebar floresta `#062921`, canvas sage `#f3f7f5`, ouro `#c9b07a` na marca.
- Tipografia da aplicação: Inter. Landing: Manrope + Cormorant Garamond.
- Logotipos de banco em `public/banks/`. Selo do grupo em `public/brand/paris6.png` (menu interno; a landing usa só o texto PARIS DEVS).

## Shell

- Menu: Operação, Análise, Configuração.
- **Sair** no rodapé do menu, com confirmação.
- Assistente de IA: botão circular fixo no canto inferior direito.
- Recorte empresa / filial / período na topbar.
