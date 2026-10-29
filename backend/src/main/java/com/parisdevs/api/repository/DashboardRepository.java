package com.parisdevs.api.repository;

import com.parisdevs.api.entity.ContaBancaria;
import com.parisdevs.api.enums.TipoOperacao;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface DashboardRepository extends Repository<ContaBancaria, Long> {

    @Query("""
            SELECT COALESCE(SUM(cb.saldo), 0)
            FROM ContaBancaria cb
            WHERE cb.ativo = true
              AND cb.saldo IS NOT NULL
              AND (:idFilial IS NULL OR cb.filial.idFilial = :idFilial)
            """)
    BigDecimal saldoConsolidado(@Param("idFilial") Integer idFilial);

    @Query("""
            SELECT COALESCE(SUM(o.valorOperacao), 0)
            FROM Operacao o
            WHERE o.dtHora >= :inicio
              AND o.dtHora < :fim
              AND o.tipoOperacao = :tipo
              AND (:idFilial IS NULL OR o.contaBancaria.filial.idFilial = :idFilial)
            """)
    Double somaOperacoes(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("tipo") TipoOperacao tipo,
            @Param("idFilial") Integer idFilial
    );
}
