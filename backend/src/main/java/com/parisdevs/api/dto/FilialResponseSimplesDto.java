package com.parisdevs.api.dto;

public class FilialResponseSimplesDto {

    private Integer idFilial;
    private String razaoSocial;

    public FilialResponseSimplesDto() {
    }

    public FilialResponseSimplesDto(Integer idFilial, String razaoSocial) {
        this.idFilial = idFilial;
        this.razaoSocial = razaoSocial;
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
}

