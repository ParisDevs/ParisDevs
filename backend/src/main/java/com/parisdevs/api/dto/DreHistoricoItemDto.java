package com.parisdevs.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(name = "DreHistoricoItem", description = "Totais de um dia gravado no histórico")
public class DreHistoricoItemDto {

    private LocalDate dataReferencia;
    private LocalDateTime geradoEm;
    private Double receitaTotal;
    private Double receitaLiquida;
    private Double mercadorias;
    private Double percMercadorias;
    private Double resultado;

    public LocalDate getDataReferencia() {
        return dataReferencia;
    }

    public void setDataReferencia(LocalDate dataReferencia) {
        this.dataReferencia = dataReferencia;
    }

    public LocalDateTime getGeradoEm() {
        return geradoEm;
    }

    public void setGeradoEm(LocalDateTime geradoEm) {
        this.geradoEm = geradoEm;
    }

    public Double getReceitaTotal() {
        return receitaTotal;
    }

    public void setReceitaTotal(Double receitaTotal) {
        this.receitaTotal = receitaTotal;
    }

    public Double getReceitaLiquida() {
        return receitaLiquida;
    }

    public void setReceitaLiquida(Double receitaLiquida) {
        this.receitaLiquida = receitaLiquida;
    }

    public Double getMercadorias() {
        return mercadorias;
    }

    public void setMercadorias(Double mercadorias) {
        this.mercadorias = mercadorias;
    }

    public Double getPercMercadorias() {
        return percMercadorias;
    }

    public void setPercMercadorias(Double percMercadorias) {
        this.percMercadorias = percMercadorias;
    }

    public Double getResultado() {
        return resultado;
    }

    public void setResultado(Double resultado) {
        this.resultado = resultado;
    }
}
