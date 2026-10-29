package com.parisdevs.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "UsuarioLogin", description = "Credenciais de acesso")
public class UsuarioLoginDto {

    @Schema(description = "E-mail do usuário", example = "carlos@techsolutions.com")
    private String email;

    @Schema(description = "Senha do usuário", example = "senha123")
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
