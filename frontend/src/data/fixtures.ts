import type {
  Account,
  AppConfig,
  AuditEntry,
  Category,
  Company,
  CostCenter,
  Document,
  ExpectedEntry,
  ScheduleItem,
  Transaction,
  User,
} from '@/domain/types'

export const TODAY = '2026-10-02'
export const MONTHS = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09']
export const GROUP_NAME = 'Grupo Paris 6'

export const companies: Company[] = [
  { id: 'c1', code: 'CNPJ 01', name: 'Paris Restaurantes Ltda', fantasy: 'Paris Centro', cnpj: '12.345.678/0001-90', segment: 'restaurante', segmentLabel: 'Restaurante', city: 'São Paulo/SP', unit: 'Loja Centro', status: 'ativo' },
  { id: 'c2', code: 'CNPJ 02', name: 'Paris Bistrô Ltda', fantasy: 'Paris Bistrô', cnpj: '12.345.678/0002-71', segment: 'restaurante', segmentLabel: 'Restaurante', city: 'São Paulo/SP', unit: 'Loja Bistrô', status: 'ativo' },
  { id: 'c3', code: 'CNPJ 03', name: 'Paris Distribuição Ltda', fantasy: 'Paris Distribuição', cnpj: '23.456.789/0001-12', segment: 'distribuicao', segmentLabel: 'Distribuição de alimentos', city: 'Guarulhos/SP', unit: 'Centro de Distribuição', status: 'ativo' },
]

export const banks: Record<string, { short: string; color: string }> = {
  Itaú: { short: 'IT', color: '#C25E0A' },
  XP: { short: 'XP', color: '#2B2F36' },
  Bradesco: { short: 'BR', color: '#B0203A' },
  Santander: { short: 'SA', color: '#B5281D' },
}

export const accounts: Account[] = [
  { id: 'a1', companyId: 'c1', bank: 'Itaú', agency: '0412', number: '12345-6', type: 'Conta corrente', balance: 86420.55, provider: 'Open Finance', status: 'ok', lastSync: '2026-10-02T06:10:00', consentUntil: '2027-03-14' },
  { id: 'a2', companyId: 'c1', bank: 'XP', agency: '0001', number: '889210-3', type: 'Conta investimento', balance: 154300, provider: 'Sandbox', status: 'ok', lastSync: '2026-10-02T06:12:00', consentUntil: '2027-01-30' },
  { id: 'a3', companyId: 'c2', bank: 'Itaú', agency: '0412', number: '22841-0', type: 'Conta corrente', balance: 18400, provider: 'Open Finance', status: 'ok', lastSync: '2026-10-02T06:11:00', consentUntil: '2027-03-14' },
  { id: 'a4', companyId: 'c2', bank: 'Bradesco', agency: '1290', number: '0045821-7', type: 'Conta corrente', balance: 6200, provider: 'Open Finance', status: 'atrasada', lastSync: '2026-09-30T05:58:00', consentUntil: '2026-12-02' },
  { id: 'a5', companyId: 'c3', bank: 'Itaú', agency: '0798', number: '33012-4', type: 'Conta corrente', balance: 212870.3, provider: 'Open Finance', status: 'ok', lastSync: '2026-10-02T06:14:00', consentUntil: '2027-05-21' },
  { id: 'a6', companyId: 'c3', bank: 'Santander', agency: '3321', number: '13002541-9', type: 'Conta corrente', balance: 41250.9, provider: 'Open Finance', status: 'erro', lastSync: '2026-09-28T06:02:00', consentUntil: '2026-09-28', note: 'Consentimento expirado. É preciso renovar a autorização no banco.' },
]

export const costCenters: CostCenter[] = [
  { id: 'CC01', name: 'Loja Centro', companyId: 'c1', type: 'Loja' },
  { id: 'CC02', name: 'Loja Bistrô', companyId: 'c2', type: 'Loja' },
  { id: 'CC03', name: 'Centro de Distribuição', companyId: 'c3', type: 'Operação' },
  { id: 'CC04', name: 'Administrativo do grupo', companyId: null, type: 'Departamento' },
]

