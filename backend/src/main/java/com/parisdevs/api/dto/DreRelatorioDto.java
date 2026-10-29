package com.parisdevs.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Schema(name = "DreRelatorio", description = "DRE do recorte mensal até a data de referência")
public class DreRelatorioDto {

    private LocalDate dataReferencia;
    private String origem;
    private List<DreLinhaDto> linhas = new ArrayList<>();
    private DreLinhaDto total;

    public LocalDate getDataReferencia() {
        return dataReferencia;
    }

    public void setDataReferencia(LocalDate dataReferencia) {
        this.dataReferencia = dataReferencia;
    }

    public String getOrigem() {
        return origem;
    }

    public void setOrigem(String origem) {
        this.origem = origem;
    }

    public List<DreLinhaDto> getLinhas() {
        return linhas;
    }

    public void setLinhas(List<DreLinhaDto> linhas) {
        this.linhas = linhas;
    }

    public DreLinhaDto getTotal() {
        return total;
    }

    public void setTotal(DreLinhaDto total) {
        this.total = total;
    }
}
