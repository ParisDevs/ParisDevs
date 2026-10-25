# Arquitetura

## O que está no repositório hoje

```
navegador  →  frontend (React, estado local)
                 ↳ domain/ calcula DRE, caixa, conciliação e alertas nas fixtures

API Spring  →  usuários e filiais (H2)
                 ↳ contas e operações ainda sem contrato completo
```

Não há, neste clone, autenticação JWT nas telas nem fila de mensageria. Isso está desenhado na especificação (seções 26–32) para quando a API assumir o processamento pesado.

## Frontend

- Rotas em `frontend/src/app/routes.tsx`.
- Guard: sessão ausente redireciona a `/login`.
- Regras financeiras em `frontend/src/domain/` (sem React).
- Persistência de demo: `localStorage` via `frontend/src/state/store.ts`.

## Backend

- REST em `com.parisdevs.api`.
- Validação Bean Validation + exceções de negócio.
- OpenAPI (springdoc) para explorar os endpoints enquanto o frontend não consome a API.

## Princípios (especificação)

- Desacoplar banco específico do motor de conciliação.
- Não fixar no código limite, plano de contas ou provedor que pertence à configuração.
- Toda reclassificação deixa trilha.
- Processamentos pesados (quando existirem de fato) são assíncronos; a UI não espera o lote.

Desenho-alvo (AWS, CI/CD, observabilidade, modelo relacional): [`docs/especificacao-plataforma-conciliacao-financeira.md`](../docs/especificacao-plataforma-conciliacao-financeira.md), a partir da seção 26.