export const chartOfAccounts: Category[] = [
  { code: 'R', name: 'Receitas', parent: null, group: 'receita' },
  { code: 'R.1', name: 'Vendas', parent: 'R', group: 'receita' },
  { code: 'R.1.1', name: 'Vendas no salão', parent: 'R.1', group: 'receita' },
  { code: 'R.1.2', name: 'Vendas delivery', parent: 'R.1', group: 'receita' },
  { code: 'R.1.3', name: 'Vendas atacado', parent: 'R.1', group: 'receita' },
  { code: 'R.2', name: 'Serviços', parent: 'R', group: 'receita' },
  { code: 'R.3', name: 'Outras receitas', parent: 'R', group: 'receita' },
  { code: 'D', name: 'Deduções', parent: null, group: 'deducao' },
  { code: 'D.1', name: 'Impostos sobre venda', parent: 'D', group: 'deducao' },
  { code: 'D.2', name: 'Devoluções e estornos', parent: 'D', group: 'deducao' },
  { code: 'C', name: 'Custos', parent: null, group: 'custo' },
  { code: 'C.1', name: 'Mercadorias', parent: 'C', group: 'custo' },
  { code: 'C.1.1', name: 'Alimentos', parent: 'C.1', group: 'custo' },
  { code: 'C.1.1.1', name: 'Hortifruti', parent: 'C.1.1', group: 'custo' },
  { code: 'C.1.1.2', name: 'Açougue', parent: 'C.1.1', group: 'custo' },
  { code: 'C.1.1.3', name: 'Padaria', parent: 'C.1.1', group: 'custo' },
  { code: 'C.1.2', name: 'Bebidas', parent: 'C.1', group: 'custo' },
  { code: 'C.1.2.1', name: 'Cerveja', parent: 'C.1.2', group: 'custo' },
  { code: 'C.1.2.2', name: 'Vinho', parent: 'C.1.2', group: 'custo' },
  { code: 'C.1.2.3', name: 'Água', parent: 'C.1.2', group: 'custo' },
  { code: 'C.1.2.4', name: 'Refrigerante', parent: 'C.1.2', group: 'custo' },
  { code: 'C.1.2.5', name: 'Suco', parent: 'C.1.2', group: 'custo' },
  { code: 'C.1.2.6', name: 'Leite', parent: 'C.1.2', group: 'custo' },
  { code: 'C.2', name: 'Mão de obra', parent: 'C', group: 'custo' },
  { code: 'O', name: 'Despesas operacionais', parent: null, group: 'despesa_operacional' },
  { code: 'O.1', name: 'Ocupação', parent: 'O', group: 'despesa_operacional' },
  { code: 'O.2', name: 'Manutenção', parent: 'O', group: 'despesa_operacional' },
  { code: 'O.2.1', name: 'Estrutura', parent: 'O.2', group: 'despesa_operacional' },
  { code: 'O.2.2', name: 'Hidráulica', parent: 'O.2', group: 'despesa_operacional' },
  { code: 'O.2.3', name: 'Elétrica', parent: 'O.2', group: 'despesa_operacional' },
  { code: 'O.2.4', name: 'Pintura', parent: 'O.2', group: 'despesa_operacional' },
  { code: 'O.2.5', name: 'Equipamentos', parent: 'O.2', group: 'despesa_operacional' },
  { code: 'O.3', name: 'Contas', parent: 'O', group: 'despesa_operacional' },
  { code: 'O.3.1', name: 'Energia', parent: 'O.3', group: 'despesa_operacional' },
  { code: 'O.3.2', name: 'Água e esgoto', parent: 'O.3', group: 'despesa_operacional' },
  { code: 'O.3.3', name: 'Telecom', parent: 'O.3', group: 'despesa_operacional' },
  { code: 'O.4', name: 'Marketing', parent: 'O', group: 'despesa_operacional' },
  { code: 'O.5', name: 'Administrativo', parent: 'O', group: 'despesa_operacional' },
  { code: 'F', name: 'Despesas financeiras', parent: null, group: 'despesa_financeira' },
  { code: 'F.1', name: 'Juros', parent: 'F', group: 'despesa_financeira' },
  { code: 'F.2', name: 'Tarifas', parent: 'F', group: 'despesa_financeira' },
  { code: 'F.3', name: 'Encargos', parent: 'F', group: 'despesa_financeira' },
  { code: 'T', name: 'Tributos sobre o lucro', parent: null, group: 'tributo' },
  { code: 'T.1', name: 'IRPJ e CSLL', parent: 'T', group: 'tributo' },
  { code: 'X', name: 'Movimentação interna', parent: null, group: 'interna' },
  { code: 'X.1', name: 'Transferência entre contas', parent: 'X', group: 'interna' },
]

