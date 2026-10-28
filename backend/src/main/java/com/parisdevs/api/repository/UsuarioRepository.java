package com.parisdevs.api.repository;

import com.parisdevs.api.dto.UsuarioRequestDto;
import com.parisdevs.api.dto.UsuarioResponseDto;
import org.springframework.data.jpa.repository.JpaRepository;
import com.parisdevs.api.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Integer id);
    Usuario findByEmail(String email);
}
