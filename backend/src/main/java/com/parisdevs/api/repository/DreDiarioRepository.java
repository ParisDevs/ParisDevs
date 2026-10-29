package com.parisdevs.api.repository;

import com.parisdevs.api.entity.DreDiario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DreDiarioRepository extends JpaRepository<DreDiario, Integer> {

    Optional<DreDiario> findByDataReferenciaAndFilial_IdFilial(LocalDate dataReferencia, Integer idFilial);

    List<DreDiario> findByDataReferenciaOrderByFilial_IdFilialAsc(LocalDate dataReferencia);

    List<DreDiario> findByDataReferenciaAndFilial_IdFilialOrderByFilial_IdFilialAsc(LocalDate dataReferencia, Integer idFilial);

    List<DreDiario> findAllByOrderByDataReferenciaDesc();

    List<DreDiario> findByFilial_IdFilialOrderByDataReferenciaDesc(Integer idFilial);
}
