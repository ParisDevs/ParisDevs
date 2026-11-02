package com.parisdevs.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.parisdevs.api.dto.AssistenteChatRequestDto;
import com.parisdevs.api.dto.AssistenteChatResponseDto;
import com.parisdevs.api.dto.AssistenteMensagemDto;
import com.parisdevs.api.dto.AssistenteStatusDto;
import com.parisdevs.api.exception.AssistenteIndisponivelException;
import com.parisdevs.api.exception.AssistenteNaoConfiguradoException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AssistenteService {

    private static final int LIMITE_MENSAGENS = 12;
    private static final int LIMITE_TEXTO = 4000;

    private enum Provedor {
        OPENAI, CLAUDE, GEMINI;

        static Provedor de(String valor) {
            if (valor == null || valor.isBlank() || valor.equalsIgnoreCase("openai")) {
                return OPENAI;
            }
            if (valor.equalsIgnoreCase("claude") || valor.equalsIgnoreCase("anthropic")) {
                return CLAUDE;
            }
            if (valor.equalsIgnoreCase("gemini") || valor.equalsIgnoreCase("google")) {
                return GEMINI;
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provedor não reconhecido. Use OpenAI, Claude ou Gemini.");
        }

        String id() {
            return switch (this) {
                case OPENAI -> "openai";
                case CLAUDE -> "claude";
                case GEMINI -> "gemini";
            };
        }

        String nome() {
            return switch (this) {
                case OPENAI -> "OpenAI";
                case CLAUDE -> "Claude";
                case GEMINI -> "Gemini";
            };
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient;
    private final Map<Provedor, String> chavesAmbiente;
    private final Map<Provedor, String> modelos;
    private final Map<Provedor, String> chavesPainel = new EnumMap<>(Provedor.class);

    public AssistenteService(
            @Value("${app.openai.api-key:}") String chaveOpenai,
            @Value("${app.openai.model:gpt-4o-mini}") String modeloOpenai,
            @Value("${app.anthropic.api-key:}") String chaveClaude,
            @Value("${app.anthropic.model:claude-sonnet-4-5}") String modeloClaude,
            @Value("${app.gemini.api-key:}") String chaveGemini,
            @Value("${app.gemini.model:gemini-2.5-flash}") String modeloGemini) {
        chavesAmbiente = Map.of(
                Provedor.OPENAI, limpar(chaveOpenai),
                Provedor.CLAUDE, limpar(chaveClaude),
                Provedor.GEMINI, limpar(chaveGemini));
        modelos = Map.of(
                Provedor.OPENAI, modelo(modeloOpenai, "gpt-4o-mini"),
                Provedor.CLAUDE, modelo(modeloClaude, "claude-sonnet-4-5"),
                Provedor.GEMINI, modelo(modeloGemini, "gemini-2.5-flash"));
        for (Provedor provedor : Provedor.values()) {
            chavesPainel.put(provedor, "");
        }
        HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(http);
        factory.setReadTimeout(Duration.ofSeconds(40));
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    public AssistenteStatusDto status(String provedorInformado) {
        Provedor provedor = Provedor.de(provedorInformado);
        if (!chavesPainel.get(provedor).isBlank()) {
            return new AssistenteStatusDto(true, "painel", provedor.id());
        }
        if (!chavesAmbiente.get(provedor).isBlank()) {
            return new AssistenteStatusDto(true, "ambiente", provedor.id());
        }
        return new AssistenteStatusDto(false, "nenhuma", provedor.id());
    }

    public AssistenteStatusDto definirChave(String provedorInformado, String chave) {
        Provedor provedor = Provedor.de(provedorInformado);
        chavesPainel.put(provedor, limpar(chave));
        return status(provedor.id());
    }

    public AssistenteChatResponseDto conversar(AssistenteChatRequestDto pedido) {
        Provedor provedor = Provedor.de(pedido == null ? null : pedido.provedor());
        String chave = chaveEfetiva(provedor);
        if (chave.isBlank()) {
            throw new AssistenteNaoConfiguradoException(provedor.nome());
        }
        String sistema = sistema(pedido);
        List<Map<String, String>> dialogo = dialogo(pedido);
        String bruto = switch (provedor) {
            case OPENAI -> chamarOpenai(chave, sistema, dialogo);
            case CLAUDE -> chamarClaude(chave, sistema, dialogo);
            case GEMINI -> chamarGemini(chave, sistema, dialogo);
        };
        return new AssistenteChatResponseDto(extrair(provedor, bruto));
    }

    private String chamarOpenai(String chave, String sistema, List<Map<String, String>> dialogo) {
        List<Map<String, String>> mensagens = new ArrayList<>();
        mensagens.add(Map.of("role", "system", "content", sistema));
        mensagens.addAll(dialogo);
        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("model", modelos.get(Provedor.OPENAI));
        corpo.put("temperature", 0.2);
        corpo.put("messages", mensagens);
        return post(
                "https://api.openai.com/v1/chat/completions",
                Map.of("Authorization", "Bearer " + chave),
                corpo,
                Provedor.OPENAI);
    }

    private String chamarClaude(String chave, String sistema, List<Map<String, String>> dialogo) {
        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("model", modelos.get(Provedor.CLAUDE));
        corpo.put("max_tokens", 1024);
        corpo.put("temperature", 0.2);
        corpo.put("system", sistema);
        corpo.put("messages", dialogo);
        return post(
                "https://api.anthropic.com/v1/messages",
                Map.of(
                        "x-api-key", chave,
                        "anthropic-version", "2023-06-01"),
                corpo,
                Provedor.CLAUDE);
    }

    private String chamarGemini(String chave, String sistema, List<Map<String, String>> dialogo) {
        List<Map<String, Object>> contents = new ArrayList<>();
        for (Map<String, String> mensagem : dialogo) {
            String papel = "assistant".equals(mensagem.get("role")) ? "model" : "user";
            contents.add(Map.of("role", papel, "parts", List.of(Map.of("text", mensagem.get("content")))));
        }
        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("systemInstruction", Map.of("parts", List.of(Map.of("text", sistema))));
        corpo.put("contents", contents);
        corpo.put("generationConfig", Map.of("temperature", 0.2));
        String modelo = modelos.get(Provedor.GEMINI);
        return post(
                "https://generativelanguage.googleapis.com/v1beta/models/" + modelo + ":generateContent",
                Map.of("x-goog-api-key", chave),
                corpo,
                Provedor.GEMINI);
    }

    private String post(String url, Map<String, String> headers, Map<String, Object> corpo, Provedor provedor) {
        try {
            return restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .headers((http) -> headers.forEach(http::set))
                    .body(corpo)
                    .exchange((request, response) -> {
                        String texto = new String(response.getBody().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
                        if (response.getStatusCode().isError()) {
                            throw new AssistenteIndisponivelException(mensagemProvedor(provedor, response.getStatusCode().value()));
                        }
                        return texto;
                    });
        } catch (AssistenteIndisponivelException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            Throwable atual = ex;
            while (atual != null) {
                if (atual instanceof AssistenteIndisponivelException encontrada) {
                    throw encontrada;
                }
                atual = atual.getCause();
            }
            throw new AssistenteIndisponivelException("Não foi possível consultar o " + provedor.nome() + ".");
        }
    }

    private String extrair(Provedor provedor, String bruto) {
        try {
            JsonNode raiz = objectMapper.readTree(bruto);
            String texto = switch (provedor) {
                case OPENAI -> raiz.path("choices").path(0).path("message").path("content").asText("");
                case CLAUDE -> raiz.path("content").path(0).path("text").asText("");
                case GEMINI -> raiz.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");
            };
            texto = texto.trim();
            if (texto.isBlank()) {
                throw new AssistenteIndisponivelException("O " + provedor.nome() + " respondeu sem texto.");
            }
            return texto;
        } catch (AssistenteIndisponivelException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AssistenteIndisponivelException("Não foi possível ler a resposta do " + provedor.nome() + ".");
        }
    }

    private String chaveEfetiva(Provedor provedor) {
        String painel = chavesPainel.get(provedor);
        if (painel != null && !painel.isBlank()) {
            return painel;
        }
        return chavesAmbiente.get(provedor);
    }

    private List<Map<String, String>> dialogo(AssistenteChatRequestDto pedido) {
        if (pedido == null || pedido.mensagens() == null || pedido.mensagens().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie uma mensagem para o assistente.");
        }
        List<AssistenteMensagemDto> recebidas = pedido.mensagens();
        int inicio = Math.max(0, recebidas.size() - LIMITE_MENSAGENS);
        List<Map<String, String>> mensagens = new ArrayList<>();
        for (int i = inicio; i < recebidas.size(); i++) {
            AssistenteMensagemDto item = recebidas.get(i);
            String papel = papel(item == null ? null : item.papel());
            String texto = cortar(item == null ? null : item.texto());
            if (papel == null || texto.isBlank()) {
                continue;
            }
            mensagens.add(Map.of("role", papel, "content", texto));
        }
        while (!mensagens.isEmpty() && "assistant".equals(mensagens.get(0).get("role"))) {
            mensagens.remove(0);
        }
        if (mensagens.isEmpty() || !"user".equals(mensagens.get(mensagens.size() - 1).get("role"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie uma mensagem para o assistente.");
        }
        return mensagens;
    }

    private String sistema(AssistenteChatRequestDto pedido) {
        String instrucoes = cortar(pedido == null ? null : pedido.instrucoes());
        if (instrucoes.isBlank()) {
            instrucoes = "Você é o assistente financeiro da Paris Devs. Responda em português, de forma curta.";
        }
        String contexto = cortar(pedido == null ? null : pedido.contexto());
        return instrucoes
                + "\n\nUse apenas os números do contexto abaixo. Se o dado não estiver no contexto, diga que não tem esse número. Não peça nem repita chaves de API.\n\nContexto:\n"
                + (contexto.isBlank() ? "Nenhum número deste recorte foi enviado." : contexto);
    }

    private static String mensagemProvedor(Provedor provedor, int status) {
        if (status == 401 || status == 403) {
            return "A chave do " + provedor.nome() + " foi recusada. Confira a chave em Configurações, API de IA.";
        }
        if (status == 429) {
            return "O " + provedor.nome() + " limitou as consultas. Tente de novo em instantes.";
        }
        return "O " + provedor.nome() + " não respondeu agora.";
    }

    private static String papel(String valor) {
        if (valor == null) {
            return null;
        }
        String normal = valor.trim().toLowerCase();
        if (normal.equals("user") || normal.equals("usuario")) {
            return "user";
        }
        if (normal.equals("assistant") || normal.equals("bot")) {
            return "assistant";
        }
        return null;
    }

    private static String cortar(String valor) {
        if (valor == null) {
            return "";
        }
        String texto = valor.trim();
        if (texto.length() <= LIMITE_TEXTO) {
            return texto;
        }
        return texto.substring(0, LIMITE_TEXTO);
    }

    private static String limpar(String valor) {
        return valor == null ? "" : valor.trim();
    }

    private static String modelo(String valor, String padrao) {
        String texto = limpar(valor);
        return texto.isBlank() ? padrao : texto;
    }
}
