package com.parisdevs.api.dto;


import jakarta.validation.constraints.NotBlank;

public class FilialRequestDto {

    @NotBlank
    private String razaoSocial;

    @NotBlank
    private String cnpj;

    @NotBlank
    private String endereco;

    @NotBlank
    private String token;

    public FilialRequestDto() {
    }

    public FilialRequestDto(String razaoSocial, String cnpj, String endereco, String token) {
        this.razaoSocial = razaoSocial;
        this.cnpj = cnpj;
        this.endereco = endereco;
        this.token = token;
    }


    public @NotBlank String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(@NotBlank String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }

    public @NotBlank String getCnpj() {
        return cnpj;
    }

    public void setCnpj(@NotBlank String cnpj) {
        this.cnpj = cnpj;
    }

    public @NotBlank String getEndereco() {
        return endereco;
    }

    public void setEndereco(@NotBlank String endereco) {
        this.endereco = endereco;
    }

    public @NotBlank String getToken() {
        return token;
    }

    public void setToken(@NotBlank String token) {
        this.token = token;
    }
}
