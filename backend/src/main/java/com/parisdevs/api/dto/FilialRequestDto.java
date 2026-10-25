package com.parisdevs.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FilialRequestDto {

    @Schema(description = "Razão Social da filial", example = "Paris 6 Jardins LTDA")
    @NotBlank(message = "A razão social é obrigatória")
    private String razaoSocial;

    @Schema(description = "CNPJ da filial (apenas os 14 números)", example = "12345678000199")
    @NotBlank(message = "O CNPJ é obrigatório")
    @Size(min = 14, max = 14, message = "O CNPJ deve ter exatamente 14 caracteres")
    private String cnpj;

    @Schema(description = "Endereço físico completo da filial", example = "Alameda Lorena, 123 - São Paulo/SP")
    @NotBlank(message = "O endereço é obrigatório")
    private String endereco;

    @Schema(description = "Token de autenticação para integrações", example = "tok_p6_jardins")
    @NotBlank(message = "O token é obrigatório")
    private String token;

    public FilialRequestDto() {
    }

    public FilialRequestDto(String razaoSocial, String cnpj, String endereco, String token) {
        this.razaoSocial = razaoSocial;
        this.cnpj = cnpj;
        this.endereco = endereco;
        this.token = token;
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
