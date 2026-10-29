export const TIPOS_CONTA = ['Conta corrente', 'Conta investimento']

export const EMPTY_CONTA_FORM = {
  fkFilial: '',
  codigoBanco: '',
  nomeInstituicao: '',
  agencia: '',
  agenciaDigito: '',
  numeroConta: '',
  tipoConta: 'Conta corrente',
  cpfCnpjTitular: '',
  nomeTitular: '',
  ativo: true,
}

export function formFromConta(conta) {
  return {
    fkFilial: conta?.companyId != null ? String(conta.companyId) : '',
    codigoBanco: conta?.codigoBanco ?? '',
    nomeInstituicao: conta?.bank ?? '',
    agencia: conta?.agencia ?? '',
    agenciaDigito: conta?.agenciaDigito ?? '',
    numeroConta: conta?.number ?? '',
    tipoConta: conta?.tipoConta || 'Conta corrente',
    cpfCnpjTitular: conta?.cpfCnpjTitular ?? '',
    nomeTitular: conta?.nomeTitular ?? '',
    ativo: conta?.ativo !== false,
  }
}

export function validateContaForm(form) {
  if (!form.fkFilial) return 'Informe a filial.'
  if (!String(form.codigoBanco).trim()) return 'Informe o código do banco.'
  if (!String(form.nomeInstituicao).trim()) return 'Informe a instituição.'
  if (!String(form.agencia).trim()) return 'Informe a agência.'
  if (!String(form.agenciaDigito).trim()) return 'Informe o dígito da agência.'
  if (!String(form.numeroConta).trim()) return 'Informe o número da conta.'
  if (!String(form.tipoConta).trim()) return 'Informe o tipo da conta.'
  if (!String(form.cpfCnpjTitular).trim()) return 'Informe o CPF/CNPJ do titular.'
  if (!String(form.nomeTitular).trim()) return 'Informe o nome do titular.'
  if (form.ativo !== true && form.ativo !== false) return 'Informe se a conta está ativa.'
  return ''
}

export function contaPayload(form) {
  return {
    fkFilial: Number(form.fkFilial),
    codigoBanco: String(form.codigoBanco).trim(),
    nomeInstituicao: String(form.nomeInstituicao).trim(),
    agencia: String(form.agencia).trim(),
    agenciaDigito: String(form.agenciaDigito).trim(),
    numeroConta: String(form.numeroConta).trim(),
    tipoConta: String(form.tipoConta).trim(),
    cpfCnpjTitular: String(form.cpfCnpjTitular).trim(),
    nomeTitular: String(form.nomeTitular).trim(),
    ativo: form.ativo === true,
  }
}
