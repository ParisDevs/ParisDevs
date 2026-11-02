package com.parisdevs.api.service;

import com.parisdevs.api.domain.StatementIdItau;
import com.parisdevs.api.dto.ConexaoRequestDto;
import com.parisdevs.api.dto.ConexaoResponseDto;
import com.parisdevs.api.entity.ConexaoBancaria;
import com.parisdevs.api.entity.ContaBancaria;
import com.parisdevs.api.enums.AmbienteConexao;
import com.parisdevs.api.enums.ProvedorBancario;
import com.parisdevs.api.enums.StatusConexao;
import com.parisdevs.api.exception.ConexaoNaoEncontradaException;
import com.parisdevs.api.exception.ContaBancariaNaoEncontradaException;
import com.parisdevs.api.integration.XpDataAccessClient;
import com.parisdevs.api.repository.ConexaoBancariaRepository;
import com.parisdevs.api.repository.ContaBancariaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ConexaoService {

    private final ConexaoBancariaRepository conexaoRepository;
    private final ContaBancariaRepository contaRepository;
    private final ProvedorCredencialService credenciais;
    private final XpDataAccessClient xp;
    private final boolean itauProducao;
    private final boolean pluggyProducao;

    public ConexaoService(
            ConexaoBancariaRepository conexaoRepository,
            ContaBancariaRepository contaRepository,
            ProvedorCredencialService credenciais,
            XpDataAccessClient xp,
            @Value("${app.itau.producao-habilitada:false}") boolean itauProducao,
            @Value("${app.pluggy.producao-habilitada:false}") boolean pluggyProducao
    ) {
        this.conexaoRepository = conexaoRepository;
        this.contaRepository = contaRepository;
        this.credenciais = credenciais;
        this.xp = xp;
        this.itauProducao = itauProducao;
        this.pluggyProducao = pluggyProducao;
    }

    public List<ConexaoResponseDto> listar() {
        return conexaoRepository.findAllWithConta().stream().map(this::resposta).toList();
    }

    public ConexaoBancaria buscar(Long id) {
        return conexaoRepository.findById(id).orElseThrow(ConexaoNaoEncontradaException::new);
    }

    @Transactional
    public ConexaoResponseDto criar(ConexaoRequestDto dto) {
        if (dto == null || dto.idContaBancaria() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a conta bancária.");
        }
        ProvedorBancario provedor;
        try {
            provedor = ProvedorBancario.de(dto.provedor());
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provedor deve ser ITAU, XP ou PLUGGY.");
        }
        AmbienteConexao ambiente = ambiente(dto.ambiente(), provedor);
        if (conexaoRepository.findByContaBancaria_IdContaBancaria(dto.idContaBancaria()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta conta já tem uma origem ativa. Desconecte antes de trocar o provedor.");
        }
        ContaBancaria conta = contaRepository.findById(dto.idContaBancaria()).orElseThrow(ContaBancariaNaoEncontradaException::new);
        ConexaoBancaria conexao = new ConexaoBancaria();
        conexao.setContaBancaria(conta);
        conexao.setProvedor(provedor);
        conexao.setAmbiente(ambiente);
        conexao.setStatus(provedor == ProvedorBancario.XP ? StatusConexao.AGUARDANDO_AUTORIZACAO : StatusConexao.DESCONECTADA);
        aplicar(conexao, dto);
        if (provedor == ProvedorBancario.ITAU) {
            conexao.setStatementId(statement(conta, conexao.getDigitoVerificador()));
        }
        return resposta(conexaoRepository.save(conexao));
    }

    @Transactional
    public void remover(Long id) {
        ConexaoBancaria conexao = buscar(id);
        conexaoRepository.delete(conexao);
    }

    private void aplicar(ConexaoBancaria conexao, ConexaoRequestDto dto) {
        conexao.setDigitoVerificador(texto(dto.digitoVerificador()));
        conexao.setTipoContaItau(tipoItau(dto.tipoContaItau(), conexao.getContaBancaria()));
        conexao.setCname(texto(dto.cname()));
        conexao.setIps(texto(dto.ips()));
        conexao.setAvaliacaoSolicitada(Boolean.TRUE.equals(dto.avaliacaoSolicitada()));
    }

    private AmbienteConexao ambiente(String valor, ProvedorBancario provedor) {
        AmbienteConexao ambiente;
        try {
            ambiente = AmbienteConexao.de(valor);
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ambiente deve ser SANDBOX ou PRODUCAO.");
        }
        if (ambiente == AmbienteConexao.PRODUCAO) {
            boolean liberado = provedor == ProvedorBancario.ITAU ? itauProducao : pluggyProducao;
            if (provedor == ProvedorBancario.XP || !liberado) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Produção deste provedor está desligada. O padrão é sandbox.");
            }
        }
        return ambiente;
    }

    public String statement(ContaBancaria conta, String digito) {
        try {
            return StatementIdItau.montar(conta.getAgencia(), conta.getNumeroConta(), digito);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    public static String tipoItau(String informado, ContaBancaria conta) {
        if (informado != null && !informado.isBlank()) {
            String valor = informado.trim().toLowerCase();
            if (valor.contains("saving") || valor.contains("poup")) {
                return "savings_account";
            }
            return "current_account";
        }
        String tipo = conta.getTipoConta() == null ? "" : conta.getTipoConta().toLowerCase();
        return tipo.contains("poup") ? "savings_account" : "current_account";
    }

    public ConexaoResponseDto resposta(ConexaoBancaria conexao) {
        ContaBancaria conta = conexao.getContaBancaria();
        String filial = conta.getFilial() == null ? "" : conta.getFilial().getRazaoSocial();
        List<String> faltas = conexao.getProvedor() == ProvedorBancario.XP ? xp.pendencias(conexao) : List.of();
        return new ConexaoResponseDto(
                conexao.getIdConexao(),
                conta.getIdContaBancaria(),
                conta.getNomeInstituicao(),
                conta.getAgencia(),
                conta.getNumeroConta(),
                filial,
                conta.getSaldo(),
                conexao.getProvedor().name(),
                conexao.getAmbiente().name(),
                conexao.getStatus().name(),
                conexao.getUltimaSincronizacao(),
                conexao.getUltimoErro(),
                conexao.getAviso(),
                conexao.getStatementId(),
                conexao.getPluggyExecutionStatus(),
                credenciais.configurado(conexao.getProvedor()),
                faltas
        );
    }

    private static String texto(String valor) {
        return valor == null ? "" : valor.trim();
    }
}
