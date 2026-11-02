package com.parisdevs.api.repository;

import com.parisdevs.api.entity.Conversa;
import com.parisdevs.api.entity.Mensagem;
import com.parisdevs.api.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MensagemRepository extends JpaRepository<Mensagem, Long> {

    List<Mensagem> findTop100ByConversaOrderByCriadoEmDesc(Conversa conversa);

    Optional<Mensagem> findTopByConversaOrderByCriadoEmDesc(Conversa conversa);

    Optional<Mensagem> findByIdAndConversa(Long id, Conversa conversa);

    long countByConversaAndAutorNot(Conversa conversa, Usuario autor);

    long countByConversaAndCriadoEmAfterAndAutorNot(Conversa conversa, LocalDateTime criadoEm, Usuario autor);
}
