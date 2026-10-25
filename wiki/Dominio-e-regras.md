# Domínio e regras

As regras abaixo valem no frontend (`src/domain/`) e na especificação. Não devem ser “escondidas” em componente de tela.

## Caixa e competência

- **Caixa / extrato:** o que entrou ou saiu na conta, na data bancária.
- **DRE gerencial:** receitas e despesas **classificadas**, no recorte e no período. Não é o saldo bancário.
- Transferência interna, aplicação e resgate **não** entram como receita ou despesa.

## Conciliação

Cruza lançamento de extrato com documento. Estados típicos: conciliado, pendente, sugestão, divergência, duplicidade. Pendência aparece no dashboard e na fila `/conciliacao/pendencias`.

Documento e extrato **não** compartilham a mesma lista: `/documentos` é a central; `/extratos` é o banco.

## Classificação e IA

A classificação combina regras, histórico e sugestão. O analista **confirma, altera ou rejeita** (human-in-the-loop). Toda alteração pede motivo e vai para a auditoria.

A fila está em `/ia/fila`. O assistente do canto da tela só **localiza** recortes e pendências; não classifica sozinho.

## Multi-CNPJ

Três empresas no seed:

| Código | Fantasia | Papel |
|---|---|---|
| CNPJ 01 | Paris Centro | Restaurante |
| CNPJ 02 | Paris Bistrô | Restaurante |
| CNPJ 03 | Paris Distribuição | Distribuição de alimentos |

O recorte **grupo** soma o que o usuário pode ver. Conta desconectada ou com consentimento expirado **não** entra no saldo como zero: fica indisponível.

## Open Finance

O catálogo de instituições (`src/domain/institutions.ts`) é desacoplado do motor de conciliação. Neste ambiente a autorização é simulada. Importar extrato cobre o banco que ainda não sincroniza.

## Auditoria

Cada mudança de classificação, reconciliação e configuração relevante gera entrada de trilha. O auditor lê; o administrador gerencia acesso.

Texto integral das regras: especificação, seções 10–23.