function tx(
  id: string,
  accountId: string,
  date: string,
  competence: string,
  description: string,
  counterparty: string,
  document: string,
  amount: number,
  category: string | null,
  costCenter: string | null,
  confidence: number,
  mechanism: Transaction['mechanism'],
  recon: Transaction['recon'],
  extra: Partial<Transaction> = {},
): Transaction {
  const account = accounts.find((a) => a.id === accountId)!
  return {
    id,
    sourceId: `BCO-${id.slice(1).padStart(5, '0')}-${accountId.toUpperCase()}`,
    accountId,
    companyId: account.companyId,
    date,
    competence,
    description,
    counterparty,
    document,
    amount,
    category,
    costCenter,
    confidence,
    mechanism,
    recon,
    intercompany: false,
    ...extra,
  }
}

export const transactions: Transaction[] = [
  tx('t01', 'a1', '2026-09-01', '2026-09', 'ALUGUEL SET LOJA CENTRO', 'Imobiliária Lumen', 'Boleto 7781', -18000, 'O.1', 'CC01', 99, 'regra', 'conciliado'),
  tx('t02', 'a1', '2026-09-03', '2026-09', 'PAGTO FORNECEDOR AMBEV SA', 'AMBEV S.A.', 'NF 55231', -4800, 'C.1.2.1', 'CC01', 97, 'historico', 'conciliado'),
  tx('t03', 'a1', '2026-09-05', '2026-08', 'REDE CARTOES CRED LOTE 0905', 'Rede', 'Lote 0905', 32450.8, 'R.1.1', 'CC01', 98, 'regra', 'conciliado'),
  tx('t04', 'a1', '2026-09-04', '2026-09', 'FOLHA PAGTO SET', 'Folha de pagamento', 'Folha 09/26', -41200, 'C.2', 'CC01', 99, 'regra', 'conciliado'),
  tx('t05', 'a1', '2026-09-08', '2026-08', 'ENEL DISTRIB SP', 'Enel Distribuição São Paulo', 'Fatura 08/26', -3120.45, 'O.3.1', 'CC01', 99, 'regra', 'conciliado'),
  tx('t06', 'a1', '2026-09-10', '2026-09', 'TED MESMA TITULARIDADE XP', 'Paris Restaurantes Ltda', '', -10000, 'X.1', null, 99, 'regra', 'interna', { pairId: 't07' }),
  tx('t07', 'a2', '2026-09-10', '2026-09', 'TED RECEBIDA ITAU', 'Paris Restaurantes Ltda', '', 10000, 'X.1', null, 99, 'regra', 'interna', { pairId: 't06' }),
  tx('t08', 'a1', '2026-09-12', '2026-09', 'PIX ENVIADO HIDRAULICA SILVA', 'Hidráulica Silva ME', '', -1850, 'O.2.2', 'CC01', 86, 'ml', 'sugestao'),
  tx('t09', 'a1', '2026-09-17', '2026-09', 'PAGTO BOLETO 0034 9921', 'Distribuidora Vale Verde', 'Boleto 99210', -6420.1, 'C.1.1.1', 'CC01', 72, 'llm', 'divergencia'),
  tx('t10', 'a1', '2026-09-18', '2026-09', 'IFOOD REPASSE 38', 'iFood', 'Repasse 38', 18760.35, 'R.1.2', 'CC01', 97, 'historico', 'conciliado'),
  tx('t11', 'a1', '2026-09-20', '2026-09', 'TARIFA PACOTE SERVICOS', 'Itaú Unibanco', '', -189.9, 'F.2', null, 99, 'regra', 'conciliado'),
  tx('t12', 'a1', '2026-09-22', '2026-09', 'PAGTO FORNECEDOR AMBEV SA', 'AMBEV S.A.', 'NF 55231', -4800, 'C.1.2.1', 'CC01', 97, 'historico', 'duplicidade', { duplicateOf: 't02' }),
  tx('t13', 'a1', '2026-09-29', '2026-09', 'ESTORNO VENDA CARTAO', 'Rede', 'Lote 0927', -640, 'D.2', 'CC01', 82, 'ml', 'conciliado'),
  tx('t14', 'a1', '2026-10-01', '2026-09', 'REDE CARTOES CRED LOTE 1001', 'Rede', 'Lote 1001', 29870.4, 'R.1.1', 'CC01', 98, 'regra', 'conciliado'),
  tx('t15', 'a3', '2026-09-01', '2026-09', 'PAGTO PARIS DISTRIBUICAO', 'Paris Distribuição Ltda', 'NF 3310', -15200, 'C.1.1', 'CC02', 96, 'historico', 'conciliado', { intercompany: true }),
  tx('t16', 'a3', '2026-09-02', '2026-09', 'ALUGUEL BISTRO SET', 'Condomínio Jardins', 'Boleto 1209', -12500, 'O.1', 'CC02', 99, 'regra', 'conciliado'),
  tx('t17', 'a4', '2026-09-04', '2026-09', 'FOLHA PAGTO SET', 'Folha de pagamento', 'Folha 09/26', -22800, 'C.2', 'CC02', 99, 'regra', 'conciliado'),
  tx('t18', 'a3', '2026-09-06', '2026-08', 'CIELO VENDAS CREDITO', 'Cielo', 'Lote 0906', 21340, 'R.1.1', 'CC02', 98, 'regra', 'conciliado'),
  tx('t19', 'a3', '2026-09-09', '2026-09', 'VINICOLA SERRA GAUCHA', 'Vinícola Serra Gaúcha Ltda', 'NF 1203', -7350, 'C.1.2.2', 'CC02', 91, 'historico', 'conciliado'),
  tx('t20', 'a3', '2026-09-14', '2026-09', 'PIX MANUT EQUIP COZINHA', 'Frio Tec Refrigeração', 'OS 5521', -2980, 'O.2.5', 'CC02', 88, 'ml', 'sugestao'),
  tx('t21', 'a4', '2026-09-19', '2026-09', 'IOF JUROS CHEQUE ESPECIAL', 'Bradesco', '', -412.37, 'F.1', null, 95, 'regra', 'conciliado'),
  tx('t22', 'a3', '2026-09-23', '2026-09', 'PIX RECEBIDO EVENTO CORP', 'Agência Norte Eventos', '', 8900, 'R.2', 'CC02', 64, 'llm', 'pendente'),
  tx('t23', 'a3', '2026-09-25', '2026-09', 'SABESP', 'Sabesp', 'Fatura 09/26', -1287.6, 'O.3.2', 'CC02', 99, 'regra', 'conciliado'),
  tx('t24', 'a4', '2026-09-30', '2026-09', 'DEPOSITO NAO IDENTIFICADO', '', '', 3150, null, null, 35, 'llm', 'divergencia'),
  tx('t25', 'a3', '2026-10-02', '2026-10', 'PIX ENVIADO JOAO PEREIRA', 'João Pereira', '', -1200, null, null, 41, 'llm', 'pendente'),
  tx('t26', 'a5', '2026-09-01', '2026-09', 'BOLETO RECEBIDO PARIS BISTRO', 'Paris Bistrô Ltda', 'NF 3310', 15200, 'R.1.3', 'CC03', 96, 'historico', 'conciliado', { intercompany: true }),
  tx('t27', 'a5', '2026-09-04', '2026-09', 'FOLHA PAGTO SET', 'Folha de pagamento', 'Folha 09/26', -31500, 'C.2', 'CC03', 99, 'regra', 'conciliado'),
  tx('t28', 'a5', '2026-09-04', '2026-09', 'VENDA ATACADO MERCADO BOM PRECO', 'Mercado Bom Preço Ltda', 'NF 3302', 48600, 'R.1.3', 'CC03', 96, 'historico', 'conciliado'),
  tx('t29', 'a5', '2026-09-11', '2026-09', 'FRIGORIFICO BOI NOBRE', 'Frigorífico Boi Nobre S.A.', 'NF 88412', -26400, 'C.1.1.2', 'CC03', 98, 'historico', 'conciliado'),
  tx('t30', 'a6', '2026-09-18', '2026-09', 'COMBUSTIVEL FROTA', 'Auto Posto Rota 10', '', -3760.2, 'O.5', 'CC03', 78, 'ml', 'pendente'),
  tx('t31', 'a5', '2026-09-24', '2026-08', 'DARF IMPOSTOS SOBRE VENDA', 'Receita Federal', 'DARF 08/26', -9850, 'D.1', null, 99, 'regra', 'conciliado'),
  tx('t32', 'a6', '2026-09-26', '2026-09', 'META ADS CAMPANHA', 'Meta Platforms', 'Fatura 4471', -2400, 'O.4', 'CC04', 93, 'historico', 'sugestao'),
  tx('t33', 'a5', '2026-10-01', '2026-10', 'TRANSF ENTRE CONTAS SANTANDER', 'Paris Distribuição Ltda', '', -20000, 'X.1', null, 99, 'regra', 'interna', { pairId: 't34' }),
  tx('t34', 'a6', '2026-10-01', '2026-10', 'TED RECEBIDA ITAU', 'Paris Distribuição Ltda', '', 20000, 'X.1', null, 99, 'regra', 'interna', { pairId: 't33' }),
]

