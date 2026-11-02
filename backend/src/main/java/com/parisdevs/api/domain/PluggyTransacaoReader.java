package com.parisdevs.api.domain;

import com.fasterxml.jackson.databind.JsonNode;
import com.parisdevs.api.enums.TipoOperacao;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Transação da Pluggy, no formato de GET /transactions e do guia de sandbox. */
public final class PluggyTransacaoReader {

    public record Evento(
            String idExterno,
            TipoOperacao tipo,
            BigDecimal valor,
            LocalDateTime quando,
            String descricao,
            String categoria
    ) {
    }

    private PluggyTransacaoReader() {
    }

    public static List<Evento> lerPagina(JsonNode root) {
        JsonNode lista = root == null ? null : root.get("results");
        if (lista == null || !lista.isArray()) {
            lista = root != null && root.isArray() ? root : null;
        }
        List<Evento> eventos = new ArrayList<>();
        if (lista == null) {
            return eventos;
        }
        lista.forEach((node) -> {
            Evento evento = de(node);
            if (evento != null) {
                eventos.add(evento);
            }
        });
        return eventos;
    }

    public static Evento de(JsonNode node) {
        if (node == null || !node.path("id").isTextual() || !node.path("amount").isNumber()) {
            return null;
        }
        BigDecimal bruto = node.path("amount").decimalValue();
        String type = node.path("type").asText("");
        TipoOperacao tipo;
        if ("CREDIT".equalsIgnoreCase(type) || (type.isBlank() && bruto.signum() >= 0)) {
            tipo = TipoOperacao.RECEBIMENTO;
        } else {
            tipo = TipoOperacao.PAGAMENTO;
        }
        String descricao = primeiroTexto(node, "description", "descriptionRaw");
        if (descricao.isBlank()) {
            descricao = "Lançamento";
        }
        String categoria = node.path("category").asText("").trim();
        if (categoria.isBlank()) {
            categoria = "Extrato";
        }
        return new Evento(
                node.path("id").asText(),
                tipo,
                bruto.abs().setScale(2, RoundingMode.HALF_UP),
                ItauExtratoReader.quando(node.path("date").asText("")),
                descricao,
                categoria
        );
    }

    public static Integer totalPaginas(JsonNode root) {
        if (root != null && root.path("totalPages").isNumber()) {
            return root.path("totalPages").asInt();
        }
        return null;
    }

    public static List<JsonNode> resultados(JsonNode root) {
        List<JsonNode> itens = new ArrayList<>();
        if (root == null) {
            return itens;
        }
        JsonNode lista = root.get("results");
        if (lista != null && lista.isArray()) {
            lista.forEach(itens::add);
            return itens;
        }
        if (root.isArray()) {
            root.forEach(itens::add);
        }
        return itens;
    }

    private static String primeiroTexto(JsonNode node, String... campos) {
        for (String campo : campos) {
            JsonNode valor = node.get(campo);
            if (valor != null && valor.isTextual() && !valor.asText().isBlank()) {
                return valor.asText().trim();
            }
        }
        return "";
    }
}
