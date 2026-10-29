package com.parisdevs.api.service;

import com.parisdevs.api.entity.Filial;
import com.parisdevs.api.exception.CnpjInvalidoException;
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
        normalizar(novaFilial);
        if (cnpjEmUso(novaFilial.getCnpj(), null)) {
            throw new CnpjJaCadastradoException();
        }
        if (tokenEmUso(novaFilial.getToken(), null)) {
            throw new TokenJaCadastradoException();
        }
        return filialRepository.save(novaFilial);
    }

    public Filial atualizar(Integer id, Filial filial) {
        filialExiste(id);
        normalizar(filial);
        if (cnpjEmUso(filial.getCnpj(), id)) {
            throw new CnpjJaCadastradoException();
        }
        if (tokenEmUso(filial.getToken(), id)) {
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

    private void normalizar(Filial filial) {
        filial.setRazaoSocial(trimToNull(filial.getRazaoSocial()));
        filial.setEndereco(trimToNull(filial.getEndereco()));
        filial.setToken(trimToNull(filial.getToken()));
        filial.setCnpj(somenteDigitosCnpj(filial.getCnpj()));
    }

    private String somenteDigitosCnpj(String cnpj) {
        String digits = cnpj == null ? "" : cnpj.replaceAll("\\D", "");
        if (digits.length() != 14) {
            throw new CnpjInvalidoException();
        }
        return digits;
    }

    private boolean cnpjEmUso(String cnpj, Integer exceptId) {
        return filialRepository.findAll().stream()
                .filter((filial) -> exceptId == null || !exceptId.equals(filial.getIdFilial()))
                .anyMatch((filial) -> somenteDigitos(filial.getCnpj()).equals(cnpj));
    }

    private boolean tokenEmUso(String token, Integer exceptId) {
        if (token == null || token.isBlank()) {
            return false;
        }
        return filialRepository.findAll().stream()
                .filter((filial) -> exceptId == null || !exceptId.equals(filial.getIdFilial()))
                .anyMatch((filial) -> token.equals(trimToNull(filial.getToken())));
    }

    private static String somenteDigitos(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
