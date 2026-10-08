package com.parisdevs.api.dto;

public class FilialResponseDto {

    private Integer idFilial;
    private String razaoSocial;
    private String cnpj;
    private String endereco;
    private String token;

    public FilialResponseDto() {
    }

    public FilialResponseDto(Integer idFilial, String razaoSocial, String cnpj, String endereco, String token) {
        this.idFilial = idFilial;
        this.razaoSocial = razaoSocial;
        this.cnpj = cnpj;
        this.endereco = endereco;
        this.token = token;
    }

    public Integer getIdFilial() {
        return idFilial;
    }

    public void setIdFilial(Integer idFilial) {
        this.idFilial = idFilial;
    }

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
