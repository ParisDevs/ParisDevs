package com.parisdevs.api.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parisdevs.api.enums.OrigemDados;
import com.parisdevs.api.enums.TipoOperacao;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SincronizacaoLeituraTest {

    private final ObjectMapper json = new ObjectMapper();

    @Test
    void statementIdSegueOExemploDoPortal() {
        assertEquals("150001234567", StatementIdItau.montar("1500", "0123456", "7"));
        assertEquals("150001234567", StatementIdItau.montar("Ag. 1500", "0123456-7", ""));
        assertEquals("041200123456", StatementIdItau.montar("0412", "12345-6", ""));
    }

    @Test
    void extratoVazioDoPortalNaoInventaLancamento() throws Exception {
        ItauExtratoReader.Leitura leitura = ItauExtratoReader.ler(json.readTree("{\"data\":{}}"));
        assertTrue(leitura.esquemaReconhecido());
        assertTrue(leitura.eventos().isEmpty());
    }

    @Test
    void eventoComLiteralCompleteEAmountViraOperacaoESaldoNao() throws Exception {
        String corpo = """
                {"data":{"events":[
                  {"id":"evt-1","operation":"C","literal":{"complete":"PIX RECEBIDO","shortened":"PIX"},
                   "amount":{"value":150.2,"currency":"BRL"},"date":{"event":"2026-11-03T10:15:00-03:00"},
                   "counterpart":{"name":"Fornecedor XPTO"}},
                  {"literal":{"complete":"SALDO DISPONIVEL"},"amount":{"value":999.0},"type":"saldo"}
                ]},"pagination":{"total_pages":2}}
                """;
        ItauExtratoReader.Leitura leitura = ItauExtratoReader.ler(json.readTree(corpo));
        assertTrue(leitura.esquemaReconhecido());
        assertEquals(1, leitura.eventos().size());
        assertEquals(2, leitura.totalPaginas());
        ItauExtratoReader.Evento evento = leitura.eventos().get(0);
        assertEquals("evt-1", evento.idExterno());
        assertEquals(TipoOperacao.RECEBIMENTO, evento.tipo());
        assertEquals(new BigDecimal("150.20"), evento.valor());
        assertEquals("Fornecedor XPTO", evento.descricao());
        assertEquals("PIX", evento.categoria());
    }

    @Test
    void payloadComConteudoSemOParDocumentadoNaoViraLancamento() throws Exception {
        ItauExtratoReader.Leitura leitura = ItauExtratoReader.ler(json.readTree("{\"data\":{\"events\":[{\"foo\":1}]}}"));
        assertFalse(leitura.esquemaReconhecido());
        assertTrue(leitura.eventos().isEmpty());
    }

    @Test
    void transacaoPluggyUsaIdAmountETypeDaReferencia() throws Exception {
        String corpo = """
                {"total":1,"totalPages":1,"page":1,"results":[
                  {"id":"6ec156fe-e8ac-4d9a-a4b3-7770529ab01c","description":"TED Example","amount":1500,
                   "date":"2020-10-14T00:00:00.000Z","category":"Transfer","type":"CREDIT","status":"POSTED"}
                ]}
                """;
        var eventos = PluggyTransacaoReader.lerPagina(json.readTree(corpo));
        assertEquals(1, eventos.size());
        assertEquals(TipoOperacao.RECEBIMENTO, eventos.get(0).tipo());
        assertEquals(new BigDecimal("1500.00"), eventos.get(0).valor());
        assertEquals("Transfer", eventos.get(0).categoria());
        assertTrue(DreRegras.isTransferencia(eventos.get(0).categoria()));
    }

    @Test
    void saldoPluggyPrefereBalance() throws Exception {
        var conta = json.readTree("""
                {"balance":21544.6,"bankData":{"closingBalance":1.0}}
                """);
        assertEquals(new BigDecimal("21544.60"), SaldoProvedor.pluggy(conta));
    }

    @Test
    void lancamentoDeBancoNaoMoveSaldoPeloCadastro() {
        assertTrue(InvarianteSincronizacao.protegida(OrigemDados.ITAU));
        assertTrue(InvarianteSincronizacao.protegida(OrigemDados.PLUGGY));
        assertTrue(InvarianteSincronizacao.protegida(OrigemDados.XP));
        assertFalse(InvarianteSincronizacao.protegida(OrigemDados.MANUAL));
        assertTrue(InvarianteSincronizacao.saldoPorLancamento(null));
    }
}
