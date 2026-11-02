package com.parisdevs.api.repository;

import com.parisdevs.api.entity.EventoPessoal;
import com.parisdevs.api.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EventoPessoalRepository extends JpaRepository<EventoPessoal, Long> {

    List<EventoPessoal> findByUsuarioAndDataBetweenOrderByDataAscHoraInicioAsc(Usuario usuario, LocalDate inicio, LocalDate fim);
}
