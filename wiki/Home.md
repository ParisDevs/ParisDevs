# Wiki — Paris Devs

Paris Devs é a plataforma interna de gestão financeira do Grupo Paris 6. Integra contas autorizadas (Open Finance ou extrato importado), conciliação, classificação com revisão humana, fluxo de caixa e DRE gerencial.

```
banco / extrato → normalização → conciliação → classificação (IA + analista) →
plano de contas → consolidação por CNPJ ou grupo → caixa e DRE → alertas
```

## Páginas

| Página | Conteúdo |
|---|---|
| [Produto](Produto.md) | Problema, proposta, papéis e o que o sistema não é |
| [Como usar](Como-usar.md) | Subir o ambiente, contas de demo, login e recorte |
| [Rotas](Rotas.md) | Mapa das telas |
| [Frontend](Frontend.md) | Stack, pastas, estado e identidade visual |
| [Backend](Backend.md) | API Spring Boot, recursos e o que ainda falta |
| [Domínio e regras](Dominio-e-regras.md) | Caixa vs competência, transferência, auditoria |
| [Arquitetura](Arquitetura.md) | Camadas atuais e o desenho da especificação |
| [Equipe](Equipe.md) | Grupo, turma e documentos-fonte |

## Estado atual

- **Demonstrável:** o frontend (`frontend/`), com dados de fixture.
- **Em construção:** a API (`backend/`), ainda desconectada das telas.
- **Fonte de produto:** [`docs/especificacao-plataforma-conciliacao-financeira.md`](../docs/especificacao-plataforma-conciliacao-financeira.md) e [`docs/design-brief-paris-devs.md`](../docs/design-brief-paris-devs.md).