export const expectedEntries: ExpectedEntry[] = [
  { id: 'e1', txId: 't08', kind: 'sugestao', description: 'OS 221 — reparo hidráulico da cozinha', counterparty: 'Hidráulica Silva ME', amount: -1850, dueDate: '2026-09-12', score: 92, source: 'Contas a pagar' },
  { id: 'e2', txId: 't20', kind: 'sugestao', description: 'Manutenção da câmara fria', counterparty: 'Frio Tec Refrigeração', amount: -2980, dueDate: '2026-09-15', score: 88, source: 'Contas a pagar' },
  { id: 'e3', txId: 't32', kind: 'sugestao', description: 'Campanha de mídia set/26', counterparty: 'Meta Platforms', amount: -2400, dueDate: '2026-09-25', score: 85, source: 'Contas a pagar' },
  { id: 'e4', txId: 't09', kind: 'divergencia', description: 'Boleto 99210 — hortifrúti', counterparty: 'Distribuidora Vale Verde', amount: -6240.1, dueDate: '2026-09-15', reason: 'O valor pago é R$ 180,00 maior que o título e foi pago 2 dias após o vencimento.', source: 'Contas a pagar' },
  { id: 'e5', txId: 't24', kind: 'divergencia', description: 'Sinal de evento corporativo', counterparty: 'Agência Norte Eventos', amount: 3500, dueDate: '2026-09-30', reason: 'Depósito sem identificação, R$ 350,00 abaixo do valor esperado.', source: 'Contas a receber' },
]

