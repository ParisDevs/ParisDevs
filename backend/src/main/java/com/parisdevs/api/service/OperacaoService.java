package com.parisdevs.api.service;

import com.parisdevs.api.dto.OperacaoRequestDto;
import com.parisdevs.api.entity.ContaBancaria;
import com.parisdevs.api.entity.Operacao;
import com.parisdevs.api.exception.ContaBancariaNaoEncontradaException;
import com.parisdevs.api.exception.OperacaoNaoEncontradaException;
import com.parisdevs.api.mapper.OperacaoMapper;
import com.parisdevs.api.repository.ContaBancariaRepository;
import com.parisdevs.api.repository.OperacaoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OperacaoService {

    private final OperacaoRepository operacaoRepository;
    private final ContaBancariaRepository contaBancariaRepository;

    public OperacaoService(OperacaoRepository operacaoRepository, ContaBancariaRepository contaBancariaRepository) {
        this.operacaoRepository = operacaoRepository;
        this.contaBancariaRepository = contaBancariaRepository;
    }

    public List<Operacao> listarOperacoes() {
        return operacaoRepository.findAllWithConta();
    }

    public Operacao buscarPorId(Long id) {
        return operacaoRepository.findById(id).orElseThrow(OperacaoNaoEncontradaException::new);
    }

    public Operacao cadastrar(OperacaoRequestDto dto) {
        Operacao operacao = OperacaoMapper.toEntity(dto);
        operacao.setContaBancaria(buscarConta(dto.getIdContaBancaria()));
        return operacaoRepository.save(operacao);
    }

    public Operacao atualizar(Long id, OperacaoRequestDto dto) {
        if (!operacaoRepository.existsById(id)) {
            throw new OperacaoNaoEncontradaException();
        }
        Operacao operacao = OperacaoMapper.toEntity(dto);
        operacao.setIdOperacao(id);
        operacao.setContaBancaria(buscarConta(dto.getIdContaBancaria()));
        return operacaoRepository.save(operacao);
    }

    public void deletarOperacao(Long id) {
        if (!operacaoRepository.existsById(id)) {
            throw new OperacaoNaoEncontradaException();
        }
        operacaoRepository.deleteById(id);
    }

    private ContaBancaria buscarConta(Long idContaBancaria) {
        if (idContaBancaria == null) {
            throw new ContaBancariaNaoEncontradaException();
        }
        return contaBancariaRepository.findById(idContaBancaria)
                .orElseThrow(ContaBancariaNaoEncontradaException::new);
    }
}
