package com.parisdevs.api.repository;

import com.parisdevs.api.entity.ItemChecklist;
import com.parisdevs.api.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemChecklistRepository extends JpaRepository<ItemChecklist, Long> {

    List<ItemChecklist> findByUsuarioOrderByOrdemAscIdAsc(Usuario usuario);
}
