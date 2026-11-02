package com.parisdevs.api.entity;

import com.parisdevs.api.enums.TipoCaptura;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class CapturaProvedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCaptura;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fk_conexao")
    private ConexaoBancaria conexao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCaptura tipo;

    @Lob
    @Column(columnDefinition = "text")
    private String payload;

    private LocalDateTime capturadoEm;

    public Long getIdCaptura() {
        return idCaptura;
    }

    public void setIdCaptura(Long idCaptura) {
        this.idCaptura = idCaptura;
    }

    public ConexaoBancaria getConexao() {
        return conexao;
    }

    public void setConexao(ConexaoBancaria conexao) {
        this.conexao = conexao;
    }

    public TipoCaptura getTipo() {
        return tipo;
    }

    public void setTipo(TipoCaptura tipo) {
        this.tipo = tipo;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public LocalDateTime getCapturadoEm() {
        return capturadoEm;
    }

    public void setCapturadoEm(LocalDateTime capturadoEm) {
        this.capturadoEm = capturadoEm;
    }
}
