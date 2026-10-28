package com.parisdevs.api.dto;

import com.parisdevs.api.enums.TipoOperacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDateTime;

public class OperacaoRequestDto {

    @NotNull
    @PositiveOrZero
    private Double valorOperacao;

    @NotNull
    private TipoOperacao tipoOperacao;

    @NotBlank
    private String razaoSocial;

    @NotBlank
    private String categoria;

    @NotNull
    private LocalDateTime dtHora;

    @NotNull
    private Long idContaBancaria;

    public OperacaoRequestDto(Double valorOperacao, TipoOperacao tipoOperacao, String razaoSocial, String categoria, LocalDateTime dtHora, Long idContaBancaria) {
        this.valorOperacao = valorOperacao;
        this.tipoOperacao = tipoOperacao;
        this.razaoSocial = razaoSocial;
        this.categoria = categoria;
        this.dtHora = dtHora;
        this.idContaBancaria = idContaBancaria;
    }

    public Double getValorOperacao() {
        return valorOperacao;
    }

    public void setValorOperacao(Double valorOperacao) {
        this.valorOperacao = valorOperacao;
    }

    public TipoOperacao getTipoOperacao() {
        return tipoOperacao;
    }

    public void setTipoOperacao(TipoOperacao tipoOperacao) {
        this.tipoOperacao = tipoOperacao;
    }

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public LocalDateTime getDtHora() {
        return dtHora;
    }

    public void setDtHora(LocalDateTime dtHora) {
        this.dtHora = dtHora;
    }

    public Long getIdContaBancaria() {
        return idContaBancaria;
    }

    public void setIdContaBancaria(Long idContaBancaria) {
        this.idContaBancaria = idContaBancaria;
    }
}
