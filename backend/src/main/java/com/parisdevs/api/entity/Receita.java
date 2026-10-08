package com.parisdevs.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Entity
public class Receita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idReceita;

    @ManyToOne
    private ContaBancaria contaBancaria;

    private String descricao;

    @NotNull
    @Min(0)
    private Double valor;

    @NotNull
    private LocalDate dataReceita;

    @NotBlank
    private String categoria;

    public Receita() {
    }

    public Receita(Integer idReceita, ContaBancaria contaBancaria, String descricao, Double valor, LocalDate dataReceita, String categoria) {
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

    public ContaBancaria getContaBancaria() {
        return contaBancaria;
    }

    public void setContaBancaria(ContaBancaria contaBancaria) {
        this.contaBancaria = contaBancaria;
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
