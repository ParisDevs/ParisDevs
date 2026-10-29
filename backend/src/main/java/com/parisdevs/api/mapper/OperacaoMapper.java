package com.parisdevs.api.mapper;

import com.parisdevs.api.dto.OperacaoRequestDto;
import com.parisdevs.api.dto.OperacaoResponseDto;
import com.parisdevs.api.entity.ContaBancaria;
import com.parisdevs.api.entity.Operacao;

import java.util.ArrayList;
import java.util.List;

public class OperacaoMapper {

    public static Operacao toEntity(OperacaoRequestDto operacaoRequestDto) {
        if (operacaoRequestDto == null) return null;

        Operacao operacaoEntity = new Operacao();
        operacaoEntity.setValorOperacao(operacaoRequestDto.getValorOperacao());
        operacaoEntity.setTipoOperacao(operacaoRequestDto.getTipoOperacao());
        operacaoEntity.setRazaoSocial(operacaoRequestDto.getRazaoSocial());
        operacaoEntity.setCategoria(operacaoRequestDto.getCategoria());
        operacaoEntity.setDtHora(operacaoRequestDto.getDtHora());

        return operacaoEntity;
    }

    public static OperacaoResponseDto toResponseDto(Operacao operacao) {
        if (operacao == null) return null;

        OperacaoResponseDto operacaoResponseDto = new OperacaoResponseDto();
        operacaoResponseDto.setIdOperacao(operacao.getIdOperacao());
        operacaoResponseDto.setValorOperacao(operacao.getValorOperacao());
        operacaoResponseDto.setTipoOperacao(operacao.getTipoOperacao());
        operacaoResponseDto.setCategoria(operacao.getCategoria());
        operacaoResponseDto.setDtHora(operacao.getDtHora());
        operacaoResponseDto.setRazaoSocial(operacao.getRazaoSocial());

        ContaBancaria conta = operacao.getContaBancaria();
        if (conta != null) {
            OperacaoResponseDto.ContaBancariaResponseSimplesDto contaBancariaResponse =
                    new OperacaoResponseDto.ContaBancariaResponseSimplesDto();
            contaBancariaResponse.setIdContaBancaria(conta.getIdContaBancaria());
            contaBancariaResponse.setNomeInstituicao(conta.getNomeInstituicao());
            contaBancariaResponse.setNomeTitular(conta.getNomeTitular());
            contaBancariaResponse.setNumeroConta(conta.getNumeroConta());
            operacaoResponseDto.setContaBancariaDto(contaBancariaResponse);
        }

        return operacaoResponseDto;
    }

    public static List<OperacaoResponseDto> toResponseDto(List<Operacao> operacoes) {
        if (operacoes == null) return null;

        List<OperacaoResponseDto> respostas = new ArrayList<>();
        for (Operacao operacao : operacoes) {
            respostas.add(toResponseDto(operacao));
        }
        return respostas;
    }
}
