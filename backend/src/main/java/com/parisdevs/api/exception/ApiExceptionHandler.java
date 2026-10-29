package com.parisdevs.api.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler({
            OperacaoNaoEncontradaException.class,
            ContaBancariaNaoEncontradaException.class,
            UsuarioNaoEncontradoException.class,
            FilialNaoEncontradaException.class
    })
    public ResponseEntity<Map<String, String>> notFound(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler({
            EmailJaCadastradoException.class,
            CnpjJaCadastradoException.class,
            TokenJaCadastradoException.class
    })
    public ResponseEntity<Map<String, String>> conflict(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> vinculo() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "Não é possível excluir: há cadastros vinculados."));
    }

    @ExceptionHandler({
            CredenciaisInvalidasException.class,
            TokenAusenteException.class,
            TokenInvalidoException.class,
            TokenExpiradoException.class
    })
    public ResponseEntity<Map<String, String>> unauthorized(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler({ FilialObrigatoriaException.class, CnpjInvalidoException.class, DataInvalidaException.class })
    public ResponseEntity<Map<String, String>> badRequest(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> invalid(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Os dados informados são inválidos.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> unreadable() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Os dados informados são inválidos."));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> typeMismatch(MethodArgumentTypeMismatchException ex) {
        if (ex.getRequiredType() == java.time.LocalDate.class) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Informe uma data válida no formato YYYY-MM-DD."));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Os dados informados são inválidos."));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> constraint(ConstraintViolationException ex) {
        String message = ex.getConstraintViolations().stream()
                .findFirst()
                .map((violation) -> violation.getMessage())
                .orElse("Os dados informados são inválidos.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", message));
    }
}
