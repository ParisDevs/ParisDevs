package com.parisdevs.api.service;

import com.parisdevs.api.domain.InvarianteSincronizacao;
import com.parisdevs.api.domain.SaldoMovimento;
import com.parisdevs.api.dto.OperacaoRequestDto;
import com.parisdevs.api.entity.ContaBancaria;
import com.parisdevs.api.entity.Operacao;
import com.parisdevs.api.enums.OrigemDados;
import com.parisdevs.api.enums.TipoOperacao;
import com.parisdevs.api.exception.ContaBancariaNaoEncontradaException;
import com.parisdevs.api.exception.OperacaoDuplicadaException;
import com.parisdevs.api.exception.OperacaoProtegidaException;
import com.parisdevs.api.exception.OperacaoNaoEncontradaException;
import com.parisdevs.api.mapper.OperacaoMapper;
import com.parisdevs.api.repository.ContaBancariaRepository;
import com.parisdevs.api.repository.OperacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    @Transactional
    public Operacao cadastrar(OperacaoRequestDto dto) {
        ContaBancaria conta = buscarConta(dto.getIdContaBancaria());
        String razao = texto(dto.getRazaoSocial());
        garantirUnica(conta.getIdContaBancaria(), dto.getDtHora(), dto.getTipoOperacao(), razao, dto.getValorOperacao(), null);
        Operacao operacao = OperacaoMapper.toEntity(dto);
        operacao.setRazaoSocial(razao);
        operacao.setCategoria(texto(dto.getCategoria()));
        operacao.setContaBancaria(conta);
        operacao.setOrigem(OrigemDados.MANUAL);
        conta.setSaldo(SaldoMovimento.aplicar(conta.getSaldo(), dto.getTipoOperacao(), dto.getValorOperacao(), false));
        return operacaoRepository.save(operacao);
    }

    @Transactional
    public Operacao atualizar(Long id, OperacaoRequestDto dto) {
        Operacao operacao = operacaoRepository.findById(id).orElseThrow(OperacaoNaoEncontradaException::new);
        if (InvarianteSincronizacao.protegida(operacao.getOrigem())) {
            throw new OperacaoProtegidaException();
        }
        TipoOperacao tipoAnterior = operacao.getTipoOperacao();
        Double valorAnterior = operacao.getValorOperacao();
        ContaBancaria contaAnterior = operacao.getContaBancaria();

        ContaBancaria conta = buscarConta(dto.getIdContaBancaria());
        String razao = texto(dto.getRazaoSocial());
        garantirUnica(conta.getIdContaBancaria(), dto.getDtHora(), dto.getTipoOperacao(), razao, dto.getValorOperacao(), id);

        if (contaAnterior != null) {
            contaAnterior.setSaldo(SaldoMovimento.aplicar(contaAnterior.getSaldo(), tipoAnterior, valorAnterior, true));
        }
        operacao.setValorOperacao(dto.getValorOperacao());
        operacao.setTipoOperacao(dto.getTipoOperacao());
        operacao.setRazaoSocial(razao);
        operacao.setCategoria(texto(dto.getCategoria()));
        operacao.setDtHora(dto.getDtHora());
        operacao.setContaBancaria(conta);
        conta.setSaldo(SaldoMovimento.aplicar(conta.getSaldo(), dto.getTipoOperacao(), dto.getValorOperacao(), false));
        return operacaoRepository.save(operacao);
    }

    @Transactional
    public void deletarOperacao(Long id) {
        Operacao operacao = operacaoRepository.findById(id).orElseThrow(OperacaoNaoEncontradaException::new);
        if (InvarianteSincronizacao.protegida(operacao.getOrigem())) {
            throw new OperacaoProtegidaException();
        }
        ContaBancaria conta = operacao.getContaBancaria();
        if (conta != null) {
            conta.setSaldo(SaldoMovimento.aplicar(conta.getSaldo(), operacao.getTipoOperacao(), operacao.getValorOperacao(), true));
        }
        operacaoRepository.delete(operacao);
    }

    private ContaBancaria buscarConta(Long idContaBancaria) {
        if (idContaBancaria == null) {
            throw new ContaBancariaNaoEncontradaException();
        }
        return contaBancariaRepository.findById(idContaBancaria)
                .orElseThrow(ContaBancariaNaoEncontradaException::new);
    }

    private void garantirUnica(Long idConta, LocalDateTime dtHora, TipoOperacao tipo, String razao, Double valor, Long ignorarId) {
        boolean duplicada = operacaoRepository
                .findByContaBancaria_IdContaBancariaAndDtHoraAndTipoOperacaoAndRazaoSocial(idConta, dtHora, tipo, razao)
                .stream()
                .anyMatch((operacao) -> (ignorarId == null || !ignorarId.equals(operacao.getIdOperacao()))
                        && SaldoMovimento.mesmoValor(operacao.getValorOperacao(), valor));
        if (duplicada) {
            throw new OperacaoDuplicadaException();
        }
    }

    private static String texto(String valor) {
        return valor == null ? "" : valor.trim();
    }
}
