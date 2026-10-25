# Como usar

## Frontend (aplicação demonstrável)

Requisitos: Node.js 20 ou superior.

```bash
cd frontend
npm install
npm run dev
```

O Vite abre em `http://localhost:5173`. Se a porta estiver ocupada, usa a seguinte (por exemplo `5174`).

| Comando | Efeito |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Typecheck + bundle de produção |
| `npm run preview` | Serve o `dist/` |

### Entrar

1. Abra `/` (landing) e use **Acessar sistema**, ou vá direto a `/login`.
2. Informe um e-mail da tabela abaixo e **qualquer senha**.
3. A verificação em duas etapas e o autenticador são de demonstração: qualquer código de 6 dígitos vale.
4. Escolha o contexto (grupo ou um CNPJ). O sistema abre em `/dashboard`.

Não existe cadastro público.

### Contas de demonstração

| Pessoa | E-mail | Perfil |
|---|---|---|
| Marcelo Santos | `marcelo.santos@paris6.com.br` | Gestor |
| Gabriela Veríssimo | `gabriela.verissimo@paris6.com.br` | Analista |
| Ana Souza | `ana.souza@paris6.com.br` | Administrador |
| Patrícia Rocha | `patricia.rocha@paris6.com.br` | Auditor |

SSO está preparado na tela, sem provedor configurado. Use **Continuar com usuário de demonstração** em `/sso` se quiser simular o fluxo.

### Recorte e período

Na barra superior: empresa, filial e mês. O recorte vale para saldo, extrato, conciliação e DRE. O período de fixture vai de abril a setembro de 2026; a data de referência da demo é `2026-10-02`.

### Assistente de IA

No canto inferior direito, o botão circular abre o assistente. Perguntas típicas: saldo, DRE, conciliação, classificação, conexões.

### Sair

No rodapé do menu lateral, **Sair** pede confirmação e encerra a sessão (`localStorage`).

### Dados locais

O estado fica em chaves `pd.*` no `localStorage`. Para voltar ao seed, limpe o armazenamento do site neste origin.

## Backend (API)

Requisitos: Java 21.

```bash
cd backend
./mvnw spring-boot:run
```

Windows: `mvnw.cmd spring-boot:run`.

A API usa H2 em memória e springdoc. As telas do frontend **não** consomem essa API ainda.
