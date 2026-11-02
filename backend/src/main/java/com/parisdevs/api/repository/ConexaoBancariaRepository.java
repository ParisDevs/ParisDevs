package com.parisdevs.api.repository;

import com.parisdevs.api.entity.ConexaoBancaria;
import com.parisdevs.api.enums.StatusConexao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ConexaoBancariaRepository extends JpaRepository<ConexaoBancaria, Long> {

    @Query("select c from ConexaoBancaria c join fetch c.contaBancaria conta left join fetch conta.filial")
    List<ConexaoBancaria> findAllWithConta();

    Optional<ConexaoBancaria> findByContaBancaria_IdContaBancaria(Long idContaBancaria);

    List<ConexaoBancaria> findByStatusNot(StatusConexao status);
}
