package com.parisdevs.api.service;

import com.parisdevs.api.dto.ContaBancariaRequestDto;
import com.parisdevs.api.dto.ContaBancariaResponseDto;
import com.parisdevs.api.entity.ContaBancaria;
import com.parisdevs.api.entity.Filial;
import com.parisdevs.api.mapper.ContaBancariaMapper;
import com.parisdevs.api.repository.ContaBancariaRepository;
import com.parisdevs.api.repository.FilialRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ContaBancariaService {

    private final ContaBancariaRepository contaBancariaRepository;
    private final FilialRepository  filialRepository;

    public ContaBancariaService(ContaBancariaRepository contaBancariaRepository, FilialRepository filialRepository) {
        this.contaBancariaRepository = contaBancariaRepository;
        this.filialRepository = filialRepository;
    }

    public List<ContaBancaria> listarContas (){
        return contaBancariaRepository.findAll();
    }

    public List<ContaBancaria> listarContasPorFilial (Integer idFilial){
        return contaBancariaRepository.findByFilial_IdFilial(idFilial);
    }

    public ContaBancariaResponseDto cadastrar(ContaBancariaRequestDto contaBancariaRequestDto){

        Filial filial  = filialRepository.findById(contaBancariaRequestDto.getFkFilial())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Filial não encontrada"));

        ContaBancaria conta = ContaBancariaMapper.toEntity(contaBancariaRequestDto);
        conta.setFilial(filial);

        ContaBancaria contaSalva = contaBancariaRepository.save(conta);

        return ContaBancariaMapper.toResponseDto(contaSalva);
    }

    public ContaBancariaResponseDto atualizar(Long idContaBancaria, ContaBancariaRequestDto contaBancariaRequestDto){

        ContaBancaria conta = contaBancariaRepository.findById(idContaBancaria)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta bancária não encontrada."));

        Filial filial = filialRepository.findById(contaBancariaRequestDto.getFkFilial())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Filial não encontrada."));

        ContaBancariaMapper.updateEntity(conta, contaBancariaRequestDto, filial);

        ContaBancaria contaAtualizada = contaBancariaRepository.save(conta);

        return ContaBancariaMapper.toResponseDto(contaAtualizada);
    }

    public void deletar(Long idContaBancaria){

        ContaBancaria conta = contaBancariaRepository.findById(idContaBancaria)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta bancária não encontrada."));

        contaBancariaRepository.delete(conta);
    }
}
