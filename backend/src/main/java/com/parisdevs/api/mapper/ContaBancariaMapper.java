package com.parisdevs.api.mapper;

import com.parisdevs.api.dto.ContaBancariaRequestDto;
import com.parisdevs.api.dto.ContaBancariaResponseDto;
import com.parisdevs.api.dto.FilialResponseSimplesDto;
import com.parisdevs.api.entity.ContaBancaria;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.ArrayList;
import java.util.List;

public class ContaBancariaMapper {


    public static ContaBancaria toEntity(ContaBancariaRequestDto contaBancariaRequestDto) {
        if (contaBancariaRequestDto == null) return  null;


        ContaBancaria contaBancaria = new ContaBancaria();
        contaBancaria.setCodigoBanco(contaBancariaRequestDto.getCodigoBanco());
        contaBancaria.setNomeInstituicao(contaBancariaRequestDto.getNomeInstituicao());
        contaBancaria.setNumeroConta(contaBancariaRequestDto.getNumeroConta());
        contaBancaria.setAgencia(contaBancariaRequestDto.getAgencia());
        contaBancaria.setAgenciaDigito(contaBancariaRequestDto.getAgenciaDigito());
        contaBancaria.setTipoConta(contaBancariaRequestDto.getTipoConta());
        contaBancaria.setNomeTitular(contaBancariaRequestDto.getNomeTitular());
        contaBancaria.setCpfCnpjTitular(contaBancariaRequestDto.getCpfCnpjTitular());
        contaBancaria.setAtivo(contaBancariaRequestDto.getAtivo());

        return  contaBancaria;

    }

    public static ContaBancariaResponseDto toResponseDto(ContaBancaria contaBancaria) {
        if  (contaBancaria == null) return null;

        ContaBancariaResponseDto contaBancariaResponse = new ContaBancariaResponseDto();

        contaBancariaResponse.setIdContaBancaria(contaBancaria.getIdContaBancaria());
        contaBancariaResponse.setCodigoBanco(contaBancaria.getCodigoBanco());
        contaBancariaResponse.setNomeInstituicao(contaBancaria.getNomeInstituicao());
        contaBancariaResponse.setAgencia(contaBancaria.getAgencia());
        contaBancariaResponse.setAgenciaDigito(contaBancaria.getAgenciaDigito());
        contaBancariaResponse.setNumeroConta(contaBancaria.getNumeroConta());
        contaBancariaResponse.setTipoConta(contaBancaria.getTipoConta());
        contaBancariaResponse.setCpfCnpjTitular(contaBancaria.getCpfCnpjTitular());
        contaBancariaResponse.setNomeTitular(contaBancaria.getNomeTitular());
        contaBancariaResponse.setAtivo(contaBancaria.getAtivo());

        FilialResponseSimplesDto filialResponse = new FilialResponseSimplesDto();
        filialResponse.setIdFilial(contaBancaria.getFilial().getIdFilial());
        filialResponse.setRazaoSocial(contaBancaria.getFilial().getRazaoSocial());

        contaBancariaResponse.setFilial(filialResponse);

        return contaBancariaResponse;
    }

    public static List<ContaBancariaResponseDto> toResponseDto(List<ContaBancaria> contasBancarias) {
        if  (contasBancarias == null) return null;

        List<ContaBancariaResponseDto> contasBancariasResponse = new ArrayList<>();
        for (ContaBancaria contaBancaria : contasBancarias) {
            ContaBancariaResponseDto contaBancariaResponse = new ContaBancariaResponseDto();
            contaBancariaResponse.setIdContaBancaria(contaBancaria.getIdContaBancaria());
            contaBancariaResponse.setCodigoBanco(contaBancaria.getCodigoBanco());
            contaBancariaResponse.setNomeInstituicao(contaBancaria.getNomeInstituicao());
            contaBancariaResponse.setAgencia(contaBancaria.getAgencia());
            contaBancariaResponse.setAgenciaDigito(contaBancaria.getAgenciaDigito());
            contaBancariaResponse.setNumeroConta(contaBancaria.getNumeroConta());
            contaBancariaResponse.setTipoConta(contaBancaria.getTipoConta());
            contaBancariaResponse.setCpfCnpjTitular(contaBancaria.getCpfCnpjTitular());
            contaBancariaResponse.setNomeTitular(contaBancaria.getNomeTitular());
            contaBancariaResponse.setAtivo(contaBancaria.getAtivo());

            FilialResponseSimplesDto filialResponse = new FilialResponseSimplesDto();
            filialResponse.setIdFilial(contaBancaria.getFilial().getIdFilial());
            filialResponse.setRazaoSocial(contaBancaria.getFilial().getRazaoSocial());

            contaBancariaResponse.setFilial(filialResponse);
            contasBancariasResponse.add(contaBancariaResponse);
        }

        return contasBancariasResponse;
    }
}
