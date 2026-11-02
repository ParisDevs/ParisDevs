package com.parisdevs.api.repository;

import com.parisdevs.api.entity.Operacao;
import com.parisdevs.api.enums.OrigemDados;
import com.parisdevs.api.enums.TipoOperacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OperacaoRepository extends JpaRepository<Operacao, Long> {

    @Query("select distinct o from Operacao o left join fetch o.contaBancaria")
    List<Operacao> findAllWithConta();

    @Query("select distinct o from Operacao o left join fetch o.contaBancaria cb left join fetch cb.filial")
    List<Operacao> findAllWithContaAndFilial();

    List<Operacao> findByContaBancaria_IdContaBancariaAndDtHoraAndTipoOperacaoAndRazaoSocial(
            Long idContaBancaria,
            LocalDateTime dtHora,
            TipoOperacao tipoOperacao,
            String razaoSocial);

    Optional<Operacao> findByOrigemAndIdExterno(OrigemDados origem, String idExterno);
}
