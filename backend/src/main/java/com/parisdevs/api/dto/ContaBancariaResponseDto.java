package com.parisdevs.api.dto;

import com.parisdevs.api.entity.Filial;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ContaBancariaResponseDto {


    private Integer idContaBancaria;
    private FilialResponseSimplesDto filial;
    private String codigoBanco;
    private String nomeInstituicao;
    private String agencia;
    private String agenciaDigito;
    private String numeroConta;
    private String tipoConta;
    private String cpfCnpjTitular;
    private String nomeTitular;
    private Boolean ativo;


    public ContaBancariaResponseDto() {
    }

    public ContaBancariaResponseDto(Integer idContaBancaria, FilialResponseSimplesDto filial, String codigoBanco, String nomeInstituicao, String agencia, String agenciaDigito, String numeroConta, String tipoConta, String cpfCnpjTitular, String nomeTitular, Boolean ativo) {
        this.idContaBancaria = idContaBancaria;
        this.filial = filial;
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

    public Integer getIdContaBancaria() {
        return idContaBancaria;
    }

    public void setIdContaBancaria(Integer idContaBancaria) {
        this.idContaBancaria = idContaBancaria;
    }

    public FilialResponseSimplesDto getFilial() {
        return filial;
    }

    public void setFilial(FilialResponseSimplesDto filial) {
        this.filial = filial;
    }

    public String getCodigoBanco() {
        return codigoBanco;
    }

    public void setCodigoBanco(String codigoBanco) {
        this.codigoBanco = codigoBanco;
    }

    public String getNomeInstituicao() {
        return nomeInstituicao;
    }

    public void setNomeInstituicao(String nomeInstituicao) {
        this.nomeInstituicao = nomeInstituicao;
    }

    public String getAgencia() {
        return agencia;
    }

    public void setAgencia(String agencia) {
        this.agencia = agencia;
    }

    public String getAgenciaDigito() {
        return agenciaDigito;
    }

    public void setAgenciaDigito(String agenciaDigito) {
        this.agenciaDigito = agenciaDigito;
    }

    public String getNumeroConta() {
        return numeroConta;
    }

    public void setNumeroConta(String numeroConta) {
        this.numeroConta = numeroConta;
    }

    public String getTipoConta() {
        return tipoConta;
    }

    public void setTipoConta(String tipoConta) {
        this.tipoConta = tipoConta;
    }

    public String getCpfCnpjTitular() {
        return cpfCnpjTitular;
    }

    public void setCpfCnpjTitular(String cpfCnpjTitular) {
        this.cpfCnpjTitular = cpfCnpjTitular;
    }

    public String getNomeTitular() {
        return nomeTitular;
    }

    public void setNomeTitular(String nomeTitular) {
        this.nomeTitular = nomeTitular;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}
