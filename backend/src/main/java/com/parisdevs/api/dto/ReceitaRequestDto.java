package com.parisdevs.api.dto;

import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class ReceitaRequestDto {

    @ManyToOne
    private Integer fkContaBancaria;

    private String descricao;

    @NotNull
    @Min(0)
    private Double valor;

    @NotNull
    private LocalDate dataReceita;

    @NotBlank
    private String categoria;

    public ReceitaRequestDto() {
    }

    public ReceitaRequestDto(Integer fkContaBancaria, String descricao, Double valor, LocalDate dataReceita, String categoria) {
        this.fkContaBancaria = fkContaBancaria;
        this.descricao = descricao;
        this.valor = valor;
        this.dataReceita = dataReceita;
        this.categoria = categoria;
    }

    public Integer getFkContaBancaria() {
        return fkContaBancaria;
    }

    public void setFkContaBancaria(Integer fkContaBancaria) {
        this.fkContaBancaria = fkContaBancaria;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public @NotNull @Min(0) Double getValor() {
        return valor;
    }

    public void setValor(@NotNull @Min(0) Double valor) {
        this.valor = valor;
    }

    public @NotNull LocalDate getDataReceita() {
        return dataReceita;
    }

    public void setDataReceita(@NotNull LocalDate dataReceita) {
        this.dataReceita = dataReceita;
    }

    public @NotBlank String getCategoria() {
        return categoria;
    }

    public void setCategoria(@NotBlank String categoria) {
        this.categoria = categoria;
    }
}
