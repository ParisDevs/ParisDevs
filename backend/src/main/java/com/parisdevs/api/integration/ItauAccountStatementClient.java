package com.parisdevs.api.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.parisdevs.api.enums.AmbienteConexao;
import com.parisdevs.api.exception.ProvedorIndisponivelException;
import com.parisdevs.api.exception.ProvedorNaoConfiguradoException;
import com.parisdevs.api.service.ProvedorCredencialService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
public class ItauAccountStatementClient {

    private final RestClient http;
    private final ObjectMapper json = new ObjectMapper();
    private final ProvedorCredencialService credenciais;
    private final String sandboxBase;
    private final String producaoBase;
    private final String sandboxToken;
    private final String producaoToken;
    private String token;
    private Instant tokenExpira = Instant.EPOCH;
    private AmbienteConexao tokenAmbiente;

    public ItauAccountStatementClient(
            ProvedorCredencialService credenciais,
            @Value("${app.itau.sandbox-base-url}") String sandboxBase,
            @Value("${app.itau.producao-base-url}") String producaoBase,
            @Value("${app.itau.sandbox-token-url}") String sandboxToken,
            @Value("${app.itau.producao-token-url}") String producaoToken
    ) {
        this.credenciais = credenciais;
        this.sandboxBase = sandboxBase;
        this.producaoBase = producaoBase;
        this.sandboxToken = sandboxToken;
        this.producaoToken = producaoToken;
        HttpClient cliente = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        JdkClientHttpRequestFactory fabrica = new JdkClientHttpRequestFactory(cliente);
        fabrica.setReadTimeout(Duration.ofSeconds(40));
        this.http = RestClient.builder().requestFactory(fabrica).build();
    }

    public JsonNode extrato(AmbienteConexao ambiente, String statementId, String type, String startDate, String endDate, int page) {
        String consulta = "/statements/" + enc(statementId)
                + "?type=" + enc(type)
                + "&start_date=" + enc(startDate)
                + "&end_date=" + enc(endDate)
                + "&page=" + page
                + "&page_size=100"
                + "&statement_type=complete"
                + "&show_pending_events=false";
        return get(ambiente, consulta);
    }

    public JsonNode saldos(AmbienteConexao ambiente) {
        return get(ambiente, "/balances");
    }

    public JsonNode aplicacaoAutomatica(AmbienteConexao ambiente, String statementId, String startDate, String endDate) {
        return get(ambiente, "/statements/" + enc(statementId) + "/interest-bearing-accounts?start_date="
                + enc(startDate) + "&end_date=" + enc(endDate));
    }

    public JsonNode ordensJudiciais(AmbienteConexao ambiente, String statementId, String startDate, String endDate, int page) {
        return get(ambiente, "/statements/" + enc(statementId) + "/judicial-orders?start_date="
                + enc(startDate) + "&end_date=" + enc(endDate) + "&page=" + page);
    }

    public JsonNode saldosInvestimento(AmbienteConexao ambiente, String statementId, String date) {
        return get(ambiente, "/statements/" + enc(statementId) + "/investment-balances?date=" + enc(date));
    }

    public JsonNode recebiveis(AmbienteConexao ambiente, String statementId, String startDate, String endDate) {
        return get(ambiente, "/accounts-receivable?statement-id=" + enc(statementId)
                + "&start-issue-date=" + enc(startDate) + "&end-issue-date=" + enc(endDate));
    }

    private JsonNode get(AmbienteConexao ambiente, String caminho) {
        try {
            String corpo = http.get()
                    .uri(base(ambiente) + caminho)
                    .header("Authorization", "Bearer " + accessToken(ambiente))
                    .header("x-itau-correlationid", UUID.randomUUID().toString())
                    .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                    .retrieve()
                    .body(String.class);
            return json.readTree(corpo == null ? "{}" : corpo);
        } catch (RestClientResponseException ex) {
            throw new ProvedorIndisponivelException(falha("Itaú", ex));
        } catch (ProvedorNaoConfiguradoException ex) {
            throw ex;
        } catch (ProvedorIndisponivelException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw new ProvedorIndisponivelException("Não foi possível consultar o extrato do Itaú. Os lançamentos já importados foram mantidos.");
        } catch (Exception ex) {
            throw new ProvedorIndisponivelException("Não foi possível ler a resposta do Itaú. Os lançamentos já importados foram mantidos.");
        }
    }

    private synchronized String accessToken(AmbienteConexao ambiente) {
        if (token != null && tokenAmbiente == ambiente && Instant.now().isBefore(tokenExpira)) {
            return token;
        }
        ProvedorCredencialService.Segredo segredo = credenciais.exigir(com.parisdevs.api.enums.ProvedorBancario.ITAU);
        LinkedMultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", segredo.clientId());
        form.add("client_secret", segredo.clientSecret());
        try {
            String corpo = http.post()
                    .uri(ambiente == AmbienteConexao.PRODUCAO ? producaoToken : sandboxToken)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .header("x-itau-correlationid", UUID.randomUUID().toString())
                    .body(form)
                    .retrieve()
                    .body(String.class);
            JsonNode node = json.readTree(corpo == null ? "{}" : corpo);
            String acesso = node.path("access_token").asText("");
            if (acesso.isBlank()) {
                throw new ProvedorIndisponivelException("O Itaú não devolveu o token de acesso.");
            }
            int segundos = node.path("expires_in").asInt(300);
            token = acesso;
            tokenAmbiente = ambiente;
            tokenExpira = Instant.now().plusSeconds(Math.max(30, segundos - 60L));
            return token;
        } catch (ProvedorIndisponivelException ex) {
            throw ex;
        } catch (RestClientResponseException ex) {
            throw new ProvedorIndisponivelException(falha("Itaú", ex));
        } catch (Exception ex) {
            throw new ProvedorIndisponivelException("Não foi possível obter o token do Itaú.");
        }
    }

    private String base(AmbienteConexao ambiente) {
        return ambiente == AmbienteConexao.PRODUCAO ? producaoBase : sandboxBase;
    }

    static String falha(String provedor, RestClientResponseException ex) {
        return provedor + " respondeu " + ex.getStatusCode().value() + ". Os lançamentos já importados foram mantidos.";
    }

    private static String enc(String valor) {
        return URLEncoder.encode(valor == null ? "" : valor, StandardCharsets.UTF_8);
    }
}
