package com.parisdevs.api.service;

import com.parisdevs.api.dto.ImportacaoExtratoResponse;
import com.parisdevs.api.parser.OfxParser;
import com.webcohesion.ofx4j.io.OFXParseException;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class ImportacaoExtratoService {

    private final OfxParser ofxParser;

    public ImportacaoExtratoService(OfxParser ofxParser) {
        this.ofxParser = ofxParser;
    }

    public ImportacaoExtratoResponse importar(MultipartFile arquivo)
            throws IOException, OFXParseException {

        return ofxParser.parse(arquivo.getInputStream());
    }
}