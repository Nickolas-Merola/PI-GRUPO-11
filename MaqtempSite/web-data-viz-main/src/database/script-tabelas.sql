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
('Unidade Osasco', 'Osasco', 'Av. dos Autonomistas', 'Centro', 800, '06020010', 2),
('Unidade Guarulhos', 'Guarulhos', 'Av. Tiradentes', 'Centro', 1200, '07090000', 1);



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
    fkEmpresa INT,
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
(2, 4, 'WEG W22', 22.00, 'Ativo'),
(2, 4, 'WEG W22', 22.00, 'Ativo'),
(3, 5, 'WEG W22', 18.50, 'Ativo');

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE metricas (
    idLeitura INT AUTO_INCREMENT,
    fkSensor INT NOT NULL,
    temperatura DECIMAL(5,2),
    dtLeitura DATETIME DEFAULT CURRENT_TIMESTAMP,
    situacao VARCHAR(10),
    PRIMARY KEY (idLeitura, fkSensor),
    FOREIGN KEY (fkSensor) REFERENCES sensores(idSensor)
);

INSERT INTO metricas (fkSensor, temperatura, situacao) VALUES
(4, 58.00, 'Normal');

INSERT INTO metricas (fkSensor, temperatura, situacao, dtLeitura) VALUES
(2, 55.00, 'Normal', NOW() - INTERVAL 3000 MINUTE),
(2, 54.20, 'Normal', NOW() - INTERVAL 2940 MINUTE),
(1, 62.50, 'Normal', NOW() - INTERVAL 1410 MINUTE),
(1, 64.00, 'Normal', NOW() - INTERVAL 1290 MINUTE),
(1, 66.20, 'Normal', NOW() - INTERVAL 1170 MINUTE),
(1, 68.90, 'Normal', NOW() - INTERVAL 1050 MINUTE),
(1, 73.40, 'Normal', NOW() - INTERVAL 930 MINUTE),
(1, 78.10, 'Normal', NOW() - INTERVAL 810 MINUTE),
(1, 84.30, 'Atenção', NOW() - INTERVAL 690 MINUTE),
(1, 81.70, 'Atenção', NOW() - INTERVAL 570 MINUTE),
(1, 76.00, 'Normal', NOW() - INTERVAL 450 MINUTE),
(1, 70.20, 'Normal', NOW() - INTERVAL 330 MINUTE),
(1, 68.50, 'Normal', NOW() - INTERVAL 210 MINUTE),
(1, 69.80, 'Normal', NOW() - INTERVAL 90 MINUTE),
(1, 70.40, 'Normal', NOW() - INTERVAL 50 MINUTE),
(1, 71.00, 'Normal', NOW() - INTERVAL 40 MINUTE),
(1, 70.60, 'Normal', NOW() - INTERVAL 30 MINUTE),
(1, 71.90, 'Normal', NOW() - INTERVAL 20 MINUTE),
(1, 72.30, 'Normal', NOW() - INTERVAL 10 MINUTE),
(1, 71.30, 'Normal', NOW() - INTERVAL 2 MINUTE),
(3, 70.10, 'Normal', NOW() - INTERVAL 1410 MINUTE),
(3, 72.40, 'Normal', NOW() - INTERVAL 1290 MINUTE),
(3, 74.00, 'Normal', NOW() - INTERVAL 1170 MINUTE),
(3, 76.80, 'Normal', NOW() - INTERVAL 1050 MINUTE),
(3, 79.50, 'Normal', NOW() - INTERVAL 930 MINUTE),
(3, 82.00, 'Atenção', NOW() - INTERVAL 810 MINUTE),
(3, 85.40, 'Atenção', NOW() - INTERVAL 690 MINUTE),
(3, 87.90, 'Atenção', NOW() - INTERVAL 570 MINUTE),
(3, 83.20, 'Atenção', NOW() - INTERVAL 450 MINUTE),
(3, 80.60, 'Atenção', NOW() - INTERVAL 330 MINUTE),
(3, 84.70, 'Atenção', NOW() - INTERVAL 210 MINUTE),
(3, 88.30, 'Atenção', NOW() - INTERVAL 90 MINUTE),
(3, 89.60, 'Atenção', NOW() - INTERVAL 50 MINUTE),
(3, 90.80, 'Alerta', NOW() - INTERVAL 40 MINUTE),
(3, 91.50, 'Alerta', NOW() - INTERVAL 30 MINUTE),
(3, 92.10, 'Alerta', NOW() - INTERVAL 20 MINUTE),
(3, 93.40, 'Alerta', NOW() - INTERVAL 10 MINUTE),
(3, 92.80, 'Alerta', NOW() - INTERVAL 2 MINUTE),
(4, 52.30, 'Normal', NOW() - INTERVAL 1410 MINUTE),
(4, 55.10, 'Normal', NOW() - INTERVAL 1050 MINUTE),
(4, 59.80, 'Normal', NOW() - INTERVAL 690 MINUTE),
(4, 61.20, 'Normal', NOW() - INTERVAL 330 MINUTE),
(4, 57.40, 'Normal', NOW() - INTERVAL 90 MINUTE),
(4, 58.60, 'Normal', NOW() - INTERVAL 30 MINUTE),
(4, 57.90, 'Normal', NOW() - INTERVAL 10 MINUTE),
(5, 74.80, 'Normal', NOW() - INTERVAL 690 MINUTE),
(5, 81.20, 'Atenção', NOW() - INTERVAL 330 MINUTE),
(5, 83.50, 'Atenção', NOW() - INTERVAL 30 MINUTE),
(5, 82.10, 'Atenção', NOW() - INTERVAL 2 MINUTE);

CREATE TABLE acesso_unidade (
    fkUsuario INT NOT NULL,
    fkEndereco INT NOT NULL,
    nivelAcesso VARCHAR(15) DEFAULT 'Visualizar',
    dtLiberacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (fkUsuario, fkEndereco),
    CONSTRAINT chkNivelAcesso CHECK (nivelAcesso IN ('Visualizar', 'Gerenciar')),
    FOREIGN KEY (fkUsuario) REFERENCES usuario(idUsuario),
    FOREIGN KEY (fkEndereco) REFERENCES enderecos(idEndereco)
);

INSERT INTO acesso_unidade (fkUsuario, fkEndereco, nivelAcesso) VALUES
(1, 1, 'Gerenciar'),   -- Felipe: Fábrica Matriz
(1, 3, 'Gerenciar'),   -- Felipe: Unidade Guarulhos
(2, 1, 'Visualizar'),  -- Cecilia: Fábrica Matriz
(3, 2, 'Gerenciar');   -- Rafael: Unidade Osasco

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

-- Plantas que um usuário pode ver (vai para o model da dashboard)
SELECT e.idEndereco, e.nomeEndereco, a.nivelAcesso
FROM acesso_unidade a
JOIN enderecos e ON e.idEndereco = a.fkEndereco
WHERE a.fkUsuario = 1;
ALTER TABLE metricas ADD CONSTRAINT chkSituacao CHECK (situacao IN ('Normal', 'Atenção', 'Alerta'));