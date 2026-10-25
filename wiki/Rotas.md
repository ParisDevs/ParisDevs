# Rotas

Rotas públicas não exigem sessão. As demais passam por `ProtectedRoute` e o `AppShell`.

## Públicas

| Caminho | Tela |
|---|---|
| `/` | Landing |
| `/login` | Entrar (SSO simulado + usuário e senha) |
| `/recuperar-senha` | Recuperar ou atualizar senha |
| `/verificacao` | Código de duas etapas |
| `/authenticator` | QR do autenticador (demo) |
| `/sso` | Provedor de identidade (não configurado) |
| `/senha-alterada` | Confirmação de senha |
| `/sessao-expirada` | Sessão encerrada |

## Contexto

| Caminho | Tela |
|---|---|
| `/contexto` | Escolher grupo ou CNPJ |
| `/visao-grupo` | Visão consolidada do grupo |
| `/empresas` | Lista de CNPJs |
| `/comparar-empresas` | Comparativo |

## Operação

| Caminho | Tela |
|---|---|
| `/dashboard` | Visão financeira do dia |
| `/pendencias` | Pendências agregadas |
| `/conexoes` | Instituições e consentimento |
| `/extratos` | Movimentações observadas |
| `/extratos/importar` | Importar arquivo |
| `/extratos/:id` | Detalhe do lançamento |
| `/documentos` | Central de documentos (separada do extrato) |
| `/documentos/manual` · `/documentos/xml` | Inclusão |
| `/documentos/:id` | Detalhe |
| `/conciliacao` | Motor de conciliação |
| `/conciliacao/pendencias` | Fila |
| `/conciliacao/:id` | Detalhe |
| `/ia` | Classificação |
| `/ia/fila` | Revisão humana |
| `/ia/revisao/:id` | Decisão (aceita / altera / rejeita) |
| `/ia/aprendizado` | Histórico |
| `/ia/insights` | Insights |
| `/contas-a-pagar` · `/contas-a-receber` | Agenda financeira |

## Análise

| Caminho | Tela |
|---|---|
| `/dre` | DRE gerencial |
| `/dre/comparativa` | Comparativo de períodos |
| `/fluxo-de-caixa` | Realizado e série mensal |
| `/calendario` · `/agenda` | Vencimentos |
| `/analytics` | Indicadores |
| `/alertas` | Crítico, atenção e informação |

## Configuração

Prefixo `/configuracoes`: perfil, preferências, segurança, usuários, permissões, organização, CNPJs, bancos, contas, Open Finance, credenciais, API de IA, limites, regras, moeda, plano padrão e auditoria.

Atalhos de domínio: `/plano-de-contas`, `/centros-de-custo`, `/regras-classificacao`.

`/configuracoes/erp` redireciona para Open Finance.
