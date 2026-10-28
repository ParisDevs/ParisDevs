package com.parisdevs.api.service;

import com.parisdevs.api.entity.Operacao;
import com.parisdevs.api.exception.ContaBancariaNaoEncontradaException;
import com.parisdevs.api.exception.OperacaoNaoEncontradaException;
import com.parisdevs.api.repository.ContaBancariaRepository;
import com.parisdevs.api.repository.OperacaoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class OperacaoService {

    private final OperacaoRepository operacaoRepository;
    private final ContaBancariaRepository contaBancariaRepository;

    public OperacaoService(OperacaoRepository operacaoRepository, ContaBancariaRepository contaBancariaRepository) {
        this.operacaoRepository = operacaoRepository;
        this.contaBancariaRepository = contaBancariaRepository;
    }

    public List<Operacao> listarOperacoes() {
        return operacaoRepository.findAll();
    }

    public Operacao buscarPorId(Long id) {
        Optional<Operacao> operacaoOptional = operacaoRepository.findById(id);

        if (operacaoOptional.isEmpty()) {
            throw new OperacaoNaoEncontradaException();
        }
        return operacaoOptional.get();
    }

    public Operacao cadastrar(Operacao operacao) {

        Boolean existeContaBancaria = contaBancariaRepository.existsById(operacao.getContaBancaria().getIdContaBancaria());
        if (!existeContaBancaria) {
            throw new ContaBancariaNaoEncontradaException();
        }

        return operacaoRepository.save(operacao);
    }

    public Operacao atualizar(Long id, Operacao operacao) {
        Boolean existeOperacao = operacaoRepository.existsById(id);
        if (!existeOperacao) {
            throw new OperacaoNaoEncontradaException();
        }

        operacao.setIdOperacao(id);
        return operacaoRepository.save(operacao);
    }

    public void deletarOperacao(Long id) {
        Boolean existeOperacao = operacaoRepository.existsById(id);
        if (!existeOperacao) {
            throw new OperacaoNaoEncontradaException();
        }
        operacaoRepository.deleteById(id);
    }
}
