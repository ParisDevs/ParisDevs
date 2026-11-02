package com.parisdevs.api.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.parisdevs.api.exception.ProvedorIndisponivelException;
import com.parisdevs.api.exception.ProvedorNaoConfiguradoException;
import com.parisdevs.api.service.ProvedorCredencialService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

@Service
public class PluggyClient {

    private static final String BASE = "https://api.pluggy.ai";

    private final RestClient http;
    private final ObjectMapper json = new ObjectMapper();
    private final ProvedorCredencialService credenciais;
    private final int conectorConfigurado;
    private String apiKey;
    private Instant apiKeyExpira = Instant.EPOCH;
    private Integer conectorSandbox;

    public PluggyClient(
            ProvedorCredencialService credenciais,
            @Value("${app.pluggy.sandbox-connector-id:0}") int conectorConfigurado
    ) {
        this.credenciais = credenciais;
        this.conectorConfigurado = conectorConfigurado;
        HttpClient cliente = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        JdkClientHttpRequestFactory fabrica = new JdkClientHttpRequestFactory(cliente);
        fabrica.setReadTimeout(Duration.ofSeconds(40));
        this.http = RestClient.builder().requestFactory(fabrica).build();
    }

    public String connectToken(String itemId) {
        ObjectNode body = json.createObjectNode();
        if (itemId != null && !itemId.isBlank()) {
            body.put("itemId", itemId);
        }
        JsonNode resposta = post("/connect_token", body);
        String token = resposta.path("accessToken").asText("");
        if (token.isBlank()) {
            throw new ProvedorIndisponivelException("A Pluggy não devolveu o connect token.");
        }
        return token;
    }

    public int conectorSandbox(boolean openFinance) {
        if (!openFinance && conectorConfigurado > 0) {
            return conectorConfigurado;
        }
        if (!openFinance && conectorSandbox != null) {
            return conectorSandbox;
        }
        JsonNode lista = get("/connectors?sandbox=true");
        Integer escolhido = null;
        for (JsonNode conector : lista.path("results")) {
            int id = conector.path("id").asInt(-1);
            if (id == 600 || id == 8) {
                continue;
            }
            boolean financeiro = conector.path("isOpenFinance").asBoolean(false);
            if (openFinance != financeiro) {
                continue;
            }
            String nome = conector.path("name").asText("").toLowerCase(Locale.ROOT);
            if (!openFinance && !nome.contains("pluggy bank")) {
                continue;
            }
            if ("BR".equalsIgnoreCase(conector.path("country").asText(""))) {
                if (!openFinance) {
                    conectorSandbox = id;
                }
                return id;
            }
            if (escolhido == null) {
                escolhido = id;
            }
        }
        if (escolhido == null) {
            throw new ProvedorIndisponivelException(openFinance
                    ? "A lista sandbox da Pluggy não trouxe um conector Open Finance."
                    : "A lista sandbox da Pluggy não trouxe o conector Pluggy Bank. Informe app.pluggy.sandbox-connector-id com o id retornado por GET /connectors?sandbox=true.");
        }
        if (!openFinance) {
            conectorSandbox = escolhido;
        }
        return escolhido;
    }

    public JsonNode criarItem(int connectorId, String usuario, String senha, String mfa, String cpf) {
        ObjectNode parameters = json.createObjectNode();
        if (cpf != null && !cpf.isBlank()) {
            parameters.put("cpf", cpf.replaceAll("\\D", ""));
        }
        if (usuario != null && !usuario.isBlank()) {
            parameters.put("user", usuario);
        }
        if (senha != null && !senha.isBlank()) {
            parameters.put("password", senha);
        }
        if (mfa != null && !mfa.isBlank()) {
            parameters.put("token", mfa);
        }
        ObjectNode body = json.createObjectNode();
        body.put("connectorId", connectorId);
        body.set("parameters", parameters);
        return post("/items", body);
    }

    public JsonNode atualizarItem(String itemId) {
        return patch("/items/" + enc(itemId), json.createObjectNode());
    }

    public JsonNode item(String itemId) {
        return get("/items/" + enc(itemId));
    }

    public JsonNode contas(String itemId) {
        return get("/accounts?itemId=" + enc(itemId));
    }

    public JsonNode transacoes(String accountId, String from, String to, int page) {
        return get("/transactions?accountId=" + enc(accountId) + "&from=" + enc(from) + "&to=" + enc(to)
                + "&pageSize=500&page=" + page);
    }

    public JsonNode investimentos(String itemId) {
        return get("/investments?itemId=" + enc(itemId));
    }

    public JsonNode emprestimos(String itemId) {
        return get("/loans?itemId=" + enc(itemId));
    }

    private JsonNode get(String caminho) {
        return enviar("GET", caminho, null);
    }

    private JsonNode post(String caminho, JsonNode body) {
        return enviar("POST", caminho, body);
    }

    private JsonNode patch(String caminho, JsonNode body) {
        return enviar("PATCH", caminho, body);
    }

    private JsonNode enviar(String metodo, String caminho, JsonNode body) {
        try {
            RestClient.RequestBodySpec spec = http.method(org.springframework.http.HttpMethod.valueOf(metodo))
                    .uri(BASE + caminho)
                    .header("X-API-KEY", apiKey())
                    .accept(MediaType.APPLICATION_JSON);
            String corpo;
            if (body == null) {
                corpo = spec.retrieve().body(String.class);
            } else {
                corpo = spec.contentType(MediaType.APPLICATION_JSON).body(body.toString()).retrieve().body(String.class);
            }
            return json.readTree(corpo == null ? "{}" : corpo);
        } catch (RestClientResponseException ex) {
            throw new ProvedorIndisponivelException(ItauAccountStatementClient.falha("Pluggy", ex));
        } catch (ProvedorNaoConfiguradoException | ProvedorIndisponivelException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ProvedorIndisponivelException("Não foi possível consultar a Pluggy. Os lançamentos já importados foram mantidos.");
        }
    }

    private synchronized String apiKey() {
        if (apiKey != null && Instant.now().isBefore(apiKeyExpira)) {
            return apiKey;
        }
        ProvedorCredencialService.Segredo segredo = credenciais.exigir(com.parisdevs.api.enums.ProvedorBancario.PLUGGY);
        ObjectNode body = json.createObjectNode();
        body.put("clientId", segredo.clientId());
        body.put("clientSecret", segredo.clientSecret());
        try {
            String corpo = http.post()
                    .uri(BASE + "/auth")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body.toString())
                    .retrieve()
                    .body(String.class);
            JsonNode node = json.readTree(corpo == null ? "{}" : corpo);
            String chave = node.path("apiKey").asText("");
            if (chave.isBlank()) {
                throw new ProvedorIndisponivelException("A Pluggy não devolveu a chave de API.");
            }
            apiKey = chave;
            apiKeyExpira = Instant.now().plus(Duration.ofMinutes(90));
            return apiKey;
        } catch (ProvedorIndisponivelException ex) {
            throw ex;
        } catch (RestClientResponseException ex) {
            throw new ProvedorIndisponivelException(ItauAccountStatementClient.falha("Pluggy", ex));
        } catch (Exception ex) {
            throw new ProvedorIndisponivelException("Não foi possível autenticar na Pluggy.");
        }
    }

    private static String enc(String valor) {
        return URLEncoder.encode(valor == null ? "" : valor, StandardCharsets.UTF_8);
    }
}
