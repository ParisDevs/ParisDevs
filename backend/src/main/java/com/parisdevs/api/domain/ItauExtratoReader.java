package com.parisdevs.api.domain;

import com.fasterxml.jackson.databind.JsonNode;
import com.parisdevs.api.enums.TipoOperacao;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;

/**
 * Lê o extrato do Itaú sem inventar o contrato além do que o portal já expõe.
 * O filtro oficial usa a propriedade literal.complete. Um lançamento só vira operação
 * quando o objeto também traz amount.value. Amostra vazia {"data":{}} ou {"data":[]}
 * é extrato vazio reconhecido. Payload com conteúdo e sem esse par fica só na captura bruta.
 */
public final class ItauExtratoReader {

    public record Evento(
            String idExterno,
            TipoOperacao tipo,
            BigDecimal valor,
            LocalDateTime quando,
            String descricao,
            String categoria
    ) {
    }

    public record Leitura(List<Evento> eventos, boolean esquemaReconhecido, Integer totalPaginas) {
    }

    private ItauExtratoReader() {
    }

    public static Leitura ler(JsonNode root) {
        List<Evento> eventos = new ArrayList<>();
        coletar(root, eventos);
        JsonNode data = root == null ? null : root.get("data");
        boolean vazio = data == null || data.isNull() || (data.isObject() && data.isEmpty()) || (data.isArray() && data.isEmpty());
        boolean reconhecido = !eventos.isEmpty() || vazio;
        return new Leitura(List.copyOf(eventos), reconhecido, totalPaginas(root));
    }

    private static void coletar(JsonNode node, List<Evento> eventos) {
        if (node == null || node.isNull() || node.isValueNode()) {
            return;
        }
        if (node.isArray()) {
            node.forEach((filho) -> coletar(filho, eventos));
            return;
        }
        JsonNode completa = node.path("literal").path("complete");
        JsonNode valor = node.path("amount").path("value");
        if (completa.isTextual() && !completa.asText().isBlank() && valor.isNumber()) {
            if (!pareceSaldo(completa.asText(), node.path("type").asText(""))) {
                eventos.add(evento(node, completa.asText(), valor.decimalValue()));
            }
            return;
        }
        node.fields().forEachRemaining((campo) -> coletar(campo.getValue(), eventos));
    }

    private static boolean pareceSaldo(String literal, String type) {
        String texto = (literal + " " + type).toLowerCase();
        return texto.contains("saldo") || texto.contains("balance");
    }

    private static Evento evento(JsonNode node, String literal, BigDecimal bruto) {
        String operacao = node.path("operation").asText("");
        TipoOperacao tipo = tipo(operacao, bruto);
        BigDecimal absoluto = bruto.abs().setScale(2, RoundingMode.HALF_UP);
        String descricao = texto(node.path("counterpart").path("name"));
        if (descricao.isBlank()) {
            descricao = literal;
        }
        String categoria = texto(node.path("literal").path("shortened"));
        if (categoria.isBlank()) {
            categoria = "Extrato";
        }
        String id = texto(node.get("id"));
        if (id.isBlank()) {
            id = hash(literal + "|" + quandoTexto(node) + "|" + absoluto + "|" + tipo);
        }
        LocalDateTime quando = quando(quandoTexto(node));
        return new Evento(id, tipo, absoluto, quando, descricao, categoria);
    }

    private static TipoOperacao tipo(String operacao, BigDecimal bruto) {
        String normalizado = operacao == null ? "" : operacao.trim().toUpperCase();
        if (normalizado.startsWith("C") || normalizado.contains("CREDIT")) {
            return TipoOperacao.RECEBIMENTO;
        }
        if (normalizado.startsWith("D") || normalizado.contains("DEBIT")) {
            return TipoOperacao.PAGAMENTO;
        }
        return bruto.signum() < 0 ? TipoOperacao.PAGAMENTO : TipoOperacao.RECEBIMENTO;
    }

    private static String quandoTexto(JsonNode node) {
        JsonNode date = node.get("date");
        if (date == null || date.isNull()) {
            return "";
        }
        if (date.isTextual()) {
            return date.asText();
        }
        String event = texto(date.get("event"));
        if (!event.isBlank()) {
            return event;
        }
        return texto(date.get("accounting"));
    }

    public static LocalDateTime quando(String texto) {
        if (texto == null || texto.isBlank()) {
            return LocalDateTime.now();
        }
        String valor = texto.trim();
        try {
            return OffsetDateTime.parse(valor).toLocalDateTime();
        } catch (RuntimeException ignored) {
            // tenta data local
        }
        try {
            return LocalDateTime.parse(valor);
        } catch (RuntimeException ignored) {
            // tenta só o dia
        }
        try {
            return LocalDate.parse(valor.substring(0, Math.min(10, valor.length()))).atStartOfDay();
        } catch (RuntimeException ignored) {
            return LocalDateTime.now();
        }
    }

    private static Integer totalPaginas(JsonNode root) {
        if (root == null) {
            return null;
        }
        JsonNode pagination = root.path("pagination");
        if (pagination.path("total_pages").isNumber()) {
            return pagination.path("total_pages").asInt();
        }
        if (pagination.path("totalPages").isNumber()) {
            return pagination.path("totalPages").asInt();
        }
        return null;
    }

    private static String texto(JsonNode node) {
        if (node == null || node.isNull() || !node.isTextual()) {
            return "";
        }
        return node.asText().trim();
    }

    private static String hash(String valor) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(valor.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest).substring(0, 32);
        } catch (NoSuchAlgorithmException ex) {
            return Integer.toHexString(valor.hashCode());
        }
    }
}
