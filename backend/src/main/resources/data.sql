INSERT INTO filial (razao_social, cnpj, endereco)
VALUES
    ('Tech Solutions LTDA', '12.345.678/0001-90', 'Rua das Flores, 100 - São Paulo/SP'),
    ('Inovação Digital LTDA', '98.765.432/0001-10', 'Av. Brasil, 500 - Campinas/SP');

-- 2. USUARIO
INSERT INTO usuario (nome, cargo, email, senha, filial_id)
VALUES
    ('Carlos Silva', 'Administrador', 'carlos@techsolutions.com', 'senha123', 1),
    ('Ana Souza', 'Financeiro', 'ana@techsolutions.com', 'senha456', 1),
    ('Pedro Santos', 'Gerente', 'pedro@inovacaodigital.com', 'senha789', 2);

-- 3. CONTABANCARIA
INSERT INTO contabancaria
(banco, agencia, numero_conta, tipo, saldo, filial_id)
VALUES
    ('Banco do Brasil', '1234', '123456-7', 1.00, 15000.00, 1),
    ('Itaú', '5678', '987654-3', 2.00, 25000.00, 1),
    ('Santander', '9012', '456789-0', 1.00, 10000.00, 2);

-- 4. RECEITA
INSERT INTO receita
(descricao, valor, data_receita, categoria, conta_bancaria_id)
VALUES
    ('Venda de serviços', 12000.00, '2026-10-05', 'Serviços', 1),
    ('Consultoria de TI', 8000.00, '2026-10-10', 'Consultoria', 2),
    ('Venda de licenças', 5000.00, '2026-10-15', 'Vendas', 3);

-- 5. DESPESA
INSERT INTO despesa
(descricao, valor, data_despesa, categoria, filial_id)
VALUES
    ('Pagamento de aluguel', 2500.00, '2026-10-03', 'Infraestrutura', 1),
    ('Pagamento de salários', 6000.00, '2026-10-10', 'Pessoal', 1),
    ('Compra de equipamentos', 1800.00, '2026-10-12', 'Equipamentos', 2);

-- 6. RESULTADO
INSERT INTO resultado
(filial_id, receita_id, despesa_id, periodo,
 receita_total, despesa_total, resultado_liquido)
VALUES
    (1, 1, 1, '2026-10', 12000.00, 2500.00, 9500.00),
    (1, 2, 2, '2026-10', 8000.00, 6000.00, 2000.00),
    (2, 3, 3, '2026-10', 5000.00, 1800.00, 3200.00);
-- 7. RESULTADO
-- RECEITAS DE TESTE
INSERT INTO receita (descricao, valor, data_receita, categoria, conta_bancaria_id)
VALUES
    ('Venda de software - teste', 15000.00, '2026-10-05', 'Vendas', 1),
    ('Consultoria - teste',        8500.00, '2026-10-12', 'Serviços', 2),
    ('Manutenção - teste',         3500.00, '2026-10-20', 'Serviços', 1);

-- DESPESAS DE TESTE
INSERT INTO despesa (descricao, valor, data_despesa, categoria, filial_id)
VALUES
    ('Aluguel - teste',            2500.00, '2026-10-03', 'Operacional', 1),
    ('Folha de pagamento - teste', 6000.00, '2026-10-10', 'Pessoal',     1),
    ('Infraestrutura - teste',     1800.00, '2026-10-15', 'Tecnologia',  1);
