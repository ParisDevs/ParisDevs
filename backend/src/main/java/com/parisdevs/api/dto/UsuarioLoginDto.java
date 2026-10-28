package com.parisdevs.api.dto;

public class UsuarioLoginDto {
    private String email;
    private String senha;

    //construtor
    public UsuarioLoginDto(String email, String senha) {
        this.email = email;
        this.senha = senha;
    }

    //
    public UsuarioLoginDto() {
    }

    //getters setters
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
