# Checklist de extração (frontend)

## Concluído

| Módulo | `pages/` (reexport) | `features/` |
|--------|---------------------|-------------|
| Operação | `pages/ops/WorkPages.tsx` | documentos, extratos, conciliacao, ia, transactions |
| Financeiro | `pages/fin/FinancePages.tsx` | plano-contas, contas, fluxo-caixa, dre, analytics, alertas |
| Configurações | `pages/conf/ConfigPages.tsx` | `configuracao/core`, `empresa`, `integracoes`, `auditoria` |
| App shell | — | `app/routes`, `app/guards`, `app/providers` |
| UI | — | `components/ui/*` |

## Pendente

| Módulo | Arquivo atual | Ação sugerida |
|--------|---------------|---------------|
| Dashboard | `pages/dash/DashboardPages.tsx` | `features/dashboard/pages.tsx` + hooks de série |
| Empresa / contexto | `pages/emp/EmpPages.tsx` | `features/empresa/pages.tsx` |
| Auth | `pages/auth/AuthPages.tsx` | `features/auth/pages.tsx` (opcional) |
| Shell | `components/layout/AppShell.tsx` (~390 linhas) | `navConfig.ts`, `ScopePeriodBar.tsx` |
| Conciliação (dentro da feature) | `conciliacao/pages.tsx` (~470 linhas) | componentes `ConciliacaoIaPorCategoriaTable`, etc. |
| Documentos | `documentos/pages.tsx` (~415 linhas) | modais e listagem em componentes |

## Scripts

- `scripts/split-work-pages.mjs` — regenerar split de ops (requer backup `WorkPages.full.tsx` manual).
- `scripts/split-finance-pages.mjs` — idem para fin (backup `FinancePages.full.tsx`).
- `scripts/split-config-pages.mjs` — idem para conf (backup `ConfigPages.full.tsx`).

## Próximo passo recomendado

1. Migrar `DashboardPages.tsx` (mesmo padrão de reexport).
2. Lazy load em `app/routes.tsx` por barrel (`import('@/features/contas/pages')`).
