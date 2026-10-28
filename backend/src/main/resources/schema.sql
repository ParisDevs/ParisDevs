DROP TABLE IF EXISTS
    resultado,
    receita,
    despesa,
    contabancaria,
    usuario,
    filial
    CASCADE;

CREATE TABLE filial (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    razao_social VARCHAR(255),
    cnpj VARCHAR(18),
    endereco VARCHAR(255)
);

CREATE TABLE usuario (
     id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     nome VARCHAR(100),
     cargo VARCHAR(50),
     email VARCHAR(100),
     senha VARCHAR(255),
     filial_id INT,
     CONSTRAINT fk_usuario_filial
         FOREIGN KEY (filial_id) REFERENCES filial(id)
);

CREATE TABLE contabancaria (
   id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   banco VARCHAR(100),
   agencia VARCHAR(20),
   numero_conta VARCHAR(20),
   tipo DECIMAL(15,2),
   saldo DECIMAL(15,2),
   filial_id INT,
   CONSTRAINT fk_contabancaria_filial
       FOREIGN KEY (filial_id) REFERENCES filial(id)
);

CREATE TABLE receita (
     id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     descricao VARCHAR(255),
     valor DECIMAL(15,2),
     data_receita DATE,
     categoria VARCHAR(50),
     conta_bancaria_id INT,
     CONSTRAINT fk_receita_contabancaria
         FOREIGN KEY (conta_bancaria_id) REFERENCES contabancaria(id)
);

CREATE TABLE despesa (
     id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     descricao VARCHAR(255),
     valor DECIMAL(15,2),
     data_despesa DATE,
     categoria VARCHAR(50),
     filial_id INT,
     CONSTRAINT fk_despesa_filial
         FOREIGN KEY (filial_id) REFERENCES filial(id)
);

CREATE TABLE resultado (
   id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   filial_id INT,
   receita_id INT,
   despesa_id INT,
   periodo VARCHAR(7),
   receita_total DECIMAL(15,2),
   despesa_total DECIMAL(15,2),
   resultado_liquido DECIMAL(15,2),
   CONSTRAINT fk_resultado_filial
       FOREIGN KEY (filial_id) REFERENCES filial(id),
   CONSTRAINT fk_resultado_receita
       FOREIGN KEY (receita_id) REFERENCES receita(id),
   CONSTRAINT fk_resultado_despesa
       FOREIGN KEY (despesa_id) REFERENCES despesa(id)
);
