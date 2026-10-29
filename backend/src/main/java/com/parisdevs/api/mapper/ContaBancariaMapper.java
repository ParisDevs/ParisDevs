package com.parisdevs.api.mapper;

import com.parisdevs.api.dto.ContaBancariaRequestDto;
import com.parisdevs.api.dto.ContaBancariaResponseDto;
import com.parisdevs.api.dto.FilialResponseSimplesDto;
import com.parisdevs.api.entity.ContaBancaria;
import com.parisdevs.api.entity.Filial;

import java.util.ArrayList;
import java.util.List;

public class ContaBancariaMapper {

    public static ContaBancaria toEntity(ContaBancariaRequestDto dto) {
        if (dto == null) return null;

        ContaBancaria conta = new ContaBancaria();

        conta.setCodigoBanco(dto.getCodigoBanco());
        conta.setNomeInstituicao(dto.getNomeInstituicao());
        conta.setNumeroConta(dto.getNumeroConta());
        conta.setAgencia(dto.getAgencia());
        conta.setAgenciaDigito(dto.getAgenciaDigito());
        conta.setTipoConta(dto.getTipoConta());
        conta.setNomeTitular(dto.getNomeTitular());
        conta.setCpfCnpjTitular(dto.getCpfCnpjTitular());
        conta.setAtivo(dto.getAtivo());

        return conta;
    }

    public static ContaBancariaResponseDto toResponseDto(ContaBancaria conta) {
        if (conta == null) return null;

        ContaBancariaResponseDto dto = new ContaBancariaResponseDto();

        dto.setIdContaBancaria(conta.getIdContaBancaria());
        dto.setCodigoBanco(conta.getCodigoBanco());
        dto.setNomeInstituicao(conta.getNomeInstituicao());
        dto.setAgencia(conta.getAgencia());
        dto.setAgenciaDigito(conta.getAgenciaDigito());
        dto.setNumeroConta(conta.getNumeroConta());
        dto.setTipoConta(conta.getTipoConta());
        dto.setCpfCnpjTitular(conta.getCpfCnpjTitular());
        dto.setNomeTitular(conta.getNomeTitular());
        dto.setAtivo(conta.getAtivo());
        dto.setSaldo(conta.getSaldo());

        if (conta.getFilial() != null) {
            FilialResponseSimplesDto filialDto = new FilialResponseSimplesDto();
            filialDto.setIdFilial(conta.getFilial().getIdFilial());
            filialDto.setRazaoSocial(conta.getFilial().getRazaoSocial());
            dto.setFilial(filialDto);
        }

        return dto;
    }

    public static List<ContaBancariaResponseDto> toResponseDto(
            List<ContaBancaria> contas) {

        if (contas == null) return null;

        List<ContaBancariaResponseDto> respostas = new ArrayList<>();

        for (ContaBancaria conta : contas) {
            respostas.add(toResponseDto(conta));
        }

        return respostas;
    }

    public static void updateEntity(
            ContaBancaria conta,
            ContaBancariaRequestDto dto,
            Filial filial) {

        conta.setFilial(filial);
        conta.setCodigoBanco(dto.getCodigoBanco());
        conta.setNomeInstituicao(dto.getNomeInstituicao());
        conta.setAgencia(dto.getAgencia());
        conta.setAgenciaDigito(dto.getAgenciaDigito());
        conta.setNumeroConta(dto.getNumeroConta());
        conta.setTipoConta(dto.getTipoConta());
        conta.setCpfCnpjTitular(dto.getCpfCnpjTitular());
        conta.setNomeTitular(dto.getNomeTitular());
        conta.setAtivo(dto.getAtivo());
    }
}