package com.parisdevs.api.repository;

import com.parisdevs.api.entity.ContaBancaria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface ContaBancariaRepository extends JpaRepository<ContaBancaria, Long> {

    List<ContaBancaria> findByFilial_IdFilial (Integer idFilial);

    @Query("SELECT COALESCE(SUM(c.saldo), 0) FROM ContaBancaria c")
    BigDecimal somarSaldos();
}
