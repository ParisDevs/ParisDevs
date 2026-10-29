package com.parisdevs.api.dto;

import com.parisdevs.api.enums.TipoOperacao;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(name = "OperacaoResponse", description = "Operação retornada pela API")
public class OperacaoResponseDto {

    private Long idOperacao;
    private Double valorOperacao;
    private TipoOperacao tipoOperacao;
    private String razaoSocial;
    private String categoria;
    private LocalDateTime dtHora;
    private ContaBancariaResponseSimplesDto contaBancariaDto;

    public static class ContaBancariaResponseSimplesDto {
        private Long idContaBancaria;
        private String nomeInstituicao;
        private String nomeTitular;
        private String numeroConta;

        public ContaBancariaResponseSimplesDto() {
        }

        public ContaBancariaResponseSimplesDto(Long idContaBancaria, String nomeInstituicao, String nomeTitular, String numeroConta) {
            this.idContaBancaria = idContaBancaria;
            this.nomeInstituicao = nomeInstituicao;
            this.nomeTitular = nomeTitular;
            this.numeroConta = numeroConta;
        }

        public Long getIdContaBancaria() {
            return idContaBancaria;
        }

        public void setIdContaBancaria(Long idContaBancaria) {
            this.idContaBancaria = idContaBancaria;
        }

        public String getNomeInstituicao() {
            return nomeInstituicao;
        }

        public void setNomeInstituicao(String nomeInstituicao) {
            this.nomeInstituicao = nomeInstituicao;
        }

        public String getNomeTitular() {
            return nomeTitular;
        }

        public void setNomeTitular(String nomeTitular) {
            this.nomeTitular = nomeTitular;
        }

        public String getNumeroConta() {
            return numeroConta;
        }

        public void setNumeroConta(String numeroConta) {
            this.numeroConta = numeroConta;
        }
    }

    public Long getIdOperacao() {
        return idOperacao;
    }

    public void setIdOperacao(Long idOperacao) {
        this.idOperacao = idOperacao;
    }

    public Double getValorOperacao() {
        return valorOperacao;
    }

    public void setValorOperacao(Double valorOperacao) {
        this.valorOperacao = valorOperacao;
    }

    public TipoOperacao getTipoOperacao() {
        return tipoOperacao;
    }

    public void setTipoOperacao(TipoOperacao tipoOperacao) {
        this.tipoOperacao = tipoOperacao;
    }

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public LocalDateTime getDtHora() {
        return dtHora;
    }

    public void setDtHora(LocalDateTime dtHora) {
        this.dtHora = dtHora;
    }

    public ContaBancariaResponseSimplesDto getContaBancariaDto() {
        return contaBancariaDto;
    }

    public void setContaBancariaDto(ContaBancariaResponseSimplesDto contaBancariaDto) {
        this.contaBancariaDto = contaBancariaDto;
    }
}
