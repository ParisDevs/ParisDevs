package com.parisdevs.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "DreLinha", description = "Linha da DRE diária por filial")
public class DreLinhaDto {

    private Integer idFilial;
    private String empresaRelatorio;
    private Double receitaTotal;
    private Double receitaLiquida;
    private Double mercadorias;
    private Double percMercadorias;
    private Double resultado;

    public Integer getIdFilial() {
        return idFilial;
    }

    public void setIdFilial(Integer idFilial) {
        this.idFilial = idFilial;
    }

    public String getEmpresaRelatorio() {
        return empresaRelatorio;
    }

    public void setEmpresaRelatorio(String empresaRelatorio) {
        this.empresaRelatorio = empresaRelatorio;
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
