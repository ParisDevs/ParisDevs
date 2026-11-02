package com.parisdevs.api.entity;

import com.parisdevs.api.enums.TipoConversa;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(name = "uk_conversa_direta", columnNames = "chave_direta"))
public class Conversa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoConversa tipo;

    private String titulo;

    @Column(name = "chave_direta")
    private String chaveDireta;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fk_criado_por")
    private Usuario criadoPor;

    @Column(nullable = false)
    private LocalDateTime criadoEm;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TipoConversa getTipo() {
        return tipo;
    }

    public void setTipo(TipoConversa tipo) {
        this.tipo = tipo;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getChaveDireta() {
        return chaveDireta;
    }

    public void setChaveDireta(String chaveDireta) {
        this.chaveDireta = chaveDireta;
    }

    public Usuario getCriadoPor() {
        return criadoPor;
    }

    public void setCriadoPor(Usuario criadoPor) {
        this.criadoPor = criadoPor;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }
}
