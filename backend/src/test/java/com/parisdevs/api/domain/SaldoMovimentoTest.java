package com.parisdevs.api.domain;

import com.parisdevs.api.enums.TipoOperacao;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SaldoMovimentoTest {

    @Test
    void recebimentoSomaNoSaldo() {
        BigDecimal saldo = SaldoMovimento.aplicar(new BigDecimal("100.00"), TipoOperacao.RECEBIMENTO, 10.5, false);
        assertEquals(new BigDecimal("110.50"), saldo);
    }

    @Test
    void pagamentoSubtraiDoSaldo() {
        BigDecimal saldo = SaldoMovimento.aplicar(new BigDecimal("100.00"), TipoOperacao.PAGAMENTO, 40d, false);
        assertEquals(new BigDecimal("60.00"), saldo);
    }

    @Test
    void estornoDevolveOValorAoSaldo() {
        BigDecimal saldo = SaldoMovimento.aplicar(new BigDecimal("86420.55"), TipoOperacao.RECEBIMENTO, 24090d, true);
        assertEquals(new BigDecimal("62330.55"), saldo);
    }

    @Test
    void saldoAusenteComecaEmZero() {
        BigDecimal saldo = SaldoMovimento.aplicar(null, TipoOperacao.PAGAMENTO, 15.2, false);
        assertEquals(new BigDecimal("-15.20"), saldo);
    }

    @Test
    void transferenciaNaoEntraComoReceita() {
        assertTrue(DreRegras.isTransferencia("Transferência entre contas"));
        assertFalse(DreRegras.isTransferencia("TED recebida"));
        assertFalse(DreRegras.isTransferencia("Vendas no salão"));
        assertFalse(DreRegras.isTransferencia(null));
    }
}
