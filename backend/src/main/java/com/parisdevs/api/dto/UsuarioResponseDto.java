package com.parisdevs.api.dto;

import com.parisdevs.api.enums.Cargo;

public class UsuarioResponseDto {

    private Integer id;
    private String nome;
    private Cargo cargo;
    private String email;

    public UsuarioResponseDto() {
    }

    public UsuarioResponseDto(Integer id, String nome, Cargo cargo, String email) {
        this.id = id;
        this.nome = nome;
        this.cargo = cargo;
        this.email = email;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Cargo getCargo() {
        return cargo;
    }

    public void setCargo(Cargo cargo) {
        this.cargo = cargo;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
