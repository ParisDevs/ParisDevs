package com.parisdevs.api.parser;

import org.springframework.stereotype.Component;

import com.parisdevs.api.dto.ContaOfxDTO;
import com.parisdevs.api.dto.ImportacaoExtratoResponse;
import com.parisdevs.api.dto.TransacaoOfxDTO;
import com.webcohesion.ofx4j.generated.BankAccount;
import com.webcohesion.ofx4j.generated.BankTransactionList;
import com.webcohesion.ofx4j.generated.LedgerBalance;
import com.webcohesion.ofx4j.generated.OFX;
import com.webcohesion.ofx4j.generated.StatementResponse;
import com.webcohesion.ofx4j.generated.StatementTransaction;
import com.webcohesion.ofx4j.generated.StatementTransactionResponse;
import com.webcohesion.ofx4j.io.AggregateUnmarshaller;
import com.webcohesion.ofx4j.io.OFXParseException;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
public class OfxParser {

    public ImportacaoExtratoResponse parse(InputStream arquivo)
            throws IOException, OFXParseException {

        AggregateUnmarshaller<OFX> unmarshaller =
                new AggregateUnmarshaller<>(OFX.class);

        OFX ofx = unmarshaller.unmarshal(arquivo);

        if (ofx == null || ofx.getBANKMSGSRSV1() == null) {
            throw new IllegalArgumentException(
                    "O arquivo OFX não contém informações bancárias."
            );
        }

        List<StatementTransactionResponse> respostas =
                ofx.getBANKMSGSRSV1()
                        .getSTMTTRNRSOrSTMTENDTRNRSOrINTRATRNRS()
                        .stream()
                        .filter(StatementTransactionResponse.class::isInstance)
                        .map(StatementTransactionResponse.class::cast)
                        .toList();

        if (respostas.isEmpty() || respostas.get(0).getSTMTRS() == null) {
            throw new IllegalArgumentException(
                    "O arquivo OFX não contém um extrato bancário válido."
            );
        }

        // Por enquanto, processamos o primeiro extrato encontrado.
        StatementResponse extrato = respostas.get(0).getSTMTRS();

        ContaOfxDTO conta = converterConta(extrato);
        List<TransacaoOfxDTO> transacoes = converterTransacoes(extrato);

        BankTransactionList periodo = extrato.getBANKTRANLIST();

        LocalDateTime periodoInicio = periodo == null
                ? null
                : converterData(periodo.getDTSTART());

        LocalDateTime periodoFim = periodo == null
                ? null
                : converterData(periodo.getDTEND());

        return new ImportacaoExtratoResponse(
                conta,
                periodoInicio,
                periodoFim,
                transacoes
        );
    }

    private ContaOfxDTO converterConta(StatementResponse extrato) {

        BankAccount conta = extrato.getBANKACCTFROM();
        LedgerBalance saldo = extrato.getLEDGERBAL();

        return new ContaOfxDTO(
                conta == null ? null : conta.getBANKID(),
                conta == null ? null : conta.getACCTID(),
                conta == null || conta.getACCTTYPE() == null
                        ? null
                        : conta.getACCTTYPE().toString(),
                extrato.getCURDEF() == null
                        ? null
                        : extrato.getCURDEF().toString(),
                saldo == null ? null : converterValor(saldo.getBALAMT()),
                saldo == null ? null : converterData(saldo.getDTASOF())
        );
    }

    private List<TransacaoOfxDTO> converterTransacoes(
            StatementResponse extrato) {

        BankTransactionList lista = extrato.getBANKTRANLIST();

        if (lista == null || lista.getSTMTTRN() == null) {
            return List.of();
        }

        List<TransacaoOfxDTO> transacoes = new ArrayList<>();

        for (StatementTransaction transacao : lista.getSTMTTRN()) {

            transacoes.add(new TransacaoOfxDTO(
                    transacao.getFITID(),
                    transacao.getTRNTYPE() == null
                            ? null
                            : transacao.getTRNTYPE().toString(),
                    converterData(transacao.getDTPOSTED()),
                    converterValor(transacao.getTRNAMT()),
                    transacao.getNAME(),
                    transacao.getMEMO()
            ));
        }

        return transacoes;
    }

    private BigDecimal converterValor(String valor) {

        if (valor == null || valor.isBlank()) {
            return null;
        }

        try {
            return new BigDecimal(valor.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                    "Valor monetário inválido no arquivo OFX: " + valor,
                    e
            );
        }
    }

    private LocalDateTime converterData(String data) {

        if (data == null || data.isBlank()) {
            return null;
        }

        // Remove a informação de fuso entre colchetes, por exemplo [-3:BRT].
        String somenteData = data.trim().split("\\[", 2)[0];

        // Mantém somente os números da data.
        String numeros = somenteData.replaceAll("\\D", "");

        if (numeros.length() < 8 || numeros.length() > 14) {
            throw new IllegalArgumentException(
                    "Data OFX inválida: " + data
            );
        }

        // Completa horários ausentes com zeros.
        numeros = numeros + "0".repeat(14 - numeros.length());

        return LocalDateTime.parse(
                numeros,
                DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
        );
    }
}

