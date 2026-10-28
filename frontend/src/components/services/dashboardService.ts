import  api  from './api'
import type { DashboardKpi } from '@/types/DashboardKpi'

export async function buscarKpisDashboard(
  inicio: string,
  fim: string,
  idFilial?: number,
): Promise<DashboardKpi> {
  const resposta = await api.get<DashboardKpi>('/dashboard/kpis', {
    params: {
      inicio,
      fim,
      idFilial,
    },
  })

  return resposta.data
}