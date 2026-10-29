package com.parisdevs.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "FilialResponse", description = "Empresa retornada pela API")
public class FilialResponseDto {

    private Integer idFilial;
    private String razaoSocial;
    private String nomeFantasia;
    private String cnpj;
    private String inscricaoEstadual;
    private String inscricaoMunicipal;
    private String regimeTributario;
    private String cnaePrincipal;
    private String dataAbertura;
    private String situacaoCadastral;
    private String endereco;
    private String token;
    private String cep;
    private String logradouro;
    private String numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String uf;
    private String pais;
    private String responsavelNome;
    private String responsavelCpf;
    private String responsavelEmail;
    private String responsavelTelefone;
    private String responsavelCargo;
    private String moedaPadrao;
    private String fusoHorario;
    private String planoContas;
    private String dataInicioOperacao;
    private String centroCustoPadrao;
    private String exercicioFiscal;
    private String empresasVinculadas;

    public FilialResponseDto() {
    }

    public Integer getIdFilial() { return idFilial; }
    public void setIdFilial(Integer idFilial) { this.idFilial = idFilial; }
    public String getRazaoSocial() { return razaoSocial; }
    public void setRazaoSocial(String razaoSocial) { this.razaoSocial = razaoSocial; }
    public String getNomeFantasia() { return nomeFantasia; }
    public void setNomeFantasia(String nomeFantasia) { this.nomeFantasia = nomeFantasia; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    public String getInscricaoEstadual() { return inscricaoEstadual; }
    public void setInscricaoEstadual(String inscricaoEstadual) { this.inscricaoEstadual = inscricaoEstadual; }
    public String getInscricaoMunicipal() { return inscricaoMunicipal; }
    public void setInscricaoMunicipal(String inscricaoMunicipal) { this.inscricaoMunicipal = inscricaoMunicipal; }
    public String getRegimeTributario() { return regimeTributario; }
    public void setRegimeTributario(String regimeTributario) { this.regimeTributario = regimeTributario; }
    public String getCnaePrincipal() { return cnaePrincipal; }
    public void setCnaePrincipal(String cnaePrincipal) { this.cnaePrincipal = cnaePrincipal; }
    public String getDataAbertura() { return dataAbertura; }
    public void setDataAbertura(String dataAbertura) { this.dataAbertura = dataAbertura; }
    public String getSituacaoCadastral() { return situacaoCadastral; }
    public void setSituacaoCadastral(String situacaoCadastral) { this.situacaoCadastral = situacaoCadastral; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }
    public String getLogradouro() { return logradouro; }
    public void setLogradouro(String logradouro) { this.logradouro = logradouro; }
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }
    public String getComplemento() { return complemento; }
    public void setComplemento(String complemento) { this.complemento = complemento; }
    public String getBairro() { return bairro; }
    public void setBairro(String bairro) { this.bairro = bairro; }
    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }
    public String getUf() { return uf; }
    public void setUf(String uf) { this.uf = uf; }
    public String getPais() { return pais; }
    public void setPais(String pais) { this.pais = pais; }
    public String getResponsavelNome() { return responsavelNome; }
    public void setResponsavelNome(String responsavelNome) { this.responsavelNome = responsavelNome; }
    public String getResponsavelCpf() { return responsavelCpf; }
    public void setResponsavelCpf(String responsavelCpf) { this.responsavelCpf = responsavelCpf; }
    public String getResponsavelEmail() { return responsavelEmail; }
    public void setResponsavelEmail(String responsavelEmail) { this.responsavelEmail = responsavelEmail; }
    public String getResponsavelTelefone() { return responsavelTelefone; }
    public void setResponsavelTelefone(String responsavelTelefone) { this.responsavelTelefone = responsavelTelefone; }
    public String getResponsavelCargo() { return responsavelCargo; }
    public void setResponsavelCargo(String responsavelCargo) { this.responsavelCargo = responsavelCargo; }
    public String getMoedaPadrao() { return moedaPadrao; }
    public void setMoedaPadrao(String moedaPadrao) { this.moedaPadrao = moedaPadrao; }
    public String getFusoHorario() { return fusoHorario; }
    public void setFusoHorario(String fusoHorario) { this.fusoHorario = fusoHorario; }
    public String getPlanoContas() { return planoContas; }
    public void setPlanoContas(String planoContas) { this.planoContas = planoContas; }
    public String getDataInicioOperacao() { return dataInicioOperacao; }
    public void setDataInicioOperacao(String dataInicioOperacao) { this.dataInicioOperacao = dataInicioOperacao; }
    public String getCentroCustoPadrao() { return centroCustoPadrao; }
    public void setCentroCustoPadrao(String centroCustoPadrao) { this.centroCustoPadrao = centroCustoPadrao; }
    public String getExercicioFiscal() { return exercicioFiscal; }
    public void setExercicioFiscal(String exercicioFiscal) { this.exercicioFiscal = exercicioFiscal; }
    public String getEmpresasVinculadas() { return empresasVinculadas; }
    public void setEmpresasVinculadas(String empresasVinculadas) { this.empresasVinculadas = empresasVinculadas; }
}
