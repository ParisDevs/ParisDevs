package com.parisdevs.api.mapper;

import com.parisdevs.api.dto.FilialRequestDto;
import com.parisdevs.api.dto.FilialResponseDto;
import com.parisdevs.api.dto.FilialResponseSimplesDto;
import com.parisdevs.api.entity.Filial;

import java.util.ArrayList;
import java.util.List;

public class FilialMapper {

    public static Filial toEntity(FilialRequestDto dto) {
        if (dto == null) {
            return null;
        }
        Filial filial = new Filial();
        copy(dto, filial);
        return filial;
    }

    public static void copy(FilialRequestDto dto, Filial filial) {
        filial.setRazaoSocial(dto.getRazaoSocial());
        filial.setNomeFantasia(dto.getNomeFantasia());
        filial.setCnpj(dto.getCnpj());
        filial.setInscricaoEstadual(dto.getInscricaoEstadual());
        filial.setInscricaoMunicipal(dto.getInscricaoMunicipal());
        filial.setRegimeTributario(dto.getRegimeTributario());
        filial.setCnaePrincipal(dto.getCnaePrincipal());
        filial.setDataAbertura(dto.getDataAbertura());
        filial.setSituacaoCadastral(dto.getSituacaoCadastral());
        filial.setEndereco(dto.getEndereco());
        filial.setToken(dto.getToken());
        filial.setCep(dto.getCep());
        filial.setLogradouro(dto.getLogradouro());
        filial.setNumero(dto.getNumero());
        filial.setComplemento(dto.getComplemento());
        filial.setBairro(dto.getBairro());
        filial.setCidade(dto.getCidade());
        filial.setUf(dto.getUf());
        filial.setPais(dto.getPais());
        filial.setResponsavelNome(dto.getResponsavelNome());
        filial.setResponsavelCpf(dto.getResponsavelCpf());
        filial.setResponsavelEmail(dto.getResponsavelEmail());
        filial.setResponsavelTelefone(dto.getResponsavelTelefone());
        filial.setResponsavelCargo(dto.getResponsavelCargo());
        filial.setMoedaPadrao(dto.getMoedaPadrao());
        filial.setFusoHorario(dto.getFusoHorario());
        filial.setPlanoContas(dto.getPlanoContas());
        filial.setDataInicioOperacao(dto.getDataInicioOperacao());
        filial.setCentroCustoPadrao(dto.getCentroCustoPadrao());
        filial.setExercicioFiscal(dto.getExercicioFiscal());
        filial.setEmpresasVinculadas(dto.getEmpresasVinculadas());
    }

    public static FilialResponseDto toResponseDto(Filial filial) {
        if (filial == null) {
            return null;
        }

        FilialResponseDto dto = new FilialResponseDto();
        dto.setIdFilial(filial.getIdFilial());
        dto.setRazaoSocial(filial.getRazaoSocial());
        dto.setNomeFantasia(filial.getNomeFantasia());
        dto.setCnpj(filial.getCnpj());
        dto.setInscricaoEstadual(filial.getInscricaoEstadual());
        dto.setInscricaoMunicipal(filial.getInscricaoMunicipal());
        dto.setRegimeTributario(filial.getRegimeTributario());
        dto.setCnaePrincipal(filial.getCnaePrincipal());
        dto.setDataAbertura(filial.getDataAbertura());
        dto.setSituacaoCadastral(filial.getSituacaoCadastral());
        dto.setEndereco(filial.getEndereco());
        dto.setToken(filial.getToken());
        dto.setCep(filial.getCep());
        dto.setLogradouro(filial.getLogradouro());
        dto.setNumero(filial.getNumero());
        dto.setComplemento(filial.getComplemento());
        dto.setBairro(filial.getBairro());
        dto.setCidade(filial.getCidade());
        dto.setUf(filial.getUf());
        dto.setPais(filial.getPais());
        dto.setResponsavelNome(filial.getResponsavelNome());
        dto.setResponsavelCpf(filial.getResponsavelCpf());
        dto.setResponsavelEmail(filial.getResponsavelEmail());
        dto.setResponsavelTelefone(filial.getResponsavelTelefone());
        dto.setResponsavelCargo(filial.getResponsavelCargo());
        dto.setMoedaPadrao(filial.getMoedaPadrao());
        dto.setFusoHorario(filial.getFusoHorario());
        dto.setPlanoContas(filial.getPlanoContas());
        dto.setDataInicioOperacao(filial.getDataInicioOperacao());
        dto.setCentroCustoPadrao(filial.getCentroCustoPadrao());
        dto.setExercicioFiscal(filial.getExercicioFiscal());
        dto.setEmpresasVinculadas(filial.getEmpresasVinculadas());
        return dto;
    }

    public static List<FilialResponseDto> toResponseDto(List<Filial> filiais) {
        List<FilialResponseDto> filialResponseDtos = new ArrayList<>();
        if (filiais == null) return filialResponseDtos;

        for (Filial filial : filiais) {
            filialResponseDtos.add(toResponseDto(filial));
        }
        return filialResponseDtos;
    }

    public static FilialResponseSimplesDto toResponseSimplesDto(Filial filial) {
        if (filial == null) {
            return null;
        }

        FilialResponseSimplesDto filialResponseSimplesDto = new FilialResponseSimplesDto();
        filialResponseSimplesDto.setIdFilial(filial.getIdFilial());
        filialResponseSimplesDto.setRazaoSocial(filial.getRazaoSocial());
        return filialResponseSimplesDto;
    }
}
