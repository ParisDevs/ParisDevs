package com.parisdevs.api.domain;

import com.parisdevs.api.enums.TipoOperacao;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class SaldoMovimento {

    private SaldoMovimento() {
    }

    public static BigDecimal aplicar(BigDecimal saldoAtual, TipoOperacao tipo, Double valor, boolean estorno) {
        BigDecimal base = saldoAtual == null ? BigDecimal.ZERO : saldoAtual;
        BigDecimal delta = money(valor);
        if (tipo == TipoOperacao.PAGAMENTO) {
            delta = delta.negate();
        }
        if (estorno) {
            delta = delta.negate();
        }
        return base.add(delta).setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal money(Double valor) {
        if (valor == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.valueOf(valor).setScale(2, RoundingMode.HALF_UP);
    }

    public static boolean mesmoValor(Double atual, Double informado) {
        return money(atual).compareTo(money(informado)) == 0;
    }
}
