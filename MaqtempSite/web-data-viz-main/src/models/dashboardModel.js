var database = require("../database/config");

// Regra de acesso: o usuário só vê as unidades liberadas para ele na tabela acesso_unidade.
// Todas as consultas começam por acesso_unidade (a) e seguem: a → enderecos (en) → motores (m).

// Unidades que o usuário pode ver (alimenta o seletor de unidade e o cabeçalho)
function buscarUnidades(idUsuario) {
    var instrucaoSql = `
        SELECT en.idEndereco AS idEndereco,
               e.nome AS empresa,
               en.nomeEndereco AS unidade,
               en.cidade AS cidade,
               a.nivelAcesso AS nivelAcesso
        FROM acesso_unidade a
        JOIN enderecos en ON en.idEndereco = a.fkEndereco
        JOIN empresas e ON e.idEmpresa = en.fkEmpresa
        WHERE a.fkUsuario = ${idUsuario}
        ORDER BY en.idEndereco;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Os 4 KPIs da visão geral de UMA unidade.
// Se o usuário não tem acesso à unidade, o FROM/WHERE não acha linha e a consulta volta vazia (404).
function buscarKpisGerais(idUsuario, idEndereco) {
    var instrucaoSql = `
        SELECT
            (SELECT COUNT(m.idMotor)
               FROM motores m
              WHERE m.fkEndereco = a.fkEndereco
                AND m.statuss = 'Ativo') AS totalMotores,

            (SELECT COUNT(m.idMotor)
               FROM motores m
               JOIN metricas me ON me.idLeitura =
                    (SELECT idLeitura FROM metricas
                      WHERE fkSensor = m.fkSensor
                      ORDER BY dtLeitura DESC LIMIT 1)
              WHERE m.fkEndereco = a.fkEndereco
                AND m.statuss = 'Ativo'
                AND me.situacao = 'Alerta') AS motoresEmergencia,

            (SELECT COUNT(m.idMotor)
               FROM motores m
               JOIN metricas me ON me.idLeitura =
                    (SELECT idLeitura FROM metricas
                      WHERE fkSensor = m.fkSensor
                      ORDER BY dtLeitura DESC LIMIT 1)
              WHERE m.fkEndereco = a.fkEndereco
                AND m.statuss = 'Ativo'
                AND me.situacao = 'Atenção') AS motoresAviso,

            (SELECT me.temperatura
               FROM motores m
               JOIN metricas me ON me.fkSensor = m.fkSensor
              WHERE m.fkEndereco = a.fkEndereco
                AND m.statuss = 'Ativo'
                AND me.dtLeitura >= NOW() - INTERVAL 24 HOUR
              ORDER BY me.temperatura DESC LIMIT 1) AS maiorTemperatura,

            (SELECT m.idMotor
               FROM motores m
               JOIN metricas me ON me.fkSensor = m.fkSensor
              WHERE m.fkEndereco = a.fkEndereco
                AND m.statuss = 'Ativo'
                AND me.dtLeitura >= NOW() - INTERVAL 24 HOUR
              ORDER BY me.temperatura DESC LIMIT 1) AS motorMaisQuente
        FROM acesso_unidade a
        WHERE a.fkUsuario = ${idUsuario}
          AND a.fkEndereco = ${idEndereco};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Motores de UMA unidade com a última leitura de cada um (inclusive os inativos)
function buscarMotores(idUsuario, idEndereco) {
    var instrucaoSql = `
        SELECT m.idMotor AS idMotor,
               m.modeloMotor AS modelo,
               m.statuss AS status,
               en.nomeEndereco AS local,
               me.temperatura AS temperaturaAtual,
               me.situacao AS situacao,
               DATE_FORMAT(me.dtLeitura, '%d/%m %H:%i') AS horaLeitura
        FROM acesso_unidade a
        JOIN enderecos en ON en.idEndereco = a.fkEndereco
        JOIN motores m ON m.fkEndereco = en.idEndereco
        LEFT JOIN metricas me ON me.idLeitura =
             (SELECT idLeitura FROM metricas
               WHERE fkSensor = m.fkSensor
               ORDER BY dtLeitura DESC LIMIT 1)
        WHERE a.fkUsuario = ${idUsuario}
          AND a.fkEndereco = ${idEndereco}
        ORDER BY m.idMotor;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Dados do motor e a última leitura dele (título, etiqueta, "Agora: xx °C").
// idEndereco vai junto para o motor.js saber de qual unidade montar o seletor de motores.
function buscarMotor(idUsuario, idMotor) {
    var instrucaoSql = `
        SELECT m.idMotor AS idMotor,
               m.modeloMotor AS modelo,
               m.potencia AS potencia,
               m.statuss AS status,
               en.idEndereco AS idEndereco,
               en.nomeEndereco AS local,
               en.cidade AS cidade,
               me.temperatura AS temperaturaAtual,
               me.situacao AS situacao,
               DATE_FORMAT(me.dtLeitura, '%d/%m %H:%i') AS horaLeitura
        FROM acesso_unidade a
        JOIN enderecos en ON en.idEndereco = a.fkEndereco
        JOIN motores m ON m.fkEndereco = en.idEndereco
        LEFT JOIN metricas me ON me.idLeitura =
             (SELECT idLeitura FROM metricas
               WHERE fkSensor = m.fkSensor
               ORDER BY dtLeitura DESC LIMIT 1)
        WHERE a.fkUsuario = ${idUsuario}
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
        FROM acesso_unidade a
        JOIN enderecos en ON en.idEndereco = a.fkEndereco
        JOIN motores m ON m.fkEndereco = en.idEndereco
        WHERE a.fkUsuario = ${idUsuario}
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
        FROM acesso_unidade a
        JOIN enderecos en ON en.idEndereco = a.fkEndereco
        JOIN motores m ON m.fkEndereco = en.idEndereco
        JOIN metricas me ON me.fkSensor = m.fkSensor
        WHERE a.fkUsuario = ${idUsuario}
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
        FROM acesso_unidade a
        JOIN enderecos en ON en.idEndereco = a.fkEndereco
        JOIN motores m ON m.fkEndereco = en.idEndereco
        JOIN metricas me ON me.fkSensor = m.fkSensor
        WHERE a.fkUsuario = ${idUsuario}
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
    buscarUnidades,
    buscarKpisGerais,
    buscarMotores,
    buscarMotor,
    buscarKpisMotor,
    buscarGrafico,
    buscarAlertas
};