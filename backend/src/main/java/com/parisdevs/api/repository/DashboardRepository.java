
package com.parisdevs.api.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface DashboardRepository
        extends Repository<com.parisdevs.api.entity.ContaBancaria, Long> {

    interface DashboardKpiProjection {
        BigDecimal getSaldoConsolidado();
        BigDecimal getEntradas();
        BigDecimal getSaidas();
        BigDecimal getResultado();
    }

    @Query(value = """
        SELECT
            (SELECT COALESCE(SUM(cb.saldo), 0)
             FROM contabancaria cb
             WHERE (:idFilial IS NULL OR cb.filial_id = :idFilial)
            ) AS "saldoConsolidado",

            (SELECT COALESCE(SUM(r.valor), 0)
             FROM receita r
             JOIN contabancaria cb ON cb.id = r.conta_bancaria_id
             WHERE r.data_receita >= :inicio
               AND r.data_receita < :fim
               AND (:idFilial IS NULL OR cb.filial_id = :idFilial)
            ) AS "entradas",

            (SELECT COALESCE(SUM(d.valor), 0)
             FROM despesa d
             WHERE d.data_despesa >= :inicio
               AND d.data_despesa < :fim
               AND (:idFilial IS NULL OR d.filial_id = :idFilial)
            ) AS "saidas",

            (
                (SELECT COALESCE(SUM(r.valor), 0)
                 FROM receita r
                 JOIN contabancaria cb ON cb.id = r.conta_bancaria_id
                 WHERE r.data_receita >= :inicio
                   AND r.data_receita < :fim
                   AND (:idFilial IS NULL OR cb.filial_id = :idFilial)
                )
                -
                (SELECT COALESCE(SUM(d.valor), 0)
                 FROM despesa d
                 WHERE d.data_despesa >= :inicio
                   AND d.data_despesa < :fim
                   AND (:idFilial IS NULL OR d.filial_id = :idFilial)
                )
            ) AS "resultado"
        """, nativeQuery = true)
    DashboardKpiProjection buscarKpis(
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim,
            @Param("idFilial") Integer idFilial
    );
}

