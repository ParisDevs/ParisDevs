package com.parisdevs.api.domain;

import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Saldo que o dashboard passa a ler depois da sincronização.
 * Pluggy: account.balance. bankData.closingBalance só entra quando balance não veio no JSON.
 * Itaú: o snapshot é o de GET /balances quando o item traz amount.value associado ao statementId.
 * Um único amount.value na resposta também vale. Vários, sem o statementId, não escolhem saldo.
 * O corpo do extrato não altera o saldo: o OpenAPI público do portal não nomeia esse campo.
 */
public final class SaldoProvedor {

    private SaldoProvedor() {
    }

    public static BigDecimal pluggy(JsonNode account) {
        if (account == null) {
            return null;
        }
        if (account.path("balance").isNumber()) {
            return money(account.path("balance").decimalValue());
        }
        JsonNode closing = account.path("bankData").path("closingBalance");
        if (closing.isNumber()) {
            return money(closing.decimalValue());
        }
        return null;
    }

    public static BigDecimal itau(JsonNode balances, String statementId) {
        List<BigDecimal> todos = new ArrayList<>();
        BigDecimal[] casado = new BigDecimal[1];
        visitar(balances, statementId, false, todos, casado);
        if (casado[0] != null) {
            return casado[0];
        }
        if (todos.size() == 1) {
            return todos.get(0);
        }
        return null;
    }

    private static void visitar(JsonNode node, String statementId, boolean noContexto, List<BigDecimal> todos, BigDecimal[] casado) {
        if (node == null || node.isNull() || node.isValueNode()) {
            return;
        }
        if (node.isArray()) {
            node.forEach((filho) -> visitar(filho, statementId, noContexto, todos, casado));
            return;
        }
        boolean aqui = noContexto || contemStatement(node, statementId);
        if (node.path("amount").path("value").isNumber()) {
            BigDecimal valor = money(node.path("amount").path("value").decimalValue());
            todos.add(valor);
            if (aqui) {
                casado[0] = valor;
            }
        }
        node.fields().forEachRemaining((campo) -> visitar(campo.getValue(), statementId, aqui, todos, casado));
    }

    private static boolean contemStatement(JsonNode node, String statementId) {
        if (statementId == null || statementId.isBlank()) {
            return false;
        }
        var campos = node.fields();
        while (campos.hasNext()) {
            JsonNode valor = campos.next().getValue();
            if (valor.isTextual() && statementId.equals(valor.asText())) {
                return true;
            }
        }
        return false;
    }

    public static BigDecimal money(BigDecimal valor) {
        if (valor == null) {
            return null;
        }
        return valor.setScale(2, RoundingMode.HALF_UP);
    }
}
