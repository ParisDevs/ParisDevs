package com.parisdevs.api.repository;

import com.parisdevs.api.entity.Conversa;
import com.parisdevs.api.entity.MembroConversa;
import com.parisdevs.api.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MembroConversaRepository extends JpaRepository<MembroConversa, Long> {

    Optional<MembroConversa> findByConversaAndUsuario(Conversa conversa, Usuario usuario);

    boolean existsByConversaAndUsuario(Conversa conversa, Usuario usuario);

    long countByConversa(Conversa conversa);

    @Query("select m from MembroConversa m join fetch m.conversa where m.usuario = :usuario")
    List<MembroConversa> findByUsuarioWithConversa(@Param("usuario") Usuario usuario);

    @Query("select m from MembroConversa m join fetch m.usuario left join fetch m.usuario.filial where m.conversa = :conversa")
    List<MembroConversa> findByConversaWithUsuario(@Param("conversa") Conversa conversa);
}
