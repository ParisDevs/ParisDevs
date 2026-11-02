package com.parisdevs.api.domain;

/**
 * statementId do Itaú: agência com 4 dígitos + conta com 7 + dígito verificador com 1.
 * Exemplo do portal: agência 1500, conta 0123456, dígito 7 → 150001234567.
 */
public final class StatementIdItau {

    private StatementIdItau() {
    }

    public static String montar(String agencia, String numeroConta, String digitoInformado) {
        String agenciaDigitos = digitos(agencia);
        String digito = digitos(digitoInformado);
        String conta = numeroConta == null ? "" : numeroConta.trim();
        int hifen = conta.lastIndexOf('-');
        if (hifen > 0 && digito.isEmpty()) {
            digito = digitos(conta.substring(hifen + 1));
            conta = conta.substring(0, hifen);
        }
        String contaDigitos = digitos(conta);

        if (contaDigitos.length() == 8 && digito.isEmpty()) {
            digito = contaDigitos.substring(7);
            contaDigitos = contaDigitos.substring(0, 7);
        }
        if (agenciaDigitos.length() < 4 || contaDigitos.length() < 5 || contaDigitos.length() > 7 || digito.length() != 1) {
            throw new IllegalArgumentException(
                    "A conta do Itaú precisa de agência com 4 dígitos, conta com até 7 e um dígito verificador.");
        }
        return pad(agenciaDigitos, 4) + pad(contaDigitos, 7) + digito;
    }

    private static String pad(String valor, int tamanho) {
        String cortado = valor.length() > tamanho ? valor.substring(valor.length() - tamanho) : valor;
        return "0".repeat(tamanho - cortado.length()) + cortado;
    }

    private static String digitos(String valor) {
        if (valor == null) {
            return "";
        }
        StringBuilder saida = new StringBuilder();
        for (int i = 0; i < valor.length(); i++) {
            char c = valor.charAt(i);
            if (c >= '0' && c <= '9') {
                saida.append(c);
            }
        }
        return saida.toString();
    }
}
