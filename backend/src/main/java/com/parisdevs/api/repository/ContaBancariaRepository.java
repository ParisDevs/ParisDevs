package com.parisdevs.api.repository;

import com.parisdevs.api.entity.ContaBancaria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContaBancariaRepository extends JpaRepository<ContaBancaria, Long> {

    List<ContaBancaria> findByFilial_IdFilial (Integer idFilial);

}
