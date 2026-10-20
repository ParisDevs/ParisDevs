package com.parisdevs.api.repository;

import com.parisdevs.api.entity.Filial;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FilialRepository extends JpaRepository<Filial, Integer> {

    boolean existsByCnpj(String cnpj);

    boolean existsByToken(String token);

    boolean existsByCnpjAndIdFilialNot(String cnpj, Integer id);

    boolean existsByTokenAndIdFilialNot(String token, Integer id);
}
