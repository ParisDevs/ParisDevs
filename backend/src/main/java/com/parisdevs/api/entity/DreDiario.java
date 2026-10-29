package com.parisdevs.api.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "dre_diario",
        uniqueConstraints = @UniqueConstraint(name = "uk_dre_diario_data_filial", columnNames = {"data_referencia", "filial_id"})
)
public class DreDiario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "data_referencia", nullable = false)
    private LocalDate dataReferencia;

    @ManyToOne(optional = false)
    @JoinColumn(name = "filial_id", nullable = false)
    private Filial filial;

    @Column(name = "receita_total", precision = 15, scale = 2)
    private BigDecimal receitaTotal;

    @Column(name = "receita_liquida", precision = 15, scale = 2)
    private BigDecimal receitaLiquida;

    @Column(name = "mercadorias", precision = 15, scale = 2)
    private BigDecimal mercadorias;

    @Column(name = "perc_mercadorias", precision = 12, scale = 6)
    private BigDecimal percMercadorias;

    @Column(name = "resultado", precision = 15, scale = 2)
    private BigDecimal resultado;

    @Column(name = "gerado_em")
    private LocalDateTime geradoEm;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public LocalDate getDataReferencia() {
        return dataReferencia;
    }

    public void setDataReferencia(LocalDate dataReferencia) {
        this.dataReferencia = dataReferencia;
    }

    public Filial getFilial() {
        return filial;
    }

    public void setFilial(Filial filial) {
        this.filial = filial;
    }

    public BigDecimal getReceitaTotal() {
        return receitaTotal;
    }

    public void setReceitaTotal(BigDecimal receitaTotal) {
        this.receitaTotal = receitaTotal;
    }

    public BigDecimal getReceitaLiquida() {
        return receitaLiquida;
    }

    public void setReceitaLiquida(BigDecimal receitaLiquida) {
        this.receitaLiquida = receitaLiquida;
    }

    public BigDecimal getMercadorias() {
        return mercadorias;
    }

    public void setMercadorias(BigDecimal mercadorias) {
        this.mercadorias = mercadorias;
    }

    public BigDecimal getPercMercadorias() {
        return percMercadorias;
    }

    public void setPercMercadorias(BigDecimal percMercadorias) {
        this.percMercadorias = percMercadorias;
    }

    public BigDecimal getResultado() {
        return resultado;
    }

    public void setResultado(BigDecimal resultado) {
        this.resultado = resultado;
    }

    public LocalDateTime getGeradoEm() {
        return geradoEm;
    }

    public void setGeradoEm(LocalDateTime geradoEm) {
        this.geradoEm = geradoEm;
    }
}
