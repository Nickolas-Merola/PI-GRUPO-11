CREATE DATABASE maqtemp;
USE maqtemp;

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE Locais (
    idLocal INT PRIMARY KEY AUTO_INCREMENT,
    nomeLocal VARCHAR(100) NOT NULL,
    cidade VARCHAR(50),
    cep CHAR(8),
    responsavelLocal VARCHAR(50)
);

INSERT INTO Locais (nomeLocal, cidade, cep, responsavelLocal) VALUES
('Fábrica Matriz', 'São Paulo', '01001000', 'Carlos Gerente');

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE usuario (
    idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    NomeCompleto VARCHAR(100) NOT NULL,
    idLocal INT NOT NULL,
    email VARCHAR(100) UNIQUE,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    numero VARCHAR(15) NOT NULL UNIQUE,
    dtCadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    senha VARCHAR(255) NOT NULL,
    statuss VARCHAR(10) DEFAULT 'Ativo',
    CONSTRAINT chkEmail CHECK (email LIKE '%@%'),
    CONSTRAINT chkStatusUsuario CHECK (statuss IN ('Ativo', 'Inativo')),
    FOREIGN KEY (idLocal) REFERENCES Locais(idLocal)
);

INSERT INTO usuario (NomeCompleto, idLocal, email, cpf, numero, senha, statuss) VALUES
('Felipe Santos Silva', 1, 'felipe.santos@outlook.com',    '12345678901', '11999998888', 'senha123', 'Ativo'),
('Cecilia Fernandes',   1, 'cecilia.mendonca@outlook.com', '12345678902', '11999997777', 'senha123', 'Ativo');

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE empresas (
    idEmpresa INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    idLocal INT,
    cnpj CHAR(14) UNIQUE NOT NULL,
    data_cadastro DATE DEFAULT (CURDATE()),
    status_contrato VARCHAR(10) NOT NULL,
    tipo_contrato VARCHAR(20),
    data_pagamento DATE,
    status_pagamento TINYINT NOT NULL,
    idUsuario INT NOT NULL UNIQUE,
    CONSTRAINT chkStatusContrato  CHECK (status_contrato IN ('Ativo', 'Cancelado')),
    CONSTRAINT chkTipoContrato    CHECK (tipo_contrato IN ('Semestral', 'Anual')),
    CONSTRAINT chkStatusPagamento CHECK (status_pagamento IN (0, 1)),
    FOREIGN KEY (idLocal)   REFERENCES Locais(idLocal),
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario)
);

INSERT INTO empresas (nome, idLocal, cnpj, status_contrato, tipo_contrato, data_pagamento, status_pagamento, idUsuario) VALUES
('Tintas Exemplo Ltda', 1, '12345678000199', 'Ativo', 'Anual', CURDATE(), 1, 1);

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE motores (
    idMotor INT PRIMARY KEY AUTO_INCREMENT,
    idLocal INT NOT NULL,
    modeloMotor VARCHAR(100),
    potencia DECIMAL(10,2),
    statuss VARCHAR(10),
    CONSTRAINT chkStatusMotor CHECK (statuss IN ('Ativo', 'Inativo')),
    FOREIGN KEY (idLocal) REFERENCES Locais(idLocal)
);

INSERT INTO motores (idLocal, modeloMotor, potencia, statuss) VALUES
(1, 'WEG W22',      15.00, 'Ativo'),
(1, 'WEG W22 Plus', 30.00, 'Inativo'),
(1, 'WEG 22',       15.00, 'Ativo');

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE sensores (
    idSensor INT AUTO_INCREMENT,
    idMotor INT NOT NULL,
    modeloSensor VARCHAR(50),
    posicao VARCHAR(50),
    dtInstalacao DATE DEFAULT (CURDATE()),
    statuss VARCHAR(10) DEFAULT 'Ativo',
    PRIMARY KEY (idSensor, idMotor),
    CONSTRAINT chkStatusSensor CHECK (statuss IN ('Ativo', 'Inativo')),
    FOREIGN KEY (idMotor) REFERENCES motores(idMotor)
);

INSERT INTO sensores (idMotor, modeloSensor, posicao, statuss) VALUES
(1, 'DS18B20', 'Carcaça', 'Ativo'),
(2, 'DS18B20', 'Carcaça', 'Ativo'),
(3, 'DS18B20', 'Carcaça', 'Ativo');

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE leituraTemperatura (
    idLeitura INT AUTO_INCREMENT,
    idSensor INT NOT NULL,
    idMotor INT NOT NULL,
    temperatura DECIMAL(5,2),
    dtLeitura DATETIME DEFAULT CURRENT_TIMESTAMP,
    situacao VARCHAR(10),
    PRIMARY KEY (idLeitura, idSensor, idMotor),
    CONSTRAINT chkSituacao CHECK (situacao IN ('Normal', 'Atenção', 'Alerta')),
    FOREIGN KEY (idSensor, idMotor) REFERENCES sensores(idSensor, idMotor)
);

INSERT INTO leituraTemperatura (idSensor, idMotor, temperatura, situacao) VALUES
(1, 1, 62.50, 'Normal'),
(2, 2, 85.50, 'Atenção'),
(3, 3, 92.90, 'Alerta');

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE alertas (
    idAlerta INT AUTO_INCREMENT,
    idLeitura INT NOT NULL,
    idSensor INT NOT NULL,
    idMotor INT NOT NULL,
    idUsuarioResponsavel INT NULL,
    dtAlerta DATETIME DEFAULT CURRENT_TIMESTAMP,
    nivel VARCHAR(10),
    dataResolucao DATETIME,
    observacao VARCHAR(255),
    statuss VARCHAR(10),
    PRIMARY KEY (idAlerta, idLeitura, idSensor, idMotor),
    CONSTRAINT chkNivel CHECK (nivel IN ('Atenção', 'Alerta')),
    CONSTRAINT chkStatusAlerta CHECK (statuss IN ('Pendente', 'Resolvido')),
    FOREIGN KEY (idLeitura, idSensor, idMotor) REFERENCES leituraTemperatura(idLeitura, idSensor, idMotor),
    FOREIGN KEY (idUsuarioResponsavel) REFERENCES usuario(idUsuario)
);

INSERT INTO alertas (idLeitura, idSensor, idMotor, idUsuarioResponsavel, nivel, dataResolucao, observacao, statuss) VALUES
(3, 3, 3, 1,    'Alerta',  NOW(), 'Temperatura acima do limite; motor inspecionado.', 'Resolvido'),
(2, 2, 2, NULL, 'Atenção', NULL,  NULL,'Pendente');

-- ---------------------------------------------------------------------------------------------------------------------

SELECT
    a.idAlerta,
    l.nomeLocal,
    m.modeloMotor,
    s.posicao,
    lt.temperatura,
    a.nivel,
    a.statuss AS status_alerta,
    u.NomeCompleto AS responsavel
FROM alertas AS a
JOIN leituraTemperatura AS lt ON a.idLeitura = lt.idLeitura
                             AND a.idSensor  = lt.idSensor
                             AND a.idMotor   = lt.idMotor
JOIN sensores AS s            ON lt.idSensor = s.idSensor
                             AND lt.idMotor  = s.idMotor
JOIN motores AS m             ON s.idMotor   = m.idMotor
JOIN Locais AS l              ON m.idLocal   = l.idLocal
LEFT JOIN usuario AS u        ON a.idUsuarioResponsavel = u.idUsuario;