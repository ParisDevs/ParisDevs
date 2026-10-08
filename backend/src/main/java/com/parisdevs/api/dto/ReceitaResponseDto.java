package com.parisdevs.api.dto;

import com.parisdevs.api.entity.ContaBancaria;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class ReceitaResponseDto {

    private Integer idReceita;
    private ContaBancariaResponseDto contaBancaria;
    private String descricao;
    private Double valor;
    private LocalDate dataReceita;
    private String categoria;

    public ReceitaResponseDto() {
    }

    public ReceitaResponseDto(Integer idReceita, ContaBancariaResponseDto contaBancaria, String descricao, Double valor, LocalDate dataReceita, String categoria) {
        this.idReceita = idReceita;
        this.contaBancaria = contaBancaria;
        this.descricao = descricao;
        this.valor = valor;
        this.dataReceita = dataReceita;
        this.categoria = categoria;
    }

    public Integer getIdReceita() {
        return idReceita;
    }

    public void setIdReceita(Integer idReceita) {
        this.idReceita = idReceita;
    }

    public ContaBancariaResponseDto getContaBancaria() {
        return contaBancaria;
    }

    public void setContaBancaria(ContaBancariaResponseDto contaBancaria) {
        this.contaBancaria = contaBancaria;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public LocalDate getDataReceita() {
        return dataReceita;
    }

    public void setDataReceita(LocalDate dataReceita) {
        this.dataReceita = dataReceita;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }
}
