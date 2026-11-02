package com.parisdevs.api.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Mensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fk_conversa")
    private Conversa conversa;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fk_autor")
    private Usuario autor;

    @Column(nullable = false, length = 2000)
    private String texto;

    @Column(nullable = false)
    private LocalDateTime criadoEm;

    private LocalDateTime editadoEm;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Conversa getConversa() {
        return conversa;
    }

    public void setConversa(Conversa conversa) {
        this.conversa = conversa;
    }

    public Usuario getAutor() {
        return autor;
    }

    public void setAutor(Usuario autor) {
        this.autor = autor;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public LocalDateTime getEditadoEm() {
        return editadoEm;
    }

    public void setEditadoEm(LocalDateTime editadoEm) {
        this.editadoEm = editadoEm;
    }
}
