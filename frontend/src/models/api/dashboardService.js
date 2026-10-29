import  api  from './client'


export async function buscarKpisDashboard(
  inicio,
  fim,
  idFilial,
) {
  const resposta = await api.get('/dashboard/kpis', {
    params: {
      inicio,
      fim,
      ...(idFilial != null ? { idFilial } : {}),
    },
  })

  return resposta.data
}