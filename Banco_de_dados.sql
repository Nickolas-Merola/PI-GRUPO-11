CREATE DATABASE maqtemp;
USE maqtemp;

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE Locais (
    idLocal INT PRIMARY KEY AUTO_INCREMENT,
    nomeLocal VARCHAR(100) NOT NULL,
    cidade VARCHAR(50),
    rua VARCHAR(50),
    bairro VARCHAR(50),
    numero INT,
    cep CHAR(8)
    );

INSERT INTO Locais (nomeLocal, cidade, rua, bairro, numero, cep, responsavelLocal) VALUES
('Fábrica Matriz', 'São Paulo', 'Rua Haddock Lobo', 'Consolação', 595, '01414001', 'Carlos Gerente'),
('Filial Campinas', 'Campinas', 'Av. Norte-Sul', 'Centro', 1200, '13010000', 'Marina Souza');

-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE usuario (
    idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    NomeCompleto VARCHAR(100) NOT NULL,
    idLocal INT NOT NULL,
    email VARCHAR(100) UNIQUE,
    cpf CHAR(11) NOT NULL UNIQUE,
    numero VARCHAR(15) NOT NULL UNIQUE,
    dtCadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    senha VARCHAR(255) NOT NULL,
    statuss VARCHAR(10) DEFAULT 'Ativo',
    fkFuncionario INT,
    FOREIGN KEY (fkFuncionario) REFERENCES usuario(idUsuario),
    CONSTRAINT chkEmail CHECK (email LIKE '%@%'),
    CONSTRAINT chkStatusUsuario CHECK (statuss IN ('Ativo', 'Inativo')),
    FOREIGN KEY (idLocal) REFERENCES Locais(idLocal)
);

INSERT INTO usuario (NomeCompleto, idLocal, email, cpf, numero, senha, statuss, fkFuncionario) VALUES
('Felipe Santos Silva', 1, 'felipe.santos@outlook.com', '12345678901', '11999998888', 'senha123', 'Ativo', NULL),
('Cecilia Fernandes', 1, 'cecilia.fernandes@outlook.com', '12345678902', '11999997777', 'senha123', 'Ativo', 1),
('Rafael Lima', 2, 'rafael.lima@outlook.com', '12345678903', '19999996666', 'senha123', 'Ativo', 1);

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
    CONSTRAINT chkStatusContrato CHECK (status_contrato IN ('Ativo', 'Cancelado')),
    CONSTRAINT chkTipoContrato CHECK (tipo_contrato IN ('Semestral', 'Anual')),
    CONSTRAINT chkStatusPagamento CHECK (status_pagamento IN (0, 1)),
    FOREIGN KEY (idLocal) REFERENCES Locais(idLocal),
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario)
);

INSERT INTO empresas (nome, idLocal, cnpj, status_contrato, tipo_contrato, data_pagamento, status_pagamento, idUsuario) VALUES
('Tintas Exemplo Ltda', 1, '12345678000199', 'Ativo', 'Anual', CURDATE(), 1, 1),
('Metalúrgica Alfa', 2, '98765432000155', 'Ativo', 'Semestral', NULL, 0, 3);

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
(1, 'WEG W22', 15.00, 'Ativo'),
(1, 'WEG W22 Plus', 30.00, 'Inativo'),
(1, 'WEG W22', 15.00, 'Ativo'),
(2, 'WEG W22', 22.00, 'Ativo');

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
(1, 'LM35', 'Carcaça', 'Ativo'),
(2, 'LM35', 'Carcaça', 'Ativo'),
(3, 'LM35', 'Carcaça', 'Ativo'),
(4, 'LM35', 'Carcaça', 'Ativo');

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
(1, 1, 64.10, 'Normal'),
(1, 1, 81.30, 'Atenção'),
(2, 2, 85.50, 'Atenção'),
(3, 3, 92.90, 'Alerta'),
(3, 3, 70.00, 'Normal'),
(4, 4, 58.00, 'Normal');

-- ---------------------------------------------------------------------------------------------------------------------

SELECT * FROM Locais;

SELECT * FROM usuario;

SELECT * FROM empresas;

SELECT * FROM motores;

SELECT * FROM sensores;

SELECT * FROM leituraTemperatura;

-- ---------------------------------------------------------------------------------------------------------------------

SELECT usuario.NomeCompleto, usuario.email, Locais.nomeLocal
FROM usuario
JOIN Locais ON usuario.idLocal = Locais.idLocal;

SELECT empresas.nome, empresas.cnpj, usuario.NomeCompleto AS responsavel, Locais.nomeLocal
FROM empresas
JOIN usuario ON empresas.idUsuario = usuario.idUsuario
JOIN Locais ON empresas.idLocal = Locais.idLocal;

SELECT nome, cnpj, tipo_contrato
FROM empresas
WHERE status_pagamento = 0;

SELECT funcionario.NomeCompleto AS funcionario, gestor.NomeCompleto AS gestor
FROM usuario AS funcionario
JOIN usuario AS gestor ON funcionario.fkFuncionario = gestor.idUsuario;

SELECT Locais.nomeLocal, motores.modeloMotor, motores.potencia, motores.statuss
FROM motores
JOIN Locais ON motores.idLocal = Locais.idLocal;

SELECT motores.modeloMotor, sensores.modeloSensor, sensores.posicao
FROM sensores
JOIN motores ON sensores.idMotor = motores.idMotor;

SELECT motores.modeloMotor, leituraTemperatura.temperatura, leituraTemperatura.situacao, leituraTemperatura.dtLeitura
FROM leituraTemperatura
JOIN motores ON leituraTemperatura.idMotor = motores.idMotor
ORDER BY leituraTemperatura.dtLeitura DESC;

SELECT * FROM leituraTemperatura
WHERE situacao = 'Alerta';

SELECT * FROM leituraTemperatura
WHERE situacao <> 'Normal';

SELECT idMotor, AVG(temperatura) AS media, MIN(temperatura) AS minima, MAX(temperatura) AS maxima
FROM leituraTemperatura
GROUP BY idMotor;

SELECT situacao, COUNT(*) AS quantidade
FROM leituraTemperatura
GROUP BY situacao;

SELECT Locais.nomeLocal, COUNT(motores.idMotor) AS qtdMotores
FROM Locais
LEFT JOIN motores ON Locais.idLocal = motores.idLocal
GROUP BY Locais.nomeLocal;

-- ---------------------------------------------------------------------------------------------------------------------

UPDATE usuario SET statuss = 'Inativo' WHERE idUsuario = 3;

UPDATE empresas SET status_pagamento = 1, data_pagamento = CURDATE() WHERE idEmpresa = 2;

UPDATE empresas SET status_contrato = 'Cancelado' WHERE idEmpresa = 2;

UPDATE motores SET statuss = 'Inativo' WHERE idMotor = 1;

DELETE FROM leituraTemperatura WHERE idLeitura = 7;

-- ---------------------------------------------------------------------------------------------------------------------