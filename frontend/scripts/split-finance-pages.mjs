import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')
const srcPath = path.join(root, 'pages', 'fin', 'FinancePages.tsx')
const backupPath = path.join(root, 'pages', 'fin', 'FinancePages.full.tsx')

if (!fs.existsSync(backupPath) && fs.readFileSync(srcPath, 'utf8').includes('export function PlanoPage')) {
  fs.copyFileSync(srcPath, backupPath)
}
const sourcePath = fs.existsSync(backupPath) ? backupPath : srcPath
const lines = fs.readFileSync(sourcePath, 'utf8').split(/\r?\n/)
const features = path.join(root, 'features')

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

const header = lines.slice(0, 9).join('\n')

mkdirp(path.join(features, 'plano-contas'))
fs.writeFileSync(
  path.join(features, 'plano-contas', 'pages.tsx'),
  `${header}\n\n${lines.slice(10, 75).join('\n')}\n`,
)

mkdirp(path.join(features, 'contas'))
fs.writeFileSync(
  path.join(features, 'contas', 'billsOf.ts'),
  `import type { ScheduleItem } from '@/domain/types'

${lines.slice(76, 79).join('\n')}
`,
)
const contasHeader = `${header}
import { billsOf } from '@/features/contas/billsOf'
`
fs.writeFileSync(
  path.join(features, 'contas', 'pages.tsx'),
  `${contasHeader}\n${lines.slice(80, 213).join('\n')}\n`,
)

mkdirp(path.join(features, 'fluxo-caixa'))
fs.writeFileSync(path.join(features, 'fluxo-caixa', 'pages.tsx'), `${header}\n\n${lines.slice(214, 284).join('\n')}\n`)

mkdirp(path.join(features, 'dre'))
fs.writeFileSync(
  path.join(features, 'dre', 'dreLines.ts'),
  `import { statementFor } from '@/domain/finance'

${lines.slice(285, 298).join('\n')}
`,
)
const dreHeader = `${header.replace("import { addDays, balance, buildAlerts, cashProjected, cashRealized, categoryLabel, lastMonth, statementFor } from '@/domain/finance'", "import { statementFor } from '@/domain/finance'")}
import { DRE_LINES } from '@/features/dre/dreLines'
`
fs.writeFileSync(
  path.join(features, 'dre', 'pages.tsx'),
  `${dreHeader}\n\n${lines.slice(299, 343).join('\n')}\n`,
)

mkdirp(path.join(features, 'analytics'))
fs.writeFileSync(path.join(features, 'analytics', 'pages.tsx'), `${header}\n\n${lines.slice(344, 376).join('\n')}\n`)

mkdirp(path.join(features, 'alertas'))
fs.writeFileSync(path.join(features, 'alertas', 'pages.tsx'), `${header}\n\n${lines.slice(377).join('\n')}\n`)

fs.writeFileSync(
  srcPath,
  `export { PlanoPage, CentrosPage, RegrasClassPage } from '@/features/plano-contas/pages'

export {
  ContasPagarPage,
  ContasReceberPage,
  ContaDetalhePage,
  ContaFormPage,
  AgendaPage,
} from '@/features/contas/pages'

export { FluxoPage, CalendarioPage } from '@/features/fluxo-caixa/pages'

export { DrePage, DreComparativaPage } from '@/features/dre/pages'

export { AnalyticsPage } from '@/features/analytics/pages'

export { AlertasPage } from '@/features/alertas/pages'
`,
)

console.log('Split FinancePages into features/')
