package com.parisdevs.api.domain;

import com.parisdevs.api.enums.OrigemDados;

/**
 * Conta manual: o saldo muda em cada lançamento, via SaldoMovimento.
 * Conta sincronizada (ITAU, XP, PLUGGY): o saldo é o snapshot do provedor e o lançamento importado não passa por SaldoMovimento.
 * Reprocessar a mesma janela localiza a linha por origem + id externo e não cria outra.
 * Transferência continua fora do resultado pela regra já existente em DreRegras e no dashboard.
 */
public final class InvarianteSincronizacao {

    private InvarianteSincronizacao() {
    }

    public static boolean saldoPorLancamento(OrigemDados origem) {
        OrigemDados efetiva = origem == null ? OrigemDados.MANUAL : origem;
        return efetiva == OrigemDados.MANUAL || efetiva == OrigemDados.IMPORTACAO;
    }

    public static boolean protegida(OrigemDados origem) {
        return !saldoPorLancamento(origem);
    }
}
