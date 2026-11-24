var database = require("../database/config");

// Todas as consultas recebem o idUsuario para garantir que o usuário
// só enxergue os motores da empresa dele (usuario.fkEmpresa).

// Empresa do usuário e os endereços (unidades) dela, para o cabeçalho
function buscarEmpresaDoUsuario(idUsuario) {
    var instrucaoSql = `
        SELECT e.nome AS empresa, en.nomeEndereco, en.cidade
        FROM usuario u
        JOIN empresas e ON e.idEmpresa = u.fkEmpresa
        LEFT JOIN enderecos en ON en.fkEmpresa = e.idEmpresa
        WHERE u.idUsuario = ${idUsuario}
        ORDER BY en.idEndereco;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Lista simples de todos os motores cadastrados da empresa (usada no seletor de motor)
function listarPorUsuario(idUsuario) {
    var instrucaoSql = `
        SELECT m.idMotor, m.modeloMotor, m.statuss, en.nomeEndereco, en.cidade
        FROM usuario u
        JOIN enderecos en ON en.fkEmpresa = u.fkEmpresa
        JOIN motores m ON m.fkEndereco = en.idEndereco
        WHERE u.idUsuario = ${idUsuario}
        ORDER BY m.idMotor;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Situação de cada motor para a visão geral:
// - última leitura (temperatura atual e há quantos minutos ela chegou)
// - maior temperatura das últimas 24h
// - temperatura de 24h atrás (última leitura entre 24h30 e 24h atrás), para comparar com ontem
function buscarVisaoGeral(idUsuario) {
    var instrucaoSql = `
        SELECT m.idMotor, m.modeloMotor, m.statuss, m.fkSensor,
               en.nomeEndereco, en.cidade,
               ult.temperatura AS temperaturaAtual,
               DATE_FORMAT(ult.dtLeitura, '%d/%m %H:%i:%s') AS ultimaLeitura,
               TIMESTAMPDIFF(MINUTE, ult.dtLeitura, NOW()) AS minutosDesdeLeitura,
               (SELECT MAX(me.temperatura) FROM metricas me
                 WHERE me.fkSensor = m.fkSensor
                   AND me.dtLeitura >= NOW() - INTERVAL 24 HOUR) AS maxima24h,
               (SELECT me.temperatura FROM metricas me
                 WHERE me.fkSensor = m.fkSensor
                   AND me.dtLeitura <= NOW() - INTERVAL 24 HOUR
                   AND me.dtLeitura > NOW() - INTERVAL 1470 MINUTE
                 ORDER BY me.dtLeitura DESC LIMIT 1) AS temperatura24hAtras
        FROM usuario u
        JOIN enderecos en ON en.fkEmpresa = u.fkEmpresa
        JOIN motores m ON m.fkEndereco = en.idEndereco
        LEFT JOIN metricas ult ON ult.idLeitura =
              (SELECT MAX(me.idLeitura) FROM metricas me WHERE me.fkSensor = m.fkSensor)
        WHERE u.idUsuario = ${idUsuario}
        ORDER BY m.idMotor;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Dados de um motor específico, somente se ele pertencer à empresa do usuário
function buscarMotorDoUsuario(idUsuario, idMotor) {
    var instrucaoSql = `
        SELECT m.idMotor, m.modeloMotor, m.potencia, m.statuss, m.fkSensor,
               en.nomeEndereco, en.cidade,
               ult.temperatura AS temperaturaAtual,
               DATE_FORMAT(ult.dtLeitura, '%d/%m %H:%i:%s') AS ultimaLeitura,
               TIMESTAMPDIFF(MINUTE, ult.dtLeitura, NOW()) AS minutosDesdeLeitura
        FROM usuario u
        JOIN enderecos en ON en.fkEmpresa = u.fkEmpresa
        JOIN motores m ON m.fkEndereco = en.idEndereco
        LEFT JOIN metricas ult ON ult.idLeitura =
              (SELECT MAX(me.idLeitura) FROM metricas me WHERE me.fkSensor = m.fkSensor)
        WHERE u.idUsuario = ${idUsuario} AND m.idMotor = ${idMotor};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Resumo das leituras de um sensor numa janela de tempo.
// horas = tamanho da janela; horasAtras = quanto a janela está deslocada para o passado
// (0 = período atual, igual a "horas" = período anterior, usado no "vs. 24h anteriores")
function buscarResumo(fkSensor, horas, horasAtras, limiteAviso) {
    var instrucaoSql = `
        SELECT MAX(temperatura) AS maxima,
               AVG(temperatura) AS media,
               COUNT(*) AS totalLeituras,
               COALESCE(SUM(temperatura >= ${limiteAviso}), 0) AS leiturasEmRisco
        FROM metricas
        WHERE fkSensor = ${fkSensor}
          AND dtLeitura > NOW() - INTERVAL ${horas + horasAtras} HOUR
          AND dtLeitura <= NOW() - INTERVAL ${horasAtras} HOUR;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Série do gráfico: as leituras são agrupadas em intervalos de "segundosPorGrupo"
// (ex.: 600 = 10 minutos) e de cada intervalo fica a MAIOR temperatura.
// Usar a máxima garante que um pico de temperatura nunca some do gráfico.
function buscarSerie(fkSensor, horas, horasAtras, segundosPorGrupo, formatoHora) {
    var instrucaoSql = `
        SELECT grupo,
               DATE_FORMAT(FROM_UNIXTIME(grupo * ${segundosPorGrupo}), '${formatoHora}') AS hora,
               DATE_FORMAT(FROM_UNIXTIME(grupo * ${segundosPorGrupo}), '%d/%m %H:%i') AS dataHora,
               MAX(temperatura) AS temperatura
        FROM (
            SELECT FLOOR(UNIX_TIMESTAMP(dtLeitura) / ${segundosPorGrupo}) AS grupo, temperatura
            FROM metricas
            WHERE fkSensor = ${fkSensor}
              AND dtLeitura > NOW() - INTERVAL ${horas + horasAtras} HOUR
              AND dtLeitura <= NOW() - INTERVAL ${horasAtras} HOUR
        ) AS leituras
        GROUP BY grupo
        ORDER BY grupo;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarEmpresaDoUsuario,
    listarPorUsuario,
    buscarVisaoGeral,
    buscarMotorDoUsuario,
    buscarResumo,
    buscarSerie
};
