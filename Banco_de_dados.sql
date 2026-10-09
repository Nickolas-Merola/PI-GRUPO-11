DROP DATABASE maqtemp;
CREATE DATABASE maqtemp;
USE maqtemp;

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE empresas (
    idEmpresa INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    cnpj CHAR(14) UNIQUE NOT NULL,
    data_cadastro DATE DEFAULT (CURDATE())
);

INSERT INTO empresas (nome, cnpj) VALUES
('Tintas Exemplo Ltda', '12345678000199'),
('Metalúrgica Alfa', '98765432000155');

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE contrato (
    idContrato INT PRIMARY KEY AUTO_INCREMENT,
    fkEmpresa INT NOT NULL UNIQUE,
    status_contrato VARCHAR(10) NOT NULL,
    tipo_contrato VARCHAR(20),
    data_pagamento DATE,
    status_pagamento TINYINT NOT NULL,
    CONSTRAINT chkStatusContrato CHECK (status_contrato IN ('Ativo', 'Cancelado')),
    CONSTRAINT chkTipoContrato CHECK (tipo_contrato IN ('Semestral', 'Anual')),
    CONSTRAINT chkStatusPagamento CHECK (status_pagamento IN (0, 1)),
    FOREIGN KEY (fkEmpresa) REFERENCES empresas(idEmpresa)
);

INSERT INTO contrato (fkEmpresa, status_contrato, tipo_contrato, data_pagamento, status_pagamento) VALUES
(1, 'Ativo', 'Anual', CURDATE(), 1),
(2, 'Ativo', 'Semestral', NULL, 0);

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE Locais (
    idLocal INT PRIMARY KEY AUTO_INCREMENT,
    nomeLocal VARCHAR(100) NOT NULL,
    cidade VARCHAR(50),
    rua VARCHAR(50),
    bairro VARCHAR(50),
    numero INT,
    cep CHAR(8),
    fkEmpresa INT NOT NULL,
    FOREIGN KEY (fkEmpresa) REFERENCES empresas(idEmpresa)
);

INSERT INTO Locais (nomeLocal, cidade, rua, bairro, numero, cep, fkEmpresa) VALUES
('Fábrica Matriz', 'São Paulo', 'Rua Haddock Lobo', 'Consolação', 595, '01414001', 1),
('Filial Campinas', 'Campinas', 'Av. Norte-Sul', 'Centro', 1200, '13010000', 1),
('Unidade Osasco', 'Osasco', 'Av. dos Autonomistas', 'Centro', 800, '06020010', 2);

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE usuario (
    idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    NomeCompleto VARCHAR(100) NOT NULL,
    fkLocal INT NOT NULL,
    email VARCHAR(100) UNIQUE,
    cpf CHAR(11) NOT NULL UNIQUE,
    numero VARCHAR(15) NOT NULL UNIQUE,
    dtCadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    senha VARCHAR(255) NOT NULL,
    statuss VARCHAR(10) DEFAULT 'Ativo',
    fkResponsavel INT,
    CONSTRAINT chkEmail CHECK (email LIKE '%@%'),
    CONSTRAINT chkStatusUsuario CHECK (statuss IN ('Ativo', 'Inativo')),
    FOREIGN KEY (fkLocal) REFERENCES Locais(idLocal),
    FOREIGN KEY (fkResponsavel) REFERENCES usuario(idUsuario)
);

INSERT INTO usuario (NomeCompleto, fkLocal, email, cpf, numero, senha, statuss, fkResponsavel) VALUES
('Felipe Santos Silva', 1, 'felipe.santos@outlook.com', '12345678901', '11999998888', 'senha123', 'Ativo', NULL),
('Cecilia Fernandes', 1, 'cecilia.fernandes@outlook.com', '12345678902', '11999997777', 'senha123', 'Ativo', 1),
('Rafael Lima', 3, 'rafael.lima@outlook.com', '12345678903', '19999996666', 'senha123', 'Ativo', NULL);

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE motores (
    idMotor INT PRIMARY KEY AUTO_INCREMENT,
    fkLocal INT NOT NULL,
    modeloMotor VARCHAR(100),
    potencia DECIMAL(10,2),
    statuss VARCHAR(10),
    CONSTRAINT chkStatusMotor CHECK (statuss IN ('Ativo', 'Inativo')),
    FOREIGN KEY (fkLocal) REFERENCES Locais(idLocal)
);

INSERT INTO motores (fkLocal, modeloMotor, potencia, statuss) VALUES
(1, 'WEG W22', 15.00, 'Ativo'),
(1, 'WEG W22 Plus', 30.00, 'Inativo'),
(1, 'WEG W22', 15.00, 'Ativo'),
(2, 'WEG W22', 22.00, 'Ativo');

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE sensores (
    idSensor INT AUTO_INCREMENT,
    fkMotor INT NOT NULL,
    modeloSensor VARCHAR(50),
    posicao VARCHAR(50),
    dtInstalacao DATE DEFAULT (CURDATE()),
    statuss VARCHAR(10) DEFAULT 'Ativo',
    PRIMARY KEY (idSensor, fkMotor),
    CONSTRAINT chkStatusSensor CHECK (statuss IN ('Ativo', 'Inativo')),
    FOREIGN KEY (fkMotor) REFERENCES motores(idMotor)
);

