-- 1. FILIAL (CNPJ com 14 dígitos; token obrigatório no cadastro via API)
INSERT INTO filial (razao_social, cnpj, endereco, token)
VALUES
    ('Tech Solutions LTDA', '12345678000190', 'Rua das Flores, 100 - São Paulo/SP', 'tok_tech_solutions'),
    ('Inovação Digital LTDA', '98765432000110', 'Av. Brasil, 500 - Campinas/SP', 'tok_inovacao_digital');

-- 2. USUARIO (cargo = enum STRING)
INSERT INTO usuario (nome, cargo, email, senha, filial_id)
VALUES
    ('Carlos Silva', 'ADMINISTRADOR', 'carlos@techsolutions.com', 'senha123', 1),
    ('Ana Souza', 'FINANCEIRO', 'ana@techsolutions.com', 'senha456', 1),
    ('Pedro Santos', 'GERENTE', 'pedro@inovacaodigital.com', 'senha789', 2);

-- 3. CONTA_BANCARIA
INSERT INTO conta_bancaria
(codigo_banco, nome_instituicao, agencia, agencia_digito, numero_conta, tipo_conta,
 cpf_cnpj_titular, nome_titular, ativo, saldo, filial_id)
VALUES
    ('001', 'Banco do Brasil', '1234', '0', '123456-7', 'Conta corrente',
     '12345678000190', 'Tech Solutions LTDA', TRUE, 15000.00, 1),
    ('341', 'Itaú', '5678', '0', '987654-3', 'Conta corrente',
     '12345678000190', 'Tech Solutions LTDA', TRUE, 25000.00, 1),
    ('033', 'Santander', '9012', '9', '456789-0', 'Conta corrente',
     '98765432000110', 'Inovação Digital LTDA', TRUE, 10000.00, 2);

-- 4. OPERACAO (tipo_operacao: 0 = RECEBIMENTO, 1 = PAGAMENTO)
INSERT INTO operacao
(valor_operacao, tipo_operacao, razao_social, categoria, dt_hora, fk_conta_bancaria)
VALUES
    (12000.00, 0, 'Tech Solutions LTDA', 'Serviços', '2026-10-05 10:00:00', 1),
    (8000.00, 0, 'Tech Solutions LTDA', 'Consultoria', '2026-10-10 14:30:00', 2),
    (5000.00, 0, 'Inovação Digital LTDA', 'Vendas', '2026-10-15 09:15:00', 3),
    (2500.00, 1, 'Imobiliária Parque', 'Infraestrutura', '2026-10-03 08:30:00', 1),
    (6000.00, 1, 'Folha de pagamento', 'Pessoal', '2026-10-10 07:00:00', 1),
    (1800.00, 1, 'Fornecedor Equipamentos', 'Equipamentos', '2026-10-12 16:20:00', 3);
