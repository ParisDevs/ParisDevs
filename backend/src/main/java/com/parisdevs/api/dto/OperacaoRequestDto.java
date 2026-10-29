package com.parisdevs.api.dto;

import com.parisdevs.api.enums.TipoOperacao;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

@Schema(name = "OperacaoRequest", description = "Dados para criar ou atualizar uma operação")
public class OperacaoRequestDto {

    @Schema(description = "Valor positivo da operação", example = "1500.50")
    @NotNull(message = "Informe o valor da operação.")
    @Positive(message = "O valor deve ser maior que zero.")
    private Double valorOperacao;

    @Schema(description = "Tipo da operação", example = "PAGAMENTO")
    @NotNull(message = "Informe o tipo da operação.")
    private TipoOperacao tipoOperacao;

    @Schema(description = "Contraparte", example = "Fornecedor Alimentos SA")
    @NotBlank(message = "Informe a razão social.")
    private String razaoSocial;

    @Schema(description = "Nome da categoria", example = "Alimentos")
    @NotBlank(message = "Informe a categoria.")
    private String categoria;

    @Schema(description = "Data e hora do lançamento", example = "2026-10-15T14:30:00")
    @NotNull(message = "Informe a data e a hora.")
    private LocalDateTime dtHora;

    @Schema(description = "Identificador da conta bancária", example = "1")
    @NotNull(message = "Informe a conta bancária.")
    private Long idContaBancaria;

    public OperacaoRequestDto() {
    }

    public OperacaoRequestDto(Double valorOperacao, TipoOperacao tipoOperacao, String razaoSocial, String categoria, LocalDateTime dtHora, Long idContaBancaria) {
        this.valorOperacao = valorOperacao;
        this.tipoOperacao = tipoOperacao;
        this.razaoSocial = razaoSocial;
        this.categoria = categoria;
        this.dtHora = dtHora;
        this.idContaBancaria = idContaBancaria;
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

    public Long getIdContaBancaria() {
        return idContaBancaria;
    }

    public void setIdContaBancaria(Long idContaBancaria) {
        this.idContaBancaria = idContaBancaria;
    }
}
