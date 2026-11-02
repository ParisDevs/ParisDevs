package com.parisdevs.api.entity;


import com.parisdevs.api.enums.OrigemDados;
import com.parisdevs.api.enums.TipoOperacao;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(name = "uk_operacao_origem_externa", columnNames = {"origem", "id_externo"}))
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

    @Enumerated(EnumType.STRING)
    private OrigemDados origem;

    private String idExterno;

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

    public OrigemDados getOrigem() {
        return origem == null ? OrigemDados.MANUAL : origem;
    }

    public void setOrigem(OrigemDados origem) {
        this.origem = origem;
    }

    public String getIdExterno() {
        return idExterno;
    }

    public void setIdExterno(String idExterno) {
        this.idExterno = idExterno;
    }
}