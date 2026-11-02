package com.parisdevs.api.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(name = "uk_membro_conversa_usuario", columnNames = {"fk_conversa", "fk_usuario"}))
public class MembroConversa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fk_conversa")
    private Conversa conversa;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fk_usuario")
    private Usuario usuario;

    private LocalDateTime lastReadEm;

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

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public LocalDateTime getLastReadEm() {
        return lastReadEm;
    }

    public void setLastReadEm(LocalDateTime lastReadEm) {
        this.lastReadEm = lastReadEm;
    }
}