INSERT INTO sensores (fkMotor, modeloSensor, posicao, statuss) VALUES
(1, 'LM35', 'Carcaça', 'Ativo'),
(2, 'LM35', 'Carcaça', 'Ativo'),
(3, 'LM35', 'Carcaça', 'Ativo'),
(4, 'LM35', 'Carcaça', 'Ativo');

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE leituraTemperatura (
    idLeitura INT AUTO_INCREMENT,
    fkSensor INT NOT NULL,
    fkMotor INT NOT NULL,
    temperatura DECIMAL(5,2),
    dtLeitura DATETIME DEFAULT CURRENT_TIMESTAMP,
    situacao VARCHAR(10),
    PRIMARY KEY (idLeitura, fkSensor, fkMotor),
    CONSTRAINT chkSituacao CHECK (situacao IN ('Normal', 'Atenção', 'Alerta')),
    FOREIGN KEY (fkSensor, fkMotor) REFERENCES sensores(idSensor, fkMotor)
);

INSERT INTO leituraTemperatura (fkSensor, fkMotor, temperatura, situacao) VALUES
(1, 1, 62.50, 'Normal'),
(1, 1, 64.10, 'Normal'),
(1, 1, 81.30, 'Atenção'),
(2, 2, 85.50, 'Atenção'),
(3, 3, 92.90, 'Alerta'),
(3, 3, 70.00, 'Normal'),
(4, 4, 58.00, 'Normal');

-- ---------------------------------------------------------------------------------------------------------------------

SELECT * FROM empresas;

SELECT * FROM contrato;

SELECT * FROM Locais;

SELECT * FROM usuario;

SELECT * FROM motores;

SELECT * FROM sensores;

SELECT * FROM leituraTemperatura;

-- ---------------------------------------------------------------------------------------------------------------------

SELECT empresas.nome, empresas.cnpj, contrato.tipo_contrato, contrato.status_contrato, contrato.status_pagamento
FROM empresas
JOIN contrato ON contrato.fkEmpresa = empresas.idEmpresa;

SELECT empresas.nome, empresas.cnpj, contrato.tipo_contrato
FROM empresas
JOIN contrato ON contrato.fkEmpresa = empresas.idEmpresa
WHERE contrato.status_pagamento = 0;

SELECT empresas.nome AS empresa, Locais.nomeLocal, Locais.cidade
FROM empresas
JOIN Locais ON Locais.fkEmpresa = empresas.idEmpresa;

SELECT usuario.NomeCompleto, usuario.email, empresas.nome AS empresa, Locais.nomeLocal
FROM usuario
JOIN empresas ON usuario.fkEmpresa = empresas.idEmpresa
JOIN Locais ON usuario.fkLocal = Locais.idLocal;

SELECT funcionario.NomeCompleto AS funcionario, responsavel.NomeCompleto AS responsavel
FROM usuario AS funcionario
JOIN usuario AS responsavel ON funcionario.fkResponsavel = responsavel.idUsuario;

SELECT Locais.nomeLocal, motores.modeloMotor, motores.potencia, motores.statuss
FROM motores
JOIN Locais ON motores.fkLocal = Locais.idLocal;

SELECT motores.modeloMotor, sensores.modeloSensor, sensores.posicao
FROM sensores
JOIN motores ON sensores.fkMotor = motores.idMotor;

SELECT motores.modeloMotor, leituraTemperatura.temperatura, leituraTemperatura.situacao, leituraTemperatura.dtLeitura
FROM leituraTemperatura
JOIN motores ON leituraTemperatura.fkMotor = motores.idMotor
ORDER BY leituraTemperatura.dtLeitura DESC;

SELECT empresas.nome AS empresa, Locais.nomeLocal, motores.modeloMotor, sensores.modeloSensor,
       leituraTemperatura.temperatura, leituraTemperatura.situacao
FROM empresas
JOIN Locais ON Locais.fkEmpresa = empresas.idEmpresa
JOIN motores ON motores.fkLocal = Locais.idLocal
JOIN sensores ON sensores.fkMotor = motores.idMotor
JOIN leituraTemperatura ON leituraTemperatura.fkSensor = sensores.idSensor
                       AND leituraTemperatura.fkMotor = sensores.fkMotor;

SELECT * FROM leituraTemperatura
WHERE situacao = 'Alerta';

SELECT * FROM leituraTemperatura
WHERE situacao <> 'Normal';

SELECT fkMotor, AVG(temperatura) AS media, MIN(temperatura) AS minima, MAX(temperatura) AS maxima
FROM leituraTemperatura
GROUP BY fkMotor;

SELECT situacao, COUNT(*) AS quantidade
FROM leituraTemperatura
GROUP BY situacao;

SELECT Locais.nomeLocal, COUNT(motores.idMotor) AS qtdMotores
FROM Locais
LEFT JOIN motores ON Locais.idLocal = motores.fkLocal
GROUP BY Locais.nomeLocal;

-- ---------------------------------------------------------------------------------------------------------------------

UPDATE usuario SET statuss = 'Inativo' WHERE idUsuario = 3;

UPDATE contrato SET status_pagamento = 1, data_pagamento = CURDATE() WHERE fkEmpresa = 2;

UPDATE contrato SET status_contrato = 'Cancelado' WHERE fkEmpresa = 2;

UPDATE motores SET statuss = 'Inativo' WHERE idMotor = 1;

DELETE FROM leituraTemperatura WHERE idLeitura = 7;

-- ---------------------------------------------------------------------------------------------------------------------