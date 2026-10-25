# Backend

Pasta [`backend/`](../backend/). API **Spring Boot** (parent `4.1.1`), **Java 21**, JPA, validação, H2 e **springdoc-openapi**.

As telas do frontend ainda **não** chamam esta API. O backend é o começo da persistência (usuário, filial, conta e operação).

## Como subir

```bash
cd backend
./mvnw spring-boot:run
```

Windows: `mvnw.cmd spring-boot:run`.

`spring.application.name=api`. Banco H2 em runtime (`pom.xml`). Documentação OpenAPI via springdoc.

## Recursos

| Recurso | Caminho | Situação |
|---|---|---|
| Usuários | `/usuarios` | CRUD (GET lista/id, POST, PUT, DELETE) |
| Filiais | `/filiais` | CRUD |
| Operações | `/operacoes` | Controller criado, implementação pendente |
| Contas bancárias | — | Controller vazio |

Camadas: `controller` → `service` → `repository`, com `dto`, `mapper`, `entity`, `enums` (`Cargo`, `TipoOperacao`) e exceções de domínio (e-mail duplicado, CNPJ duplicado, filial obrigatória, usuário/filial não encontrados, token já cadastrado).

## Pacote

`com.parisdevs.api` — entrada em `ApiApplication`.

## Próximo passo natural

Expor contas bancárias e operações, autenticar de fato e substituir as fixtures do frontend por chamadas HTTP — sem copiar regra de DRE ou limite para o código da API quando isso pertence à configuração de negócio.