export const schedule: ScheduleItem[] = [
  { id: 's01', companyId: 'c1', date: '2026-10-03', competence: '2026-10', kind: 'receber', description: 'Repasse de cartões — Rede', counterparty: 'Rede', amount: 31200, category: 'R.1.1', status: 'aberto' },
  { id: 's02', companyId: 'c1', date: '2026-10-05', competence: '2026-10', kind: 'pagar', description: 'Aluguel out/26 — Loja Centro', counterparty: 'Imobiliária Lumen', amount: -18000, category: 'O.1', status: 'aberto' },
  { id: 's03', companyId: 'c2', date: '2026-10-05', competence: '2026-10', kind: 'pagar', description: 'Aluguel out/26 — Bistrô', counterparty: 'Condomínio Jardins', amount: -12500, category: 'O.1', status: 'aberto' },
  { id: 's04', companyId: 'c1', date: '2026-10-06', competence: '2026-09', kind: 'pagar', description: 'Folha de pagamento set/26', counterparty: 'Folha de pagamento', amount: -41200, category: 'C.2', status: 'aberto' },
  { id: 's05', companyId: 'c2', date: '2026-10-06', competence: '2026-09', kind: 'pagar', description: 'Folha de pagamento set/26', counterparty: 'Folha de pagamento', amount: -22800, category: 'C.2', status: 'aberto' },
  { id: 's06', companyId: 'c3', date: '2026-10-06', competence: '2026-09', kind: 'pagar', description: 'Folha de pagamento set/26', counterparty: 'Folha de pagamento', amount: -31500, category: 'C.2', status: 'aberto' },
  { id: 's07', companyId: 'c1', date: '2026-10-07', competence: '2026-10', kind: 'receber', description: 'Repasse iFood', counterparty: 'iFood', amount: 19300, category: 'R.1.2', status: 'aberto' },
  { id: 's08', companyId: 'c1', date: '2026-10-08', competence: '2026-09', kind: 'pagar', description: 'Energia elétrica set/26', counterparty: 'Enel Distribuição São Paulo', amount: -3200, category: 'O.3.1', status: 'aberto' },
  { id: 's09', companyId: 'c2', date: '2026-10-08', competence: '2026-10', kind: 'receber', description: 'Vendas em cartão — Cielo', counterparty: 'Cielo', amount: 21800, category: 'R.1.1', status: 'aberto' },
  { id: 's10', companyId: 'c3', date: '2026-10-09', competence: '2026-10', kind: 'pagar', description: 'Compra de carnes — NF 88980', counterparty: 'Frigorífico Boi Nobre S.A.', amount: -27800, category: 'C.1.1', status: 'aberto' },
  { id: 's11', companyId: 'c3', date: '2026-10-10', competence: '2026-10', kind: 'receber', description: 'Venda atacado — NF 3341', counterparty: 'Mercado Bom Preço Ltda', amount: 49800, category: 'R.1.3', status: 'aberto' },
  { id: 's12', companyId: 'c1', date: '2026-10-14', competence: '2026-10', kind: 'pagar', description: 'Bebidas — NF 56102', counterparty: 'AMBEV S.A.', amount: -5100, category: 'C.1.2.1', status: 'aberto' },
  { id: 's13', companyId: 'c2', date: '2026-10-14', competence: '2026-10', kind: 'pagar', description: 'Vinhos — NF 1288', counterparty: 'Vinícola Serra Gaúcha Ltda', amount: -7600, category: 'C.1.2.2', status: 'aberto' },
  { id: 's14', companyId: 'c3', date: '2026-10-15', competence: '2026-10', kind: 'receber', description: 'Venda para Paris Bistrô — NF 3355', counterparty: 'Paris Bistrô Ltda', amount: 15200, category: 'R.1.3', status: 'aberto', intercompany: true },
  { id: 's15', companyId: 'c2', date: '2026-10-15', competence: '2026-10', kind: 'pagar', description: 'Compra de Paris Distribuição — NF 3355', counterparty: 'Paris Distribuição Ltda', amount: -15200, category: 'C.1.1', status: 'aberto', intercompany: true },
  { id: 's16', companyId: 'c1', date: '2026-10-17', competence: '2026-10', kind: 'receber', description: 'Repasse de cartões — Rede', counterparty: 'Rede', amount: 30500, category: 'R.1.1', status: 'aberto' },
  { id: 's17', companyId: 'c3', date: '2026-10-20', competence: '2026-09', kind: 'pagar', description: 'DARF impostos sobre venda set/26', counterparty: 'Receita Federal', amount: -10100, category: 'D.1', status: 'aberto' },
  { id: 's18', companyId: 'c2', date: '2026-10-22', competence: '2026-10', kind: 'receber', description: 'Vendas em cartão — Cielo', counterparty: 'Cielo', amount: 22400, category: 'R.1.1', status: 'aberto' },
  { id: 's20', companyId: 'c1', date: '2026-10-26', competence: '2026-10', kind: 'pagar', description: 'Manutenção preventiva do ar-condicionado', counterparty: 'Clima Frio Serviços', amount: -2650, category: 'O.2.5', status: 'aberto' },
  { id: 's21', companyId: 'c3', date: '2026-10-28', competence: '2026-10', kind: 'pagar', description: 'Combustível da frota', counterparty: 'Auto Posto Rota 10', amount: -3900, category: 'O.5', status: 'aberto' },
  { id: 's22', companyId: 'c1', date: '2026-10-30', competence: '2026-10', kind: 'receber', description: 'Repasse iFood', counterparty: 'iFood', amount: 18900, category: 'R.1.2', status: 'aberto' },
]

