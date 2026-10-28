CREATE TABLE usuarios (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255),
    email VARCHAR(255),
    senha_hash VARCHAR(255),
    role VARCHAR(100),
    ativo BOOLEAN,
    criado_em DATETIME,
    PRIMARY KEY (id)
);

CREATE TABLE clientes (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255),
    cpf_cnpj VARCHAR(32),
    telefone VARCHAR(32),
    email VARCHAR(255),
    endereco VARCHAR(500),
    criado_em DATETIME,
    PRIMARY KEY (id)
);

CREATE TABLE fornecedores (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255),
    cnpj VARCHAR(32),
    telefone VARCHAR(32),
    email VARCHAR(255),
    endereco VARCHAR(500),
    PRIMARY KEY (id)
);

CREATE TABLE categorias_produto (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE produtos (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255),
    categoria_id INT,
    unidade_medida VARCHAR(100),
    preco_custo DECIMAL(15,2),
    preco_venda DECIMAL(15,2),
    quantidade_atual DECIMAL(15,3),
    estoque_minimo DECIMAL(15,3),
    ativo BOOLEAN,
    criado_em DATETIME,
    atualizado_em DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_produtos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias_produto (id)
);

CREATE TABLE vendas (
    id INT NOT NULL AUTO_INCREMENT,
    cliente_id INT,
    usuario_id INT,
    data DATETIME,
    status VARCHAR(100),
    forma_pagamento VARCHAR(100),
    desconto DECIMAL(15,2),
    total DECIMAL(15,2),
    PRIMARY KEY (id),
    CONSTRAINT fk_vendas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes (id),
    CONSTRAINT fk_vendas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

CREATE TABLE venda_itens (
    id INT NOT NULL AUTO_INCREMENT,
    venda_id INT,
    produto_id INT,
    quantidade DECIMAL(15,3),
    preco_unitario DECIMAL(15,2),
    subtotal DECIMAL(15,2),
    PRIMARY KEY (id),
    CONSTRAINT fk_venda_itens_venda FOREIGN KEY (venda_id) REFERENCES vendas (id),
    CONSTRAINT fk_venda_itens_produto FOREIGN KEY (produto_id) REFERENCES produtos (id)
);

CREATE TABLE compras (
    id INT NOT NULL AUTO_INCREMENT,
    fornecedor_id INT,
    usuario_id INT,
    data DATETIME,
    status VARCHAR(100),
    forma_pagamento VARCHAR(100),
    subtotal DECIMAL(15,2),
    total DECIMAL(15,2),
    PRIMARY KEY (id),
    CONSTRAINT fk_compras_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedores (id),
    CONSTRAINT fk_compras_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

CREATE TABLE compra_itens (
    id INT NOT NULL AUTO_INCREMENT,
    compra_id INT,
    produto_id INT,
    quantidade DECIMAL(15,3),
    preco_unitario DECIMAL(15,2),
    subtotal DECIMAL(15,2),
    PRIMARY KEY (id),
    CONSTRAINT fk_compra_itens_compra FOREIGN KEY (compra_id) REFERENCES compras (id),
    CONSTRAINT fk_compra_itens_produto FOREIGN KEY (produto_id) REFERENCES produtos (id)
);

CREATE TABLE movimentacoes_estoque (
    id INT NOT NULL AUTO_INCREMENT,
    produto_id INT,
    usuario_id INT,
    tipo VARCHAR(100),
    quantidade DECIMAL(15,3),
    motivo VARCHAR(500),
    origem VARCHAR(100),
    origem_id INT,
    data DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_movimentacoes_produto FOREIGN KEY (produto_id) REFERENCES produtos (id),
    CONSTRAINT fk_movimentacoes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

CREATE TABLE categorias_financeiras (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255),
    tipo VARCHAR(100),
    PRIMARY KEY (id)
);

CREATE TABLE contas_financeiras (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255),
    tipo VARCHAR(100),
    saldo_atual DECIMAL(15,2),
    PRIMARY KEY (id)
);

CREATE TABLE lancamentos_financeiros (
    id INT NOT NULL AUTO_INCREMENT,
    tipo VARCHAR(100),
    categoria_id INT,
    conta_financeira_id INT,
    descricao VARCHAR(500),
    valor DECIMAL(15,2),
    data_vencimento DATE,
    data_pagamento DATE,
    status VARCHAR(100),
    origem VARCHAR(100),
    origem_id INT,
    usuario_id INT,
    PRIMARY KEY (id),
    CONSTRAINT fk_lancamentos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias_financeiras (id),
    CONSTRAINT fk_lancamentos_conta FOREIGN KEY (conta_financeira_id) REFERENCES contas_financeiras (id),
    CONSTRAINT fk_lancamentos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

CREATE TABLE metas (
    id INT NOT NULL AUTO_INCREMENT,
    tipo VARCHAR(100),
    valor_meta DECIMAL(15,2),
    mes_referencia DATE,
    PRIMARY KEY (id)
);

CREATE TABLE empresa (
    id INT NOT NULL AUTO_INCREMENT,
    razao_social VARCHAR(255),
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(32),
    telefone VARCHAR(32),
    endereco VARCHAR(500),
    logo_url VARCHAR(1000),
    PRIMARY KEY (id)
);

CREATE TABLE previsoes_financeiras (
    id INT NOT NULL AUTO_INCREMENT,
    mes_referencia DATE,
    valor_previsto DECIMAL(15,2),
    metodo VARCHAR(100),
    data_geracao DATETIME,
    PRIMARY KEY (id)
);

CREATE TABLE alertas_discrepancia (
    id INT NOT NULL AUTO_INCREMENT,
    tipo VARCHAR(100),
    referencia_tabela VARCHAR(255),
    referencia_id INT,
    descricao VARCHAR(1000),
    percentual_variacao DECIMAL(8,3),
    data_geracao DATETIME,
    status VARCHAR(100),
    PRIMARY KEY (id)
);
