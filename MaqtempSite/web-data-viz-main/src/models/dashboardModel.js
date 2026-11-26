var database = require("../database/config");

function buscarEmpresa(idUsuario) {
    var instrucaoSql = `
        SELECT e.nome AS empresa,
               en.nomeEndereco AS unidade,
               en.cidade AS cidade
        FROM usuario u
        JOIN empresas e ON e.idEmpresa = u.fkEmpresa
        JOIN enderecos en ON en.fkEmpresa = e.idEmpresa
        WHERE u.idUsuario = ${idUsuario};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarKpisGerais(idUsuario) {
    var instrucaoSql = `
        SELECT
            (SELECT COUNT(m.idMotor)
               FROM motores m
               JOIN enderecos en ON en.idEndereco = m.fkEndereco
              WHERE en.fkEmpresa = u.fkEmpresa
                AND m.statuss = 'Ativo') AS totalMotores,

            (SELECT COUNT(m.idMotor)
               FROM motores m
               JOIN enderecos en ON en.idEndereco = m.fkEndereco
               JOIN metricas me ON me.idLeitura =
                    (SELECT idLeitura FROM metricas
                      WHERE fkSensor = m.fkSensor
                      ORDER BY dtLeitura DESC LIMIT 1)
              WHERE en.fkEmpresa = u.fkEmpresa
                AND m.statuss = 'Ativo'
                AND me.situacao = 'Alerta') AS motoresEmergencia,

            (SELECT COUNT(m.idMotor)
               FROM motores m
               JOIN enderecos en ON en.idEndereco = m.fkEndereco
               JOIN metricas me ON me.idLeitura =
                    (SELECT idLeitura FROM metricas
                      WHERE fkSensor = m.fkSensor
                      ORDER BY dtLeitura DESC LIMIT 1)
              WHERE en.fkEmpresa = u.fkEmpresa
                AND m.statuss = 'Ativo'
                AND me.situacao = 'Atenção') AS motoresAviso,

            (SELECT me.temperatura
               FROM motores m
               JOIN enderecos en ON en.idEndereco = m.fkEndereco
               JOIN metricas me ON me.fkSensor = m.fkSensor
              WHERE en.fkEmpresa = u.fkEmpresa
                AND m.statuss = 'Ativo'
                AND me.dtLeitura >= NOW() - INTERVAL 24 HOUR
              ORDER BY me.temperatura DESC LIMIT 1) AS maiorTemperatura,

            (SELECT m.idMotor
               FROM motores m
               JOIN enderecos en ON en.idEndereco = m.fkEndereco
               JOIN metricas me ON me.fkSensor = m.fkSensor
              WHERE en.fkEmpresa = u.fkEmpresa
                AND m.statuss = 'Ativo'
                AND me.dtLeitura >= NOW() - INTERVAL 24 HOUR
              ORDER BY me.temperatura DESC LIMIT 1) AS motorMaisQuente
        FROM usuario u
        WHERE u.idUsuario = ${idUsuario};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarMotores(idUsuario) {
    var instrucaoSql = `
        SELECT m.idMotor AS idMotor,
               m.modeloMotor AS modelo,
               m.statuss AS status,
               en.nomeEndereco AS local,
               me.temperatura AS temperaturaAtual,
               me.situacao AS situacao,
               DATE_FORMAT(me.dtLeitura, '%d/%m %H:%i') AS horaLeitura
        FROM usuario u
        JOIN enderecos en ON en.fkEmpresa = u.fkEmpresa
        JOIN motores m ON m.fkEndereco = en.idEndereco
        LEFT JOIN metricas me ON me.idLeitura =
             (SELECT idLeitura FROM metricas
               WHERE fkSensor = m.fkSensor
               ORDER BY dtLeitura DESC LIMIT 1)
        WHERE u.idUsuario = ${idUsuario}
        ORDER BY m.idMotor;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Dados do motor e a última leitura dele (título, etiqueta, "Agora: xx °C")
function buscarMotor(idUsuario, idMotor) {
    var instrucaoSql = `
        SELECT m.idMotor AS idMotor,
               m.modeloMotor AS modelo,
               m.potencia AS potencia,
               m.statuss AS status,
               en.nomeEndereco AS local,
               en.cidade AS cidade,
               me.temperatura AS temperaturaAtual,
               me.situacao AS situacao,
               DATE_FORMAT(me.dtLeitura, '%d/%m %H:%i') AS horaLeitura
        FROM usuario u
        JOIN enderecos en ON en.fkEmpresa = u.fkEmpresa
        JOIN motores m ON m.fkEndereco = en.idEndereco
        LEFT JOIN metricas me ON me.idLeitura =
             (SELECT idLeitura FROM metricas
               WHERE fkSensor = m.fkSensor
               ORDER BY dtLeitura DESC LIMIT 1)
        WHERE u.idUsuario = ${idUsuario}
          AND m.idMotor = ${idMotor};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Os 4 KPIs do motor no período escolhido (horas), numa linha só
function buscarKpisMotor(idUsuario, idMotor, horas) {
    var instrucaoSql = `
        SELECT
            (SELECT MAX(me.temperatura) FROM metricas me
              WHERE me.fkSensor = m.fkSensor
                AND me.dtLeitura >= NOW() - INTERVAL ${horas} HOUR) AS maxima,

            (SELECT ROUND(AVG(me.temperatura), 1) FROM metricas me
              WHERE me.fkSensor = m.fkSensor
                AND me.dtLeitura >= NOW() - INTERVAL ${horas} HOUR) AS media,

            (SELECT COUNT(me.idLeitura) FROM metricas me
              WHERE me.fkSensor = m.fkSensor
                AND me.dtLeitura >= NOW() - INTERVAL ${horas} HOUR) AS totalLeituras,

            (SELECT COUNT(me.idLeitura) FROM metricas me
              WHERE me.fkSensor = m.fkSensor
                AND me.dtLeitura >= NOW() - INTERVAL ${horas} HOUR
                AND me.situacao = 'Atenção') AS avisos,

            (SELECT COUNT(me.idLeitura) FROM metricas me
              WHERE me.fkSensor = m.fkSensor
                AND me.dtLeitura >= NOW() - INTERVAL ${horas} HOUR
                AND me.situacao = 'Alerta') AS emergencias
        FROM usuario u
        JOIN enderecos en ON en.fkEmpresa = u.fkEmpresa
        JOIN motores m ON m.fkEndereco = en.idEndereco
        WHERE u.idUsuario = ${idUsuario}
          AND m.idMotor = ${idMotor};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Pontos do gráfico de linha: as leituras são agrupadas pelo horário formatado
function buscarGrafico(idUsuario, idMotor, horas, formato) {
    var instrucaoSql = `
        SELECT DATE_FORMAT(me.dtLeitura, '${formato}') AS horario,
               MAX(me.temperatura) AS temperatura
        FROM usuario u
        JOIN enderecos en ON en.fkEmpresa = u.fkEmpresa
        JOIN motores m ON m.fkEndereco = en.idEndereco
        JOIN metricas me ON me.fkSensor = m.fkSensor
        WHERE u.idUsuario = ${idUsuario}
          AND m.idMotor = ${idMotor}
          AND me.dtLeitura >= NOW() - INTERVAL ${horas} HOUR
        GROUP BY horario
        ORDER BY MIN(me.dtLeitura);
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Lista "Alertas do período": as 10 leituras mais recentes fora da faixa normal
function buscarAlertas(idUsuario, idMotor, horas) {
    var instrucaoSql = `
        SELECT DATE_FORMAT(me.dtLeitura, '%d/%m %H:%i') AS horario,
               me.temperatura AS temperatura,
               me.situacao AS situacao
        FROM usuario u
        JOIN enderecos en ON en.fkEmpresa = u.fkEmpresa
        JOIN motores m ON m.fkEndereco = en.idEndereco
        JOIN metricas me ON me.fkSensor = m.fkSensor
        WHERE u.idUsuario = ${idUsuario}
          AND m.idMotor = ${idMotor}
          AND me.dtLeitura >= NOW() - INTERVAL ${horas} HOUR
          AND me.situacao <> 'Normal'
        ORDER BY me.dtLeitura DESC
        LIMIT 10;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarEmpresa,
    buscarKpisGerais,
    buscarMotores,
    buscarMotor,
    buscarKpisMotor,
    buscarGrafico,
    buscarAlertas
};