package com.parisdevs.api.entity;


import com.parisdevs.api.enums.TipoOperacao;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Operacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idOperacao;
    private Double valorOperacao;
    private TipoOperacao tipoOperacao;
    private String razaoSocial;
    private String categoria;
    private LocalDateTime dtHora;

    @ManyToOne
    @JoinColumn (name = "fkContaBancaria")
    private ContaBancaria contaBancaria;

    public Long getIdOperacao() {
        return idOperacao;
    }

    public void setIdOperacao(Long idOperacao) {
        this.idOperacao = idOperacao;
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

    public ContaBancaria getContaBancaria() {
        return contaBancaria;
    }

    public void setContaBancaria(ContaBancaria contaBancaria) {
        this.contaBancaria = contaBancaria;
    }
}