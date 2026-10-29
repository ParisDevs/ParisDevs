package com.parisdevs.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(name = "DreGerarRequest", description = "Pedido para gravar snapshot da DRE")
public class DreGerarRequestDto {

    @Schema(description = "Data de referência (D-1). Omitir para usar ontem.", example = "2026-10-28")
    private LocalDate data;

    @Schema(description = "Filial. Omitir para gravar todas.", example = "1")
    private Integer idFilial;

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public Integer getIdFilial() {
        return idFilial;
    }

    public void setIdFilial(Integer idFilial) {
        this.idFilial = idFilial;
    }
}
