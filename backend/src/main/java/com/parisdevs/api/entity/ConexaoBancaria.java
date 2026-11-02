package com.parisdevs.api.entity;

import com.parisdevs.api.enums.AmbienteConexao;
import com.parisdevs.api.enums.ProvedorBancario;
import com.parisdevs.api.enums.StatusConexao;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(name = "uk_conexao_conta", columnNames = "fk_conta_bancaria"))
public class ConexaoBancaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idConexao;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fk_conta_bancaria")
    private ContaBancaria contaBancaria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProvedorBancario provedor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AmbienteConexao ambiente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusConexao status;

    private LocalDateTime ultimaSincronizacao;

    @Column(length = 2000)
    private String ultimoErro;

    @Column(length = 2000)
    private String aviso;

    private String statementId;
    private String digitoVerificador;
    private String tipoContaItau;
    private String pluggyItemId;
    private String pluggyAccountId;
    private String pluggyExecutionStatus;
    private String cname;

    @Column(length = 1000)
    private String ips;

    private Boolean avaliacaoSolicitada;

    public Long getIdConexao() {
        return idConexao;
    }

    public void setIdConexao(Long idConexao) {
        this.idConexao = idConexao;
    }

    public ContaBancaria getContaBancaria() {
        return contaBancaria;
    }

    public void setContaBancaria(ContaBancaria contaBancaria) {
        this.contaBancaria = contaBancaria;
    }

    public ProvedorBancario getProvedor() {
        return provedor;
    }

    public void setProvedor(ProvedorBancario provedor) {
        this.provedor = provedor;
    }

    public AmbienteConexao getAmbiente() {
        return ambiente;
    }

    public void setAmbiente(AmbienteConexao ambiente) {
        this.ambiente = ambiente;
    }

    public StatusConexao getStatus() {
        return status;
    }

    public void setStatus(StatusConexao status) {
        this.status = status;
    }

    public LocalDateTime getUltimaSincronizacao() {
        return ultimaSincronizacao;
    }

    public void setUltimaSincronizacao(LocalDateTime ultimaSincronizacao) {
        this.ultimaSincronizacao = ultimaSincronizacao;
    }

    public String getUltimoErro() {
        return ultimoErro;
    }

    public void setUltimoErro(String ultimoErro) {
        this.ultimoErro = ultimoErro;
    }

    public String getAviso() {
        return aviso;
    }

    public void setAviso(String aviso) {
        this.aviso = aviso;
    }

    public String getStatementId() {
        return statementId;
    }

    public void setStatementId(String statementId) {
        this.statementId = statementId;
    }

    public String getDigitoVerificador() {
        return digitoVerificador;
    }

    public void setDigitoVerificador(String digitoVerificador) {
        this.digitoVerificador = digitoVerificador;
    }

    public String getTipoContaItau() {
        return tipoContaItau;
    }

    public void setTipoContaItau(String tipoContaItau) {
        this.tipoContaItau = tipoContaItau;
    }

    public String getPluggyItemId() {
        return pluggyItemId;
    }

    public void setPluggyItemId(String pluggyItemId) {
        this.pluggyItemId = pluggyItemId;
    }

    public String getPluggyAccountId() {
        return pluggyAccountId;
    }

    public void setPluggyAccountId(String pluggyAccountId) {
        this.pluggyAccountId = pluggyAccountId;
    }

    public String getPluggyExecutionStatus() {
        return pluggyExecutionStatus;
    }

    public void setPluggyExecutionStatus(String pluggyExecutionStatus) {
        this.pluggyExecutionStatus = pluggyExecutionStatus;
    }

    public String getCname() {
        return cname;
    }

    public void setCname(String cname) {
        this.cname = cname;
    }

    public String getIps() {
        return ips;
    }

    public void setIps(String ips) {
        this.ips = ips;
    }

    public Boolean getAvaliacaoSolicitada() {
        return avaliacaoSolicitada;
    }

    public void setAvaliacaoSolicitada(Boolean avaliacaoSolicitada) {
        this.avaliacaoSolicitada = avaliacaoSolicitada;
    }
}