export type MonthlyBase = {
  receita: number
  servicos: number
  outras: number
  delivery: number
  deducoes: number
  mercadorias: number
  maoDeObra: number
  ocupacao: number
  manutencao: number
  contas: number
  marketing: number
  administrativo: number
  financeiras: number
  tributos: number
}

export const monthlyBase: Record<string, MonthlyBase> = {
  c1: { receita: 310000, servicos: 0, outras: 0.004, delivery: 0.32, deducoes: 0.06, mercadorias: 0.21, maoDeObra: 0.135, ocupacao: 0.09, manutencao: 0.025, contas: 0.05, marketing: 0.03, administrativo: 0.22, financeiras: 0.012, tributos: 0.03 },
  c2: { receita: 185000, servicos: 0.05, outras: 0.003, delivery: 0.12, deducoes: 0.06, mercadorias: 0.17, maoDeObra: 0.125, ocupacao: 0.11, manutencao: 0.022, contas: 0.05, marketing: 0.03, administrativo: 0.25, financeiras: 0.008, tributos: 0.025 },
  c3: { receita: 420000, servicos: 0, outras: 0.002, delivery: 0, deducoes: 0.09, mercadorias: 0.54, maoDeObra: 0.08, ocupacao: 0.03, manutencao: 0.01, contas: 0.012, marketing: 0.004, administrativo: 0.12, financeiras: 0.015, tributos: 0.03 },
}

export const seasonality: Record<string, number> = {
  '2026-04': 0.94, '2026-05': 0.98, '2026-06': 1, '2026-07': 1.06, '2026-08': 1.03, '2026-09': 1,
}

export const maintenanceSpike: Record<string, Record<string, number>> = { c2: { '2026-09': 1.32 } }
export const intercompanyMonthly = 15200

