package com.parisdevs.api.repository;

import com.parisdevs.api.entity.Conversa;
import com.parisdevs.api.enums.TipoConversa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConversaRepository extends JpaRepository<Conversa, Long> {

    Optional<Conversa> findFirstByTipo(TipoConversa tipo);

    Optional<Conversa> findByChaveDireta(String chaveDireta);
}
