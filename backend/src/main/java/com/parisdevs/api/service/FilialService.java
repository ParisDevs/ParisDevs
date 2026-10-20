package com.parisdevs.api.service;

import com.parisdevs.api.entity.Filial;
import com.parisdevs.api.exception.CnpjJaCadastradoException;
import com.parisdevs.api.exception.FilialNaoEncontradaException;
import com.parisdevs.api.exception.TokenJaCadastradoException;
import com.parisdevs.api.repository.FilialRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FilialService {

    private final FilialRepository filialRepository;

    public FilialService(FilialRepository filialRepository) {
        this.filialRepository = filialRepository;
    }

    public List<Filial> listarFiliais() {
        return filialRepository.findAll();
    }

    public Filial buscarPorId(Integer id) {
        Optional<Filial> filialOptional = filialRepository.findById(id);

        if (filialOptional.isEmpty()) {
            throw new FilialNaoEncontradaException();
        }
        return filialOptional.get();
    }

    public Filial cadastrar(Filial novaFilial) {
        boolean existeCnpj = filialRepository.existsByCnpj(novaFilial.getCnpj());
        if (existeCnpj) {
            throw new CnpjJaCadastradoException();
        }

        boolean existeToken = filialRepository.existsByToken(novaFilial.getToken());
        if (existeToken) {
            throw new TokenJaCadastradoException();
        }

        return filialRepository.save(novaFilial);
    }

    public Filial atualizar(Integer id, Filial filial) {
        filialExiste(id);

        boolean existeCnpj = filialRepository.existsByCnpjAndIdFilialNot(filial.getCnpj(), id);
        if (existeCnpj) {
            throw new CnpjJaCadastradoException();
        }

        boolean existeToken = filialRepository.existsByTokenAndIdFilialNot(filial.getToken(), id);
        if (existeToken) {
            throw new TokenJaCadastradoException();
        }

        filial.setIdFilial(id);
        return filialRepository.save(filial);
    }

    public void deletarPorId(Integer id) {
        filialExiste(id);
        filialRepository.deleteById(id);
    }

    private void filialExiste(Integer id) {
        if (!filialRepository.existsById(id)) {
            throw new FilialNaoEncontradaException();
        }
    }
}