export const users: User[] = [
  { id: 'u1', name: 'Marcelo Santos', email: 'marcelo.santos@paris6.com.br', role: 'gestor', scope: 'Grupo', status: 'ativo', lastAccess: '2026-10-02T08:41:00', mfa: true, phone: '(11) 98800-1001' },
  { id: 'u2', name: 'Gabriela Veríssimo', email: 'gabriela.verissimo@paris6.com.br', role: 'analista', scope: 'Grupo', status: 'ativo', lastAccess: '2026-10-02T09:05:00', mfa: true, phone: '(11) 98800-1002' },
  { id: 'u3', name: 'Ana Souza', email: 'ana.souza@paris6.com.br', role: 'administrador', scope: 'Grupo', status: 'ativo', lastAccess: '2026-10-01T17:22:00', mfa: true, phone: '(11) 98800-1003' },
  { id: 'u4', name: 'Patrícia Rocha', email: 'patricia.rocha@paris6.com.br', role: 'auditor', scope: 'Grupo', status: 'ativo', lastAccess: '2026-09-29T10:15:00', mfa: true },
  { id: 'u5', name: 'Rafael Torres', email: 'rafael.torres@paris6.com.br', role: 'gestor', scope: 'CNPJ 01', status: 'inativo', lastAccess: '2026-07-12T14:03:00', mfa: false },
]

export const roleLabels: Record<string, string> = {
  administrador: 'Administrador',
  analista: 'Analista',
  gestor: 'Gestor',
  auditor: 'Auditor',
}

export const permissionModules = [
  'Dashboard', 'Conexões bancárias', 'Extratos', 'Conciliação', 'Central de IA',
  'Fluxo de caixa', 'DRE', 'Plano de contas', 'Documentos', 'Configurações', 'Auditoria',
]

export const permissions: Record<string, Array<'edit' | 'view' | 'none'>> = {
  administrador: ['edit', 'edit', 'edit', 'edit', 'edit', 'edit', 'edit', 'edit', 'edit', 'edit', 'view'],
  analista: ['view', 'view', 'edit', 'edit', 'edit', 'view', 'view', 'view', 'edit', 'none', 'none'],
  gestor: ['view', 'view', 'view', 'view', 'view', 'edit', 'view', 'view', 'view', 'none', 'none'],
  auditor: ['view', 'view', 'view', 'view', 'view', 'view', 'view', 'view', 'view', 'none', 'view'],
}

export const defaultConfig: AppConfig = {
  thresholds: { auto: 95, suggest: 80 },
  syncMaxHours: 24,
  financialRules: [
    { id: 'fr1', name: 'Mercadorias + mão de obra ≤ percentual da receita', segment: 'restaurante', segmentLabel: 'Restaurante', limit: 30, active: true },
    { id: 'fr2', name: 'Mercadorias + mão de obra ≤ percentual da receita', segment: 'distribuicao', segmentLabel: 'Distribuição de alimentos', limit: 65, active: true },
  ],
  expenseIncreaseAlert: 20,
  revenueDropAlert: 5,
  useRules: true,
  useHistory: true,
  requireHuman: true,
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
}

export const classificationRules = [
  { id: 'cr1', field: 'Contraparte', operator: 'é igual a', value: 'Sabesp', category: 'O.3.2', costCenter: null as string | null, hits: 41 },
  { id: 'cr2', field: 'Contraparte', operator: 'contém', value: 'Enel', category: 'O.3.1', costCenter: null, hits: 38 },
  { id: 'cr3', field: 'Descrição', operator: 'contém', value: 'FOLHA PAGTO', category: 'C.2', costCenter: null, hits: 54 },
  { id: 'cr4', field: 'Descrição', operator: 'contém', value: 'TARIFA', category: 'F.2', costCenter: null, hits: 112 },
  { id: 'cr5', field: 'Contraparte', operator: 'é igual a', value: 'Rede', category: 'R.1.1', costCenter: null, hits: 260 },
  { id: 'cr6', field: 'Descrição', operator: 'contém', value: 'MESMA TITULARIDADE', category: 'X.1', costCenter: null, hits: 19 },
]

export const auditSeed: AuditEntry[] = [
  { at: '2026-09-14T15:32:00', user: 'Gabriela Veríssimo', action: 'Reclassificação', entity: 'Lançamento t19', before: 'Mercadorias > Bebidas', after: 'Mercadorias > Bebidas > Vinho', reason: 'Ajuste de subcategoria conforme NF 1203.' },
  { at: '2026-09-22T10:05:00', user: 'Sistema', action: 'Duplicidade detectada', entity: 'Lançamento t12', before: '—', after: 'Marcado como possível duplicidade de t02', reason: 'Mesmo identificador de documento, valor e contraparte.' },
  { at: '2026-09-25T09:40:00', user: 'Ana Souza', action: 'Regra gerencial alterada', entity: 'Regra fr2', before: 'Limite 60%', after: 'Limite 65%', reason: 'Revisão do orçamento do segmento de distribuição.' },
  { at: '2026-09-28T06:02:00', user: 'Sistema', action: 'Falha de sincronização', entity: 'Santander 13002541-9', before: 'Consentimento ativo', after: 'Consentimento expirado', reason: 'Resposta do conector bancário.' },
  { at: '2026-10-01T16:12:00', user: 'Gabriela Veríssimo', action: 'Classificação aceita', entity: 'Lançamento t19', before: 'Sugestão da IA (91%)', after: 'Mercadorias > Bebidas > Vinho', reason: '' },
]

