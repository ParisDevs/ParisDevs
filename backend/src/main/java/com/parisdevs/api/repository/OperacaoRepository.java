package com.parisdevs.api.repository;

import com.parisdevs.api.entity.Operacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OperacaoRepository extends JpaRepository<Operacao, Long> {

    @Query("select distinct o from Operacao o left join fetch o.contaBancaria")
    List<Operacao> findAllWithConta();
}
