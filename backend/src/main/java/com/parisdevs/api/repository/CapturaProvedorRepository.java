package com.parisdevs.api.repository;

import com.parisdevs.api.entity.CapturaProvedor;
import com.parisdevs.api.enums.TipoCaptura;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CapturaProvedorRepository extends JpaRepository<CapturaProvedor, Long> {

    void deleteByConexao_IdConexaoAndTipo(Long idConexao, TipoCaptura tipo);
}
