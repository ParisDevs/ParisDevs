package com.parisdevs.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ContaBancariaRequestDto {


    private Integer fkFilial;

    @NotBlank
    private String codigoBanco;

    @NotBlank
    private String nomeInstituicao;

    @NotBlank
    private String agencia;

    @NotBlank
    private String agenciaDigito;

    @NotBlank
    private String numeroConta;

    @NotBlank
    private String tipoConta;

    @NotBlank
    private String cpfCnpjTitular;

    @NotBlank
    private String nomeTitular;

    @NotNull
    private Boolean ativo;

    public ContaBancariaRequestDto() {
    }

    public ContaBancariaRequestDto(Integer fkFilial, String codigoBanco, String nomeInstituicao, String agencia, String agenciaDigito, String numeroConta, String tipoConta, String cpfCnpjTitular, String nomeTitular, Boolean ativo) {
        this.fkFilial = fkFilial;
        this.codigoBanco = codigoBanco;
        this.nomeInstituicao = nomeInstituicao;
        this.agencia = agencia;
        this.agenciaDigito = agenciaDigito;
        this.numeroConta = numeroConta;
        this.tipoConta = tipoConta;
        this.cpfCnpjTitular = cpfCnpjTitular;
        this.nomeTitular = nomeTitular;
        this.ativo = ativo;
    }

    public Integer getFkFilial() {
        return fkFilial;
    }

    public void setFkFilial(Integer fkFilial) {
        this.fkFilial = fkFilial;
    }

    public @NotBlank String getCodigoBanco() {
        return codigoBanco;
    }

    public void setCodigoBanco(@NotBlank String codigoBanco) {
        this.codigoBanco = codigoBanco;
    }

    public @NotBlank String getNomeInstituicao() {
        return nomeInstituicao;
    }

    public void setNomeInstituicao(@NotBlank String nomeInstituicao) {
        this.nomeInstituicao = nomeInstituicao;
    }

    public @NotBlank String getAgencia() {
        return agencia;
    }

    public void setAgencia(@NotBlank String agencia) {
        this.agencia = agencia;
    }

    public @NotBlank String getAgenciaDigito() {
        return agenciaDigito;
    }

    public void setAgenciaDigito(@NotBlank String agenciaDigito) {
        this.agenciaDigito = agenciaDigito;
    }

    public @NotBlank String getNumeroConta() {
        return numeroConta;
    }

    public void setNumeroConta(@NotBlank String numeroConta) {
        this.numeroConta = numeroConta;
    }

    public @NotBlank String getTipoConta() {
        return tipoConta;
    }

    public void setTipoConta(@NotBlank String tipoConta) {
        this.tipoConta = tipoConta;
    }

    public @NotBlank String getCpfCnpjTitular() {
        return cpfCnpjTitular;
    }

    public void setCpfCnpjTitular(@NotBlank String cpfCnpjTitular) {
        this.cpfCnpjTitular = cpfCnpjTitular;
    }

    public @NotBlank String getNomeTitular() {
        return nomeTitular;
    }

    public void setNomeTitular(@NotBlank String nomeTitular) {
        this.nomeTitular = nomeTitular;
    }

    public @NotNull Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(@NotNull Boolean ativo) {
        this.ativo = ativo;
    }
}
