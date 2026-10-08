package com.parisdevs.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UsuarioRequestDto {

    @Schema(description = "Nome completo do usuário", example = "Bob Silva")
    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @NotNull
    private Integer idFilial;

    @NotBlank
    private String cargo;

    @Schema(description = "Endereço de e-mail eletrônico", example = "bob@email.com")
    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Insira um e-mail válido")
    private String email;

    @Schema(description = "Senha de acesso ao sistema (mínimo 8 caracteres)", example = "Senha@123")
    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 8, max = 45, message = "A senha deve ter entre 8 e 45 caracteres")
    private String senha;

    public UsuarioRequestDto() {
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Integer getIdFilial() {
        return idFilial;
    }

    public void setIdFilial(Integer idFilial) {
        this.idFilial = idFilial;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
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
