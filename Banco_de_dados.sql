CREATE DATABASE maqtemp;
USE maqtemp;

SHOW TABLES;

-- TABELA DE CADASTRO DOS USUARIOS
CREATE TABLE usuario(
idUsuario INT PRIMARY KEY AUTO_INCREMENT,
NomeCompleto VARCHAR(100) NOT NULL,
email VARCHAR(100) UNIQUE,
cpf VARCHAR(11) NOT NULL UNIQUE,
numero CHAR(13) NOT NULL UNIQUE,
CONSTRAINT chkEmail CHECK (email LIKE '%@%'),
senha VARCHAR(100) NOT NULL,
statuss VARCHAR(10),
CONSTRAINT chkStatus CHECK(statuss IN('Ativo', 'Inativo'))
);

INSERT INTO usuario VALUES
	(default,'Felipe Santos Silva', 'felipe.santos@outlook.com','12345678901', 'Ativo'),
    (default,'Cecilia Fernandes Mendonça', 'cecilia.mendonca@outlook.com','12345678902', 'Ativo'),
    (default, 'Michele Souza Barbosa', 'evangeline.barbosa@outlook.com','12345678903', 'Inativo'),
    (default, 'Marcos Anderson Santiago', 'marcos.santiago@outlook.com','12345678904', 'Ativo');

SELECT * FROM usuario;
UPDATE usuario SET email = 'felipe.silva@outlook.com' WHERE idUsuario = 1;
SELECT CONCAT('Cliente: ', NomeCompleto, ' | E-mail: ', email ) AS Contato FROM usuario;


-- TABELA DE CADASTRO DOS MOTORES QUE SERÃO MONITORADOS
CREATE TABLE motores(
idMotor INT PRIMARY KEY AUTO_INCREMENT,
modeloMotor VARCHAR(100),
potencia DECIMAL(10,2), -- POTÊNCIA EM KW
localizacao VARCHAR(100), -- SETOR QUE O MOTOR ESTÁ NA FABRICA
statuss VARCHAR(10),
CONSTRAINT chkStatusMotor CHECK (statuss IN ('Ativo', 'Inativo'))
);
 
INSERT INTO motores VALUES
	(default, 'WEG W22', 15.00, 'Produção de tintas', 'Ativo'),
    (default, 'WEG W22 Plus', 30.00, 'Mistura de tintas', 'Inativo'),
    (default, 'WEG 22', 15.00, 'Transferência de tintas', 'Ativo');
    
SELECT * FROM motores;
UPDATE motores SET statuss = 'Inativo' WHERE idMotor = 3;
SELECT CONCAT('Motor: ', modeloMotor, ' | Potência: ', potencia, ' KW | Status: ', statuss) AS informaçâo FROM motores;


-- TABELA PARA ARMAZENAR A TEMPERATURA RECEBIDA
CREATE TABLE leituraTemperatura(
idLeitura INT PRIMARY KEY AUTO_INCREMENT,
modeloMotor VARCHAR(100), -- AQUI O CERTO SERIA SER OS MESMOS MODELO DA TABELA ANTERIOR
temperatura DECIMAL (5,2),
dtLeitura DATETIME DEFAULT CURRENT_TIMESTAMP,
situacao VARCHAR(10),
CONSTRAINT chkSituacao CHECK (situacao IN('Normal', 'Atenção', 'Alerta'))
);

INSERT INTO leituraTemperatura (modeloMotor, temperatura, situacao) VALUES
	('WEG W22', 62.50, 'Normal'),
    ('WEG W22 PLUS',85.50, 'Atenção'),
    ('WEG 22', 92.90, 'Alerta');
    
SELECT CONCAT('Motor: ', modeloMotor, ' | Temperatura: ', temperatura, ' ºC') AS leitura FROM leituraTemperatura;


-- 	TABELAS PARA HISTÓRICO DE ALERTAS
CREATE TABLE alertas(
idAlerta INT PRIMARY KEY AUTO_INCREMENT,
modeloMotor VARCHAR(100),
temperatura DECIMAL(5,2),
dtAlerta DATETIME DEFAULT CURRENT_TIMESTAMP,
nivel VARCHAR(10),
CONSTRAINT chkNivel CHECK (nivel IN('Atenção','Alerta')),
statuss VARCHAR(10),
CONSTRAINT chkStatusAlerta CHECK (statuss IN ('Pendente', 'Resolvido')) 
);

INSERT INTO alertas (modeloMotor, temperatura, nivel, statuss) VALUES
	('WEG 22', 92.90, 'Alerta', 'Resolvido'),
    ('WEG W22', 85.50,'Atenção', 'Pendente');
    
SELECT CONCAT('Motor: ', modeloMotor, ' | Temperatura: ', temperatura, ' ºC',' | Nível: ', nivel, ' | Status: ', statuss) AS alerta FROM alertas;