package com.parisdevs.api.dto;

import com.parisdevs.api.enums.Cargo;
import com.parisdevs.api.entity.Filial;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

public class UsuarioResponseDto {

    private Integer id;
    private FilialResponseSimplesDto filial;
    private String nome;
    private Cargo cargo;
    private String email;
    private String senha;

    public UsuarioResponseDto() {
    }

    public UsuarioResponseDto(Integer id, FilialResponseSimplesDto filial, String nome, Cargo cargo, String email, String senha) {
        this.id = id;
        this.filial = filial;
        this.nome = nome;
        this.cargo = cargo;
        this.email = email;
        this.senha = senha;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public FilialResponseSimplesDto getFilial() {
        return filial;
    }

    public void setFilial(FilialResponseSimplesDto filial) {
        this.filial = filial;
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

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
}
