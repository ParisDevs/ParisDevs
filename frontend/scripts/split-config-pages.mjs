import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')
const srcPath = path.join(root, 'pages', 'conf', 'ConfigPages.tsx')
const backupPath = path.join(root, 'pages', 'conf', 'ConfigPages.full.tsx')

if (!fs.existsSync(backupPath) && fs.readFileSync(srcPath, 'utf8').includes('export function ConfigHomePage')) {
  fs.copyFileSync(srcPath, backupPath)
}
const sourcePath = fs.existsSync(backupPath) ? backupPath : srcPath
const lines = fs.readFileSync(sourcePath, 'utf8').split(/\r?\n/)
const features = path.join(root, 'features')

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

const header = lines.slice(0, 5).join('\n')

mkdirp(path.join(features, 'configuracao', 'core'))
fs.writeFileSync(path.join(features, 'configuracao', 'core', 'pages.tsx'), `${header}\n\n${lines.slice(6, 158).join('\n')}\n`)

mkdirp(path.join(features, 'configuracao', 'empresa'))
fs.writeFileSync(path.join(features, 'configuracao', 'empresa', 'pages.tsx'), `${header}\n\n${lines.slice(159, 245).join('\n')}\n`)

mkdirp(path.join(features, 'configuracao', 'integracoes'))
fs.writeFileSync(path.join(features, 'configuracao', 'integracoes', 'pages.tsx'), `${header}\n\n${lines.slice(246, 380).join('\n')}\n`)

mkdirp(path.join(features, 'configuracao', 'auditoria'))
fs.writeFileSync(path.join(features, 'configuracao', 'auditoria', 'pages.tsx'), `${header}\n\n${lines.slice(381).join('\n')}\n`)

fs.writeFileSync(
  srcPath,
  `export {
  ConfigHomePage,
  PerfilPage,
  SegurancaPage,
  UsuariosPage,
  UsuarioEditarPage,
  PermissoesPage,
  OrganizacaoPage,
} from '@/features/configuracao/core/pages'

export {
  CnpjsPage,
  CnpjFormPage,
  BancosPage,
  ContasBancariasPage,
  OpenFinancePage,
} from '@/features/configuracao/empresa/pages'

export {
  ErpPage,
  CredenciaisPage,
  IaConfigPage,
  LimitesPage,
  RegrasFinPage,
  MoedaPage,
  PlanoPadraoPage,
} from '@/features/configuracao/integracoes/pages'

export { AuditoriaPage } from '@/features/configuracao/auditoria/pages'
`,
)

console.log('Split ConfigPages into features/configuracao/')
