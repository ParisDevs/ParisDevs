package com.parisdevs.api.mapper;

import com.parisdevs.api.dto.FilialRequestDto;
import com.parisdevs.api.dto.FilialResponseDto;
import com.parisdevs.api.entity.Filial;

import java.util.ArrayList;
import java.util.List;

public class FilialMapper {

    public static Filial toEntity(FilialRequestDto filialRequestDto) {
        if (filialRequestDto == null) {
            return null;
        }

        Filial filial = new Filial();
        filial.setRazaoSocial(filialRequestDto.getRazaoSocial());
        filial.setCnpj(filialRequestDto.getCnpj());
        filial.setEndereco(filialRequestDto.getEndereco());
        filial.setToken(filialRequestDto.getToken());

        return filial;
    }

    public static FilialResponseDto toResponseDto(Filial filial) {
        if (filial == null) {
            return null;
        }

        FilialResponseDto filialResponseDto = new FilialResponseDto();

        filialResponseDto.setIdFilial(filial.getIdFilial());
        filialResponseDto.setRazaoSocial(filial.getRazaoSocial());
        filialResponseDto.setCnpj(filial.getCnpj());
        filialResponseDto.setEndereco(filial.getEndereco());
        filialResponseDto.setToken(filial.getToken());

        return filialResponseDto;
    }

    public static List<FilialResponseDto> toResponseDto(List<Filial> filiais) {
        List<FilialResponseDto> filialResponseDtos = new ArrayList<>();
        if (filiais == null) return filialResponseDtos;

        for (Filial filial : filiais) {
            FilialResponseDto filialResponseDto = toResponseDto(filial);
            filialResponseDtos.add(filialResponseDto);
        }
        return filialResponseDtos;
    }
}