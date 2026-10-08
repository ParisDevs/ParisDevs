package com.parisdevs.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.parisdevs.api.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Integer id);

}