export const aiMonthly = [
  { month: '2026-04', total: 4410, auto: 0.58, suggest: 0.24, review: 0.18, accuracy: 0.902 },
  { month: '2026-05', total: 4580, auto: 0.62, suggest: 0.22, review: 0.16, accuracy: 0.914 },
  { month: '2026-06', total: 4630, auto: 0.65, suggest: 0.21, review: 0.14, accuracy: 0.921 },
  { month: '2026-07', total: 4975, auto: 0.67, suggest: 0.2, review: 0.13, accuracy: 0.93 },
  { month: '2026-08', total: 4890, auto: 0.69, suggest: 0.19, review: 0.12, accuracy: 0.936 },
  { month: '2026-09', total: 4812, auto: 0.71, suggest: 0.18, review: 0.11, accuracy: 0.942 },
]

export const aiFeedback = [
  { at: '2026-10-01T16:12:00', user: 'Gabriela Veríssimo', counterparty: 'Vinícola Serra Gaúcha Ltda', suggested: 'C.1.2.2', final: 'C.1.2.2', result: 'aceita' },
  { at: '2026-09-30T11:47:00', user: 'Gabriela Veríssimo', counterparty: 'Frio Tec Refrigeração', suggested: 'O.2.1', final: 'O.2.5', result: 'alterada' },
  { at: '2026-09-29T14:20:00', user: 'Gabriela Veríssimo', counterparty: 'Auto Posto Rota 10', suggested: 'O.5', final: 'O.5', result: 'aceita' },
  { at: '2026-09-27T09:03:00', user: 'Gabriela Veríssimo', counterparty: 'Agência Norte Eventos', suggested: 'R.3', final: 'R.2', result: 'alterada' },
  { at: '2026-09-26T17:31:00', user: 'Gabriela Veríssimo', counterparty: 'João Pereira', suggested: 'O.5', final: '—', result: 'rejeitada' },
]

export const documents: Document[] = [
  { id: 'd1', number: 'NF 55231', supplier: 'AMBEV S.A.', date: '2026-09-03', amount: -4800, origin: 'XML', status: 'conciliado', companyId: 'c1', txId: 't02' },
  { id: 'd2', number: 'NF 1203', supplier: 'Vinícola Serra Gaúcha Ltda', date: '2026-09-09', amount: -7350, origin: 'ERP', status: 'processado', companyId: 'c2', txId: 't19' },
  { id: 'd3', number: 'Boleto 99210', supplier: 'Distribuidora Vale Verde', date: '2026-09-15', amount: -6240.1, origin: 'Arquivo', status: 'inconsistente', companyId: 'c1', txId: 't09', note: 'O valor pago é R$ 180,00 maior que o título.' },
  { id: 'd4', number: 'OS 5521', supplier: 'Frio Tec Refrigeração', date: '2026-09-14', amount: -2980, origin: 'Manual', status: 'pendente', companyId: 'c2', txId: 't20' },
  { id: 'd5', number: 'NF 88412', supplier: 'Frigorífico Boi Nobre S.A.', date: '2026-09-11', amount: -26400, origin: 'XML', status: 'conciliado', companyId: 'c3', txId: 't29' },
  { id: 'd6', number: 'Fatura 4471', supplier: 'Meta Platforms', date: '2026-09-26', amount: -2400, origin: 'Arquivo', status: 'processado', companyId: 'c3', txId: 't32' },
]

export const mechanismLabels: Record<string, string> = {
  regra: 'Regra determinística',
  historico: 'Histórico do fornecedor',
  ml: 'Modelo de machine learning',
  llm: 'Linguagem',
  manual: 'Analista',
}

export const reconLabels: Record<string, string> = {
  conciliado: 'Conciliado',
  sugestao: 'Sugestão',
  pendente: 'Pendente',
  divergencia: 'Divergente',
  duplicidade: 'Duplicidade',
  interna: 'Movimentação interna',
}

export const reconTips: Partial<Record<keyof typeof reconLabels, string>> = {
  interna: 'Não contabilizar como receita/despesa.',
}

export const classLabels: Record<string, string> = {
  automatica: 'Classificada automaticamente',
  sugerida: 'Aguardando revisão',
  revisao: 'Baixa confiança',
  aprovada: 'Reclassificada',
  nao_classificada: 'Sem classificação',
}
