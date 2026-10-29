import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/views/layouts/AuthLayout'
import { LandingPage } from '@/views/pages/marketing/LandingPage'
import {
  AuthenticatorPage,
  LoginPage,
  MfaPage,
  PasswordChangedPage,
  RecoverPage,
  SessionExpiredPage,
  SsoPage,
} from '@/views/pages/auth/AuthPages'
import { EmpComparePage, EmpCompaniesPage, EmpGroupPage, EmpSelectPage } from '@/views/pages/emp/EmpPages'
import { DashboardPage, PendenciasPage } from '@/views/pages/dash/DashboardPages'
import {
  ConciliacaoCategoriaDrillPage,
  ConciliacaoDetalhePage,
  ConciliacaoListaPage,
  ConciliacaoPage,
  ConexoesPage,
  DocumentoDetalhePage,
  DocumentoFormPage,
  DocumentosPage,
  ExtratoDetalhePage,
  ExtratosPage,
  ImportarExtratoPage,
  IaAprendizadoPage,
  IaFilaPage,
  IaHomePage,
  IaInsightsPage,
  IaRevisaoPage,
  OperacaoDetalhePage,
  OperacaoFormPage,
  OperacoesPage,
} from '@/views/pages/ops/WorkPages'
import {
  AgendaPage,
  AlertasPage,
  AnalyticsPage,
  CalendarioPage,
  CentrosPage,
  ContaDetalhePage,
  ContaFormPage,
  ContasPagarPage,
  ContasReceberPage,
  DreComparativaPage,
  DrePage,
  FluxoPage,
  PlanoPage,
  RegrasClassPage,
} from '@/views/pages/fin/FinancePages'
import {
  AuditoriaPage,
  BancosPage,
  CnpjFormPage,
  CnpjsPage,
  ConfigHomePage,
  ContasBancariasPage,
  CredenciaisPage,
  IaConfigPage,
  PreferenciasPage,
  LimitesPage,
  MoedaPage,
  OpenFinancePage,
  OrganizacaoPage,
  PerfilPage,
  PermissoesPage,
  PlanoPadraoPage,
  RegrasFinPage,
  SegurancaPage,
  UsuarioEditarPage,
  UsuariosPage,
} from '@/views/pages/conf/ConfigPages'
import { AuthedOutlet, ProtectedRoute } from './guards'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar-senha" element={<RecoverPage />} />
        <Route path="/verificacao" element={<MfaPage />} />
        <Route path="/authenticator" element={<AuthenticatorPage />} />
        <Route path="/sso" element={<SsoPage />} />
        <Route path="/senha-alterada" element={<PasswordChangedPage />} />
        <Route path="/sessao-expirada" element={<SessionExpiredPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthedOutlet />}>
          <Route path="/contexto" element={<EmpSelectPage />} />
          <Route path="/visao-grupo" element={<EmpGroupPage />} />
          <Route path="/empresas" element={<EmpCompaniesPage />} />
          <Route path="/comparar-empresas" element={<EmpComparePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/operacoes" element={<OperacoesPage />} />
          <Route path="/operacoes/nova" element={<OperacaoFormPage mode="criar" />} />
          <Route path="/operacoes/:id/editar" element={<OperacaoFormPage mode="editar" />} />
          <Route path="/operacoes/:id" element={<OperacaoDetalhePage />} />
          <Route path="/pendencias" element={<PendenciasPage />} />
          <Route path="/documentos" element={<DocumentosPage />} />
          <Route path="/documentos/manual" element={<DocumentoFormPage mode="manual" />} />
          <Route path="/documentos/xml" element={<DocumentoFormPage mode="xml" />} />
          <Route path="/documentos/:id" element={<DocumentoDetalhePage />} />
          <Route path="/conexoes" element={<ConexoesPage />} />
          <Route path="/extratos" element={<ExtratosPage />} />
          <Route path="/extratos/importar" element={<ImportarExtratoPage />} />
          <Route path="/extratos/:id" element={<ExtratoDetalhePage />} />
          <Route path="/conciliacao" element={<ConciliacaoPage />} />
          <Route path="/conciliacao/pendencias" element={<ConciliacaoListaPage />} />
          <Route path="/conciliacao/categorias/:grupo" element={<ConciliacaoCategoriaDrillPage />} />
          <Route path="/conciliacao/categorias/:grupo/:sub" element={<ConciliacaoCategoriaDrillPage />} />
          <Route path="/conciliacao/categorias/:grupo/:sub/:folha" element={<ConciliacaoCategoriaDrillPage />} />
          <Route path="/conciliacao/:id" element={<ConciliacaoDetalhePage />} />
          <Route path="/ia" element={<IaHomePage />} />
          <Route path="/ia/fila" element={<IaFilaPage />} />
          <Route path="/ia/revisao/:id" element={<IaRevisaoPage />} />
          <Route path="/ia/aprendizado" element={<IaAprendizadoPage />} />
          <Route path="/ia/insights" element={<IaInsightsPage />} />
          <Route path="/plano-de-contas" element={<PlanoPage />} />
          <Route path="/centros-de-custo" element={<CentrosPage />} />
          <Route path="/regras-classificacao" element={<RegrasClassPage />} />
          <Route path="/contas-a-pagar" element={<ContasPagarPage />} />
          <Route path="/contas-a-pagar/nova" element={<ContaFormPage kind="pagar" mode="criar" />} />
          <Route path="/contas-a-pagar/:id" element={<ContaDetalhePage kind="pagar" />} />
          <Route path="/contas-a-pagar/:id/editar" element={<ContaFormPage kind="pagar" mode="editar" />} />
          <Route path="/contas-a-receber" element={<ContasReceberPage />} />
          <Route path="/contas-a-receber/nova" element={<ContaFormPage kind="receber" mode="criar" />} />
          <Route path="/contas-a-receber/:id" element={<ContaDetalhePage kind="receber" />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/fluxo-de-caixa" element={<FluxoPage />} />
          <Route path="/calendario" element={<CalendarioPage />} />
          <Route path="/dre" element={<DrePage />} />
          <Route path="/dre/comparativa" element={<DreComparativaPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/alertas" element={<AlertasPage />} />
          <Route path="/configuracoes" element={<ConfigHomePage />} />
          <Route path="/configuracoes/perfil" element={<PerfilPage />} />
          <Route path="/configuracoes/preferencias" element={<PreferenciasPage />} />
          <Route path="/configuracoes/seguranca" element={<SegurancaPage />} />
          <Route path="/configuracoes/usuarios" element={<UsuariosPage />} />
          <Route path="/configuracoes/usuarios/:id" element={<UsuarioEditarPage />} />
          <Route path="/configuracoes/permissoes" element={<PermissoesPage />} />
          <Route path="/configuracoes/organizacao" element={<OrganizacaoPage />} />
          <Route path="/configuracoes/cnpjs" element={<CnpjsPage />} />
          <Route path="/configuracoes/cnpjs/novo" element={<CnpjFormPage />} />
          <Route path="/configuracoes/cnpjs/:id" element={<CnpjFormPage />} />
          <Route path="/configuracoes/bancos" element={<BancosPage />} />
          <Route path="/configuracoes/contas" element={<ContasBancariasPage />} />
          <Route path="/configuracoes/open-finance" element={<OpenFinancePage />} />
          <Route path="/configuracoes/erp" element={<Navigate to="/configuracoes/open-finance" replace />} />
          <Route path="/configuracoes/credenciais" element={<CredenciaisPage />} />
          <Route path="/configuracoes/ia" element={<IaConfigPage />} />
          <Route path="/configuracoes/limites" element={<LimitesPage />} />
          <Route path="/configuracoes/regras" element={<RegrasFinPage />} />
          <Route path="/configuracoes/moeda" element={<MoedaPage />} />
          <Route path="/configuracoes/plano-padrao" element={<PlanoPadraoPage />} />
          <Route path="/configuracoes/auditoria" element={<AuditoriaPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
