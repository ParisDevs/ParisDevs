package com.parisdevs.api.dto;

import com.parisdevs.api.enums.Cargo;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "UsuarioResponse", description = "Usuário retornado pela API")
public class UsuarioResponseDto {

    private Integer id;
    private FilialResponseSimplesDto filial;
    private String nome;
    private Cargo cargo;
    private String email;

    public UsuarioResponseDto() {
    }

    public UsuarioResponseDto(Integer id, FilialResponseSimplesDto filial, String nome, Cargo cargo, String email) {
        this.id = id;
        this.filial = filial;
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
}
