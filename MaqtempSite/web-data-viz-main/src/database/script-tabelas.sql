DROP DATABASE IF EXISTS maqtemp;
CREATE DATABASE maqtemp;
USE maqtemp;

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE empresas (
    idEmpresa INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    cnpj CHAR(14) UNIQUE NOT NULL,
    data_cadastro DATE DEFAULT (CURDATE()),
    ativo TINYINT DEFAULT 1,
    CONSTRAINT chkAtivo CHECK (ativo IN (0, 1))
);

INSERT INTO empresas (nome, cnpj) VALUES
('Tintas Exemplo Ltda', '12345678000199'),
('Metalúrgica Alfa', '98765432000155');

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE contrato (
    idContrato INT PRIMARY KEY AUTO_INCREMENT,
    fkEmpresa INT NOT NULL UNIQUE,
    status_contrato TINYINT NOT NULL,
    tipo_contrato VARCHAR(20),
    data_pagamento DATE,
    status_pagamento TINYINT NOT NULL,
    CONSTRAINT chkStatusContrato CHECK (status_contrato IN (0, 1)),
    CONSTRAINT chkTipoContrato CHECK (tipo_contrato IN ('Semestral', 'Anual')),
    CONSTRAINT chkStatusPagamento CHECK (status_pagamento IN (0, 1)),
    FOREIGN KEY (fkEmpresa) REFERENCES empresas(idEmpresa)
);

INSERT INTO contrato (fkEmpresa, status_contrato, tipo_contrato, data_pagamento, status_pagamento) VALUES
(1, 1, 'Anual', CURDATE(), 1),
(2, 1, 'Semestral', NULL, 0);

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE enderecos (
    idEndereco INT AUTO_INCREMENT,
    nomeEndereco VARCHAR(100) NOT NULL,
    cidade VARCHAR(50),
    rua VARCHAR(50),
    bairro VARCHAR(50),
    numero INT,
    cep CHAR(8),
    fkEmpresa INT NOT NULL,
    PRIMARY KEY (idEndereco, fkEmpresa),
    FOREIGN KEY (fkEmpresa) REFERENCES empresas(idEmpresa)
);

INSERT INTO enderecos (nomeEndereco, cidade, rua, bairro, numero, cep, fkEmpresa) VALUES
('Fábrica Matriz', 'São Paulo', 'Rua Haddock Lobo', 'Consolação', 595, '01414001', 1),
('Unidade Osasco', 'Osasco', 'Av. dos Autonomistas', 'Centro', 800, '06020010', 2);

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE usuario (
    idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    NomeCompleto VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    cpf CHAR(11) NOT NULL UNIQUE,
    telefone VARCHAR(11) NOT NULL UNIQUE,
    dtCadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    senha VARCHAR(255) NOT NULL,
    statuss VARCHAR(10) DEFAULT 'Ativo',
    fkResponsavel INT,
    fkEmpresa INT NOT NULL,
    CONSTRAINT chkEmail CHECK (email LIKE '%@%'),
    CONSTRAINT chkStatusUsuario CHECK (statuss IN ('Ativo', 'Inativo')),
    FOREIGN KEY (fkEmpresa) REFERENCES empresas(idEmpresa),
    FOREIGN KEY (fkResponsavel) REFERENCES usuario(idUsuario)
);

INSERT INTO usuario (NomeCompleto, email, cpf, telefone, senha, statuss, fkResponsavel, fkEmpresa) VALUES
('Felipe Santos Silva', 'felipe.santos@outlook.com', '12345678901', '11999998888', 'senha123', 'Ativo', NULL, 1),
('Cecilia Fernandes', 'cecilia.fernandes@outlook.com', '12345678902', '11999997777', 'senha123', 'Ativo', 1, 1),
('Rafael Lima', 'rafael.lima@outlook.com', '12345678903', '19999996666', 'senha123', 'Ativo', NULL, 2);

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE sensores (
    idSensor INT PRIMARY KEY AUTO_INCREMENT,
    modeloSensor VARCHAR(50),
    posicao VARCHAR(50),
    dtInstalacao DATE DEFAULT (CURDATE()),
    statuss VARCHAR(10) DEFAULT 'Ativo',
    CONSTRAINT chkStatusSensor CHECK (statuss IN ('Ativo', 'Inativo'))
);

