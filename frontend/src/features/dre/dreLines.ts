import type { Statement } from '@/domain/types'

export const DRE_LINES: { key: keyof Statement; label: string; result?: boolean }[] = [
  { key: 'receitaBruta', label: 'Receita bruta' },
  { key: 'deducoes', label: '(−) Deduções' },
  { key: 'receitaLiquida', label: '= Receita líquida', result: true },
  { key: 'custos', label: '(−) Custos' },
  { key: 'lucroBruto', label: '= Lucro bruto', result: true },
  { key: 'despesasOperacionais', label: '(−) Despesas operacionais' },
  { key: 'resultadoOperacional', label: '= Resultado operacional', result: true },
  { key: 'financeiras', label: '(−) Despesas financeiras' },
  { key: 'resultadoAntesTributos', label: '= Resultado antes dos tributos', result: true },
  { key: 'tributos', label: '(−) Tributos sobre o lucro' },
  { key: 'resultadoLiquido', label: '= Resultado líquido', result: true },
]
