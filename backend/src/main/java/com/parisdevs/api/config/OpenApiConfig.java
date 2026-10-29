package com.parisdevs.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.ObjectSchema;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.tags.Tag;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.method.HandlerMethod;

@Configuration
public class OpenApiConfig {

    private static final String ERRO = "ErroResposta";
    private static final String JSON = "application/json";
    private static final String BEARER_JWT = "bearer-jwt";

    @Bean
    public OpenAPI parisDevsOpenAPI() {
        Schema<?> erroSchema = new ObjectSchema()
                .addProperty("message", new StringSchema()
                        .description("Mensagem de erro")
                        .example("A operação informada não foi encontrada."));

        SecurityScheme bearer = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("JWT emitido em POST /usuarios/login");

        return new OpenAPI()
                .info(new Info()
                        .title("Paris Devs API")
                        .description("Documentação OpenAPI gerada a partir dos controllers. Autenticação JWT Bearer nas rotas protegidas.")
                        .version("0.0.1-SNAPSHOT"))
                .components(new Components()
                        .addSchemas(ERRO, erroSchema)
                        .addSecuritySchemes(BEARER_JWT, bearer))
                .addTagsItem(new Tag().name("Usuarios").description("Cadastro, consulta e login de usuários"))
                .addTagsItem(new Tag().name("Filiais").description("Cadastro e consulta de filiais"))
                .addTagsItem(new Tag().name("Conta Bancaria").description("Contas bancárias vinculadas à filial"))
                .addTagsItem(new Tag().name("Operações").description("Lançamentos de recebimento e pagamento"))
                .addTagsItem(new Tag().name("Dashboard").description("Indicadores do recorte de período"))
                .addTagsItem(new Tag().name("DRE").description("DRE diária até D-1 e histórico de snapshots"));
    }

    @Bean
    public OperationCustomizer statusCodesCustomizer() {
        Content erroJson = new Content().addMediaType(JSON, new MediaType().schema(new Schema<>().$ref("#/components/schemas/" + ERRO)));
        return (operation, handlerMethod) -> {
            ApiResponses responses = operation.getResponses();
            RequestMethod http = resolveMethod(handlerMethod);
            String name = handlerMethod.getMethod().getName();
            boolean body = hasAnnotation(handlerMethod, RequestBody.class);
            boolean pathVar = hasAnnotation(handlerMethod, PathVariable.class);
            boolean conflict = handlerMethod.getBeanType().getSimpleName().contains("Usuario")
                    || handlerMethod.getBeanType().getSimpleName().contains("Filial");
            boolean recursoUnico = pathVar && (name.startsWith("buscar") || name.startsWith("atualizar") || name.startsWith("deletar"));

            boolean login = "login".equals(name) && http == RequestMethod.POST;
            boolean dre = handlerMethod.getBeanType().getSimpleName().equals("DreController");
            if (!login) {
                operation.addSecurityItem(new SecurityRequirement().addList(BEARER_JWT));
                putIfAbsent(responses, "401", "Token ausente, inválido ou expirado", erroJson);
            }

            if (http == RequestMethod.GET) {
                putIfAbsent(responses, "200", "Consulta realizada");
                if (recursoUnico) {
                    putIfAbsent(responses, "404", "Recurso não encontrado", erroJson);
                }
                if (dre) {
                    putIfAbsent(responses, "400", "Data inválida", erroJson);
                }
            } else if (http == RequestMethod.POST) {
                if (login) {
                    putIfAbsent(responses, "200", "Login realizado");
                    putIfAbsent(responses, "401", "Credenciais inválidas", erroJson);
                } else if (dre && "gerar".equals(name)) {
                    putIfAbsent(responses, "200", "Snapshot gravado");
                    putIfAbsent(responses, "400", "Data inválida", erroJson);
                } else {
                    responses.remove("200");
                    putIfAbsent(responses, "201", "Recurso criado");
                    if (body) {
                        putIfAbsent(responses, "400", "Dados inválidos", erroJson);
                    }
                    if (conflict) {
                        putIfAbsent(responses, "409", "Registro já cadastrado", erroJson);
                    }
                }
            } else if (http == RequestMethod.PUT) {
                putIfAbsent(responses, "200", "Recurso atualizado");
                if (body) {
                    putIfAbsent(responses, "400", "Dados inválidos", erroJson);
                }
                putIfAbsent(responses, "404", "Recurso não encontrado", erroJson);
                if (conflict) {
                    putIfAbsent(responses, "409", "Registro já cadastrado", erroJson);
                }
            } else if (http == RequestMethod.DELETE) {
                responses.remove("200");
                putIfAbsent(responses, "204", "Recurso excluído");
                putIfAbsent(responses, "404", "Recurso não encontrado", erroJson);
            }
            return operation;
        };
    }

    private static RequestMethod resolveMethod(HandlerMethod handlerMethod) {
        if (handlerMethod.hasMethodAnnotation(GetMapping.class)) {
            return RequestMethod.GET;
        }
        if (handlerMethod.hasMethodAnnotation(PostMapping.class)) {
            return RequestMethod.POST;
        }
        if (handlerMethod.hasMethodAnnotation(PutMapping.class)) {
            return RequestMethod.PUT;
        }
        if (handlerMethod.hasMethodAnnotation(DeleteMapping.class)) {
            return RequestMethod.DELETE;
        }
        RequestMapping mapping = handlerMethod.getMethodAnnotation(RequestMapping.class);
        if (mapping != null && mapping.method().length > 0) {
            return mapping.method()[0];
        }
        return RequestMethod.GET;
    }

    private static boolean hasAnnotation(HandlerMethod handlerMethod, Class<? extends java.lang.annotation.Annotation> annotation) {
        return java.util.Arrays.stream(handlerMethod.getMethodParameters())
                .anyMatch(parameter -> parameter.hasParameterAnnotation(annotation));
    }

    private static void putIfAbsent(ApiResponses responses, String code, String description) {
        putIfAbsent(responses, code, description, null);
    }

    private static void putIfAbsent(ApiResponses responses, String code, String description, Content content) {
        if (responses.containsKey(code)) {
            return;
        }
        ApiResponse response = new ApiResponse().description(description);
        if (content != null) {
            response.content(content);
        }
        responses.addApiResponse(code, response);
    }
}