INSERT INTO sensores (modeloSensor, posicao, statuss) VALUES
('LM35', 'Carcaça', 'Ativo'),
('LM35', 'Carcaça', 'Ativo'),
('LM35', 'Carcaça', 'Ativo'),
('LM35', 'Carcaça', 'Ativo');

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE motores (
    idMotor INT AUTO_INCREMENT,
    fkEndereco INT NOT NULL,
    modeloMotor VARCHAR(100),
    potencia DECIMAL(10,2),
    statuss VARCHAR(10),
    fkSensor INT UNIQUE,
    PRIMARY KEY (idMotor, fkEndereco),
    CONSTRAINT chkStatusMotor CHECK (statuss IN ('Ativo', 'Inativo')),
    FOREIGN KEY (fkEndereco) REFERENCES enderecos(idEndereco),
    FOREIGN KEY (fkSensor) REFERENCES sensores(idSensor)
);

INSERT INTO motores (fkEndereco, fkSensor, modeloMotor, potencia, statuss) VALUES
(1, 1, 'WEG W22', 15.00, 'Ativo'),
(1, 2, 'WEG W22 Plus', 30.00, 'Inativo'),
(1, 3, 'WEG W22', 15.00, 'Ativo'),
(2, 4, 'WEG W22', 22.00, 'Ativo');

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE metricas (
    idLeitura INT AUTO_INCREMENT,
    fkSensor INT NOT NULL,
    temperatura DECIMAL(5,2),
    dtLeitura DATETIME DEFAULT CURRENT_TIMESTAMP,
    situacao VARCHAR(10),
    PRIMARY KEY (idLeitura, fkSensor),
    CONSTRAINT chkSituacao CHECK (situacao IN ('Normal', 'Atenção', 'Alerta')),
    FOREIGN KEY (fkSensor) REFERENCES sensores(idSensor)
);

INSERT INTO metricas (fkSensor, temperatura, situacao) VALUES
(1, 62.50, 'Normal'),
(1, 64.10, 'Normal'),
(1, 81.30, 'Atenção'),
(2, 85.50, 'Atenção'),
(3, 92.90, 'Alerta'),
(3, 70.00, 'Normal'),
(4, 58.00, 'Normal');

-- ---------------------------------------------------------------------------------------------------------------------

SELECT * FROM empresas;

SELECT * FROM contrato;

SELECT * FROM enderecos;

SELECT * FROM usuario;

SELECT * FROM motores;

SELECT * FROM sensores;

SELECT * FROM metricas;

-- ---------------------------------------------------------------------------------------------------------------------

-- 1) Motores por empresa e endereço
SELECT e.nome AS empresa, en.nomeEndereco, m.modeloMotor, m.potencia, m.statuss
FROM empresas e
JOIN enderecos en ON en.fkEmpresa = e.idEmpresa
JOIN motores m ON m.fkEndereco = en.idEndereco
ORDER BY e.nome, m.idMotor;
 
-- 2) Leituras de temperatura com o motor correspondente
SELECT e.nome AS empresa, m.modeloMotor, me.temperatura, me.situacao, me.dtLeitura
FROM metricas me
JOIN sensores s ON s.idSensor = me.fkSensor
JOIN motores m ON m.fkSensor = s.idSensor
JOIN enderecos en ON en.idEndereco = m.fkEndereco
JOIN empresas e ON e.idEmpresa = en.fkEmpresa
ORDER BY me.dtLeitura DESC;
 
-- 3) Usuários e seus responsáveis (autorrelacionamento)
SELECT u.NomeCompleto AS usuario, r.NomeCompleto AS responsavel
FROM usuario u
LEFT JOIN usuario r ON u.fkResponsavel = r.idUsuario;
 
-- 4) Empresas com contrato ativo e pagamento pendente
SELECT e.nome, c.tipo_contrato
FROM empresas e
JOIN contrato c ON c.fkEmpresa = e.idEmpresa
WHERE c.status_contrato = 1 AND c.status_pagamento = 0;