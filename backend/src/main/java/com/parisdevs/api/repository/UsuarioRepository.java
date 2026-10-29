package com.parisdevs.api.repository;

import com.parisdevs.api.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Integer id);

    Usuario findByEmail(String email);

    @Query("select distinct u from Usuario u left join fetch u.filial")
    List<Usuario> findAllWithFilial();
}
