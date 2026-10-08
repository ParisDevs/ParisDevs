package com.parisdevs.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
public class ContaBancaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idContaBancaria;

    @ManyToOne
    private Filial filial;
    private String codigoBanco;
    private String nomeInstituicao;
    private String agencia;
    private String agenciaDigito;
    private String numeroConta;
    private String tipoConta;
    private String cpfCnpjTitular;
    private String nomeTitular;
    private Boolean ativo;

    public ContaBancaria() {
    }

    public ContaBancaria(Integer idContaBancaria, Filial filial, String codigoBanco, String nomeInstituicao, String agencia, String agenciaDigito, String numeroConta, String tipoConta, String cpfCnpjTitular, String nomeTitular, Boolean ativo) {
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
}
