CREATE DATABASE maqtemp;
USE maqtemp;

-- ---------------------------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE Locais (
    idLocal INT PRIMARY KEY AUTO_INCREMENT,
    nomeLocal VARCHAR(100) NOT NULL,
    cidade VARCHAR(50),
    cep CHAR(8),
    responsavelLocal VARCHAR(50)
);

INSERT INTO Locais (nomeLocal, cidade, cep, responsavelLocal) VALUES
('Fábrica Matriz', 'São Paulo', '01001000', 'Carlos Gerente');

-- ---------------------------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE empresas (
    idEmpresa INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    idLocal INT,
    cnpj CHAR(14) UNIQUE NOT NULL,
    data_cadastro DATE DEFAULT (CURDATE()),
    idUsuario INT,
    status_contrato VARCHAR(10) NOT NULL,
    CONSTRAINT checkContrato CHECK(status_contrato IN('Ativo','Cancelado')),
    tipo_contrato VARCHAR(20),
    data_pagamento DATE,
    status_pagamento TINYINT NOT NULL,
    CONSTRAINT chkPagamento CHECK(status_pagamento IN(0, 1)),
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
    FOREIGN KEY (idLocal) REFERENCES Locais(idLocal),
    CONSTRAINT chkContrato CHECK(tipo_contrato IN('Semestral','Anual'))
);

-- ---------------------------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE usuario(
    idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    NomeCompleto VARCHAR(100) NOT NULL,
    idLocal INT, 
    email VARCHAR(100) UNIQUE,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    numero VARCHAR(15) NOT NULL UNIQUE,
    dtCadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chkEmail CHECK (email LIKE '%@%'),
    senha VARCHAR(255) NOT NULL,
    statuss VARCHAR(10) DEFAULT 'Ativo',
    CONSTRAINT chkStatus CHECK(statuss IN('Ativo', 'Inativo')),
    FOREIGN KEY (idLocal) REFERENCES Locais(idLocal)
);

INSERT INTO usuario (NomeCompleto, idLocal, email, cpf, numero, senha, statuss) VALUES
('Felipe Santos Silva', 1, 'felipe.santos@outlook.com', '12345678901', '11999998888', 'senha123', 'Ativo'),
('Cecilia Fernandes', 1, 'cecilia.mendonca@outlook.com', '12345678902', '11999997777', 'senha123', 'Ativo');

-- ---------------------------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE motores(
    idMotor INT PRIMARY KEY AUTO_INCREMENT,
    idLocal INT, 
    modeloMotor VARCHAR(100),
    potencia DECIMAL(10,2), 
    localizacao VARCHAR(100), 
    statuss VARCHAR(10),
    CONSTRAINT chkStatusMotor CHECK (statuss IN ('Ativo', 'Inativo')),
    FOREIGN KEY (idLocal) REFERENCES Locais(idLocal)
);
 
INSERT INTO motores (idLocal, modeloMotor, potencia, localizacao, statuss) VALUES
(1, 'WEG W22', 15.00, 'Produção de tintas', 'Ativo'),
(1, 'WEG W22 Plus', 30.00, 'Mistura de tintas', 'Inativo'),
(1, 'WEG 22', 15.00, 'Transferência de tintas', 'Ativo');
    
-- -------------------------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE leituraTemperatura(
    idLeitura INT PRIMARY KEY AUTO_INCREMENT,
    idMotor INT,
    temperatura DECIMAL (5,2),
    dtLeitura DATETIME DEFAULT CURRENT_TIMESTAMP,
    situacao VARCHAR(10),
    CONSTRAINT chkSituacao CHECK (situacao IN('Normal', 'Atenção', 'Alerta')),
    FOREIGN KEY (idMotor) REFERENCES motores(idMotor)
);

INSERT INTO leituraTemperatura (idMotor, temperatura, situacao) VALUES
(1, 62.50, 'Normal'),
(2, 85.50, 'Atenção'),
(3, 92.90, 'Alerta');
    
-- -------------------------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE alertas(
    idAlerta INT PRIMARY KEY AUTO_INCREMENT,
    idLeitura INT,
    idMotor INT,
    idLocal INT, 
    idUsuarioResponsavel INT, 
    dtAlerta DATETIME DEFAULT CURRENT_TIMESTAMP,
    nivel VARCHAR(10),
    dataResolucao DATETIME,
    observacao VARCHAR(255),
    CONSTRAINT chkNivel CHECK (nivel IN('Atenção','Alerta')),
    statuss VARCHAR(10),
    CONSTRAINT chkStatusAlerta CHECK (statuss IN ('Pendente', 'Resolvido')),
    
    FOREIGN KEY (idLeitura) REFERENCES leituraTemperatura(idLeitura),
    FOREIGN KEY (idMotor) REFERENCES motores(idMotor),
    FOREIGN KEY (idUsuarioResponsavel) REFERENCES usuario(idUsuario), 
    FOREIGN KEY (idLocal) REFERENCES Locais(idLocal)
);
INSERT INTO alertas (idLeitura, idMotor, idLocal, nivel, statuss) VALUES
(3, 3, 1, 'Alerta', 'Resolvido'),
(2, 2, 1, 'Atenção', 'Pendente');

-- ---------------------------------------------------------------------------------------------------------------------------------------------------

SELECT 
    a.idAlerta,
    l.nomeLocal,
    m.modeloMotor, 
    lt.temperatura, 
    a.nivel, 
    a.statuss AS status_alerta
FROM alertas AS a
JOIN motores AS m ON a.idMotor = m.idMotor
JOIN leituraTemperatura AS lt ON a.idLeitura = lt.idLeitura
JOIN Locais AS l ON a.idLocal = l.idLocal;