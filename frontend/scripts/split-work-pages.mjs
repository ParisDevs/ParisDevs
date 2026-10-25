import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')
const workPath = path.join(root, 'pages', 'ops', 'WorkPages.tsx')
const backupPath = path.join(root, 'pages', 'ops', 'WorkPages.full.tsx')
if (!fs.existsSync(backupPath) && fs.existsSync(workPath) && fs.readFileSync(workPath, 'utf8').includes('export function DocumentosPage')) {
  fs.copyFileSync(workPath, backupPath)
}
const sourcePath = fs.existsSync(backupPath) ? backupPath : workPath
const lines = fs.readFileSync(sourcePath, 'utf8').split(/\r?\n/)
const header = lines.slice(0, 28).join('\n')
const features = path.join(root, 'features')

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

mkdirp(path.join(features, 'transactions', 'components'))
mkdirp(path.join(features, 'documentos', 'components'))

fs.writeFileSync(
  path.join(features, 'transactions', 'components', 'ReconStatusBadge.tsx'),
  `import { Badge, Tip } from '@/components/ui'
import { reconLabels, reconTips } from '@/data/fixtures'
import type { Transaction } from '@/domain/types'

function reconTone(r: Transaction['recon']) {
  if (r === 'conciliado') return 'success' as const
  if (r === 'divergencia' || r === 'duplicidade') return 'danger' as const
  if (r === 'sugestao') return 'info' as const
  if (r === 'interna') return 'neutral' as const
  return 'warning' as const
}

${lines.slice(77, 86).join('\n')}
`,
)

fs.writeFileSync(
  path.join(features, 'transactions', 'txHistory.ts'),
  `import { accounts, mechanismLabels, reconLabels } from '@/data/fixtures'
import { accountLabel, categoryLabel } from '@/domain/finance'
import type { AuditEntry, Transaction } from '@/domain/types'

${lines.slice(29, 68).join('\n')}
`,
)

fs.writeFileSync(
  path.join(features, 'documentos', 'components', 'Dropzone.tsx'),
  `import { CloudUpload } from 'lucide-react'
import { cn } from '@/lib/cn'

${lines.slice(102, 154).join('\n')}
`,
)

const docHeader =
  header +
  `
import { Dropzone } from '@/features/documentos/components/Dropzone'
`
fs.writeFileSync(
  path.join(features, 'documentos', 'pages.tsx'),
  `${docHeader}

${lines.slice(87, 101).join('\n')}

${lines.slice(155, 562).join('\n')}
`,
)

const extrHeader =
  header.replace("import { GastosPorCategoriaCard } from '@/components/charts'\n", '') +
  `
import { ReconStatusBadge } from '@/features/transactions/components/ReconStatusBadge'
import { txHistory } from '@/features/transactions/txHistory'
`
mkdirp(path.join(features, 'extratos'))
fs.writeFileSync(path.join(features, 'extratos', 'pages.tsx'), `${extrHeader}\n\n${lines.slice(563, 743).join('\n')}\n`)

const concHeader =
  header +
  `
import { ReconStatusBadge } from '@/features/transactions/components/ReconStatusBadge'
`
mkdirp(path.join(features, 'conciliacao'))
fs.writeFileSync(path.join(features, 'conciliacao', 'pages.tsx'), `${concHeader}\n\n${lines.slice(744, 1214).join('\n')}\n`)

const iaHeader = header.replace("import { GastosPorCategoriaCard } from '@/components/charts'\n", '')
mkdirp(path.join(features, 'ia'))
fs.writeFileSync(path.join(features, 'ia', 'pages.tsx'), `${iaHeader}\n\n${lines.slice(1215).join('\n')}\n`)

fs.writeFileSync(
  workPath,
  `export {
  DocumentosPage,
  DocumentoDetalhePage,
  DocumentoFormPage,
} from '@/features/documentos/pages'

export { ExtratosPage, ExtratoDetalhePage } from '@/features/extratos/pages'

export {
  ConciliacaoPage,
  ConciliacaoCategoriaDrillPage,
  ConciliacaoListaPage,
  ConciliacaoDetalhePage,
} from '@/features/conciliacao/pages'

export {
  IaHomePage,
  IaFilaPage,
  IaRevisaoPage,
  IaAprendizadoPage,
  IaInsightsPage,
} from '@/features/ia/pages'
`,
)

console.log('Split WorkPages into features/')
