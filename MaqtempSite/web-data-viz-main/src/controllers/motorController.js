var motorModel = require("../models/motorModel");

// Faixas de temperatura (as mesmas usadas pela API de captura do Arduino)
// Normal < 80 °C · Aviso 80 a 90 °C · Emergência > 90 °C
var LIMITE_AVISO = 80;
var LIMITE_EMERGENCIA = 90;

// Se a última leitura de um motor for mais antiga que isso, ele aparece como "Sem leitura"
var MINUTOS_SEM_LEITURA = 30;

// Períodos aceitos na página de detalhe: horas -> tamanho de cada ponto do gráfico
var PERIODOS = {
    1: { segundosPorGrupo: 60, formatoHora: '%H:%i', rotulo: '1h' },
    6: { segundosPorGrupo: 300, formatoHora: '%H:%i', rotulo: '6h' },
    24: { segundosPorGrupo: 600, formatoHora: '%H:%i', rotulo: '24h' },
    168: { segundosPorGrupo: 3600, formatoHora: '%d/%m %Hh', rotulo: '7 dias' }
};

var ordemFaixa = { normal: 0, aviso: 1, emergencia: 2 };

function classificar(temperatura) {
    if (temperatura > LIMITE_EMERGENCIA) return 'emergencia';
    if (temperatura >= LIMITE_AVISO) return 'aviso';
    return 'normal';
}

// O MySQL devolve DECIMAL como texto ("90.40"); aqui viramos número (ou null)
function numero(valor) {
    if (valor == null) return null;
    return Number(valor);
}

// Só aceita ids numéricos inteiros (evita SQL injection nas consultas)
function idValido(valor) {
    return /^[0-9]+$/.test(String(valor));
}

// Situação atual de um motor a partir da última leitura
function situacaoAtual(linha) {
    if (linha.fkSensor == null || linha.temperaturaAtual == null) return 'sem-leitura';
    if (linha.minutosDesdeLeitura > MINUTOS_SEM_LEITURA) return 'sem-leitura';
    return classificar(Number(linha.temperaturaAtual));
}

// Monta o texto do cabeçalho: "Fábrica Matriz · São Paulo" ou "3 unidades"
function montarEmpresa(linhas) {
    if (linhas.length == 0) {
        return { nome: '', local: '' };
    }
    var local = '';
    if (linhas.length == 1 && linhas[0].nomeEndereco != null) {
        local = linhas[0].nomeEndereco + ' · ' + linhas[0].cidade;
    } else if (linhas.length > 1) {
        local = linhas.length + ' unidades';
    }
    return { nome: linhas[0].empresa, local: local };
}

// Alerta = momento em que a temperatura ENTRA numa faixa pior que a anterior
// (Normal -> Aviso, Normal -> Emergência ou Aviso -> Emergência)
function encontrarAlertas(serie, faixaInicial) {
    var alertas = [];
    var anterior = faixaInicial;
    for (var i = 0; i < serie.length; i++) {
        var atual = classificar(serie[i].temperatura);
        if (ordemFaixa[atual] > ordemFaixa[anterior]) {
            alertas.push({
                indice: i,
                faixa: atual,
                temperatura: serie[i].temperatura,
                hora: serie[i].hora,
                dataHora: serie[i].dataHora
            });
        }
        anterior = atual;
    }
    return alertas;
}

function contarFaixa(alertas, faixa) {
    var total = 0;
    for (var i = 0; i < alertas.length; i++) {
        if (alertas[i].faixa == faixa) total++;
    }
    return total;
}

function montarResumo(linha) {
    var total = Number(linha.totalLeituras);
    var risco = null;
    if (total > 0) {
        risco = Math.round(Number(linha.leiturasEmRisco) / total * 100);
    }
    return {
        maxima: numero(linha.maxima),
        media: numero(linha.media),
        totalLeituras: total,
        risco: risco
    };
}

function converterSerie(linhas) {
    var serie = [];
    for (var i = 0; i < linhas.length; i++) {
        serie.push({
            hora: linhas[i].hora,
            dataHora: linhas[i].dataHora,
            temperatura: Number(linhas[i].temperatura)
        });
    }
    return serie;
}

// GET /motores/listar/:idUsuario -> todos os motores cadastrados (para o seletor)
function listar(req, res) {
    var idUsuario = req.params.idUsuario;
    if (!idValido(idUsuario)) {
        return res.status(400).send("idUsuario inválido");
    }

    motorModel.listarPorUsuario(idUsuario).then(function (resultado) {
        var motores = [];
        for (var i = 0; i < resultado.length; i++) {
            motores.push({
                idMotor: resultado[i].idMotor,
                nome: 'Motor ' + resultado[i].idMotor,
                modelo: resultado[i].modeloMotor,
                statuss: resultado[i].statuss,
                local: resultado[i].nomeEndereco
            });
        }
        res.status(200).json(motores);
    }).catch(function (erro) {
        console.log("Houve um erro ao listar os motores.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

// GET /motores/visao-geral/:idUsuario -> situação de todos os motores ativos da empresa
function visaoGeral(req, res) {
    var idUsuario = req.params.idUsuario;
    if (!idValido(idUsuario)) {
        return res.status(400).send("idUsuario inválido");
    }

    Promise.all([
        motorModel.buscarEmpresaDoUsuario(idUsuario),
        motorModel.buscarVisaoGeral(idUsuario)
    ]).then(function (resultados) {
        var linhasEmpresa = resultados[0];
        var linhasMotores = resultados[1];

        if (linhasEmpresa.length == 0) {
            return res.status(404).send("Usuário sem empresa vinculada");
        }

        var motores = [];
        for (var i = 0; i < linhasMotores.length; i++) {
            var linha = linhasMotores[i];

            // Motores inativos não são monitorados na visão geral
            if (linha.statuss != 'Ativo') continue;

            var temperatura24hAtras = numero(linha.temperatura24hAtras);
            var situacao24hAtras = null;
            if (temperatura24hAtras != null) {
                situacao24hAtras = classificar(temperatura24hAtras);
            }

            motores.push({
                idMotor: linha.idMotor,
                nome: 'Motor ' + linha.idMotor,
                modelo: linha.modeloMotor,
                local: linha.nomeEndereco,
                temperaturaAtual: numero(linha.temperaturaAtual),
                ultimaLeitura: linha.ultimaLeitura,
                situacao: situacaoAtual(linha),
                maxima24h: numero(linha.maxima24h),
                situacao24hAtras: situacao24hAtras
            });
        }

        res.status(200).json({
            empresa: montarEmpresa(linhasEmpresa),
            limites: { aviso: LIMITE_AVISO, emergencia: LIMITE_EMERGENCIA },
            minutosSemLeitura: MINUTOS_SEM_LEITURA,
            motores: motores
        });
    }).catch(function (erro) {
        console.log("Houve um erro ao buscar a visão geral.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

// GET /motores/detalhe/:idUsuario/:idMotor?horas=24 -> tudo da página de detalhe de um motor
function detalhe(req, res) {
    var idUsuario = req.params.idUsuario;
    var idMotor = req.params.idMotor;
    var horas = Number(req.query.horas || 24);

    if (!idValido(idUsuario) || !idValido(idMotor)) {
        return res.status(400).send("idUsuario ou idMotor inválido");
    }
    if (PERIODOS[horas] == undefined) {
        return res.status(400).send("Período inválido. Use 1, 6, 24 ou 168 horas.");
    }
    var periodo = PERIODOS[horas];

    Promise.all([
        motorModel.buscarMotorDoUsuario(idUsuario, idMotor),
        motorModel.buscarEmpresaDoUsuario(idUsuario)
    ]).then(function (resultados) {
        var linhasMotor = resultados[0];
        var empresa = montarEmpresa(resultados[1]);

        // Motor inexistente ou de outra empresa
        if (linhasMotor.length == 0) {
            return res.status(404).send("Motor não encontrado");
        }

        var linha = linhasMotor[0];
        var motor = {
            idMotor: linha.idMotor,
            nome: 'Motor ' + linha.idMotor,
            modelo: linha.modeloMotor,
            potencia: numero(linha.potencia),
            statuss: linha.statuss,
            local: linha.nomeEndereco,
            cidade: linha.cidade,
            temperaturaAtual: numero(linha.temperaturaAtual),
            ultimaLeitura: linha.ultimaLeitura,
            situacao: situacaoAtual(linha),
            temSensor: linha.fkSensor != null
        };

        var resposta = {
            empresa: empresa,
            limites: { aviso: LIMITE_AVISO, emergencia: LIMITE_EMERGENCIA },
            periodo: { horas: horas, rotulo: periodo.rotulo },
            motor: motor,
            atual: { maxima: null, media: null, totalLeituras: 0, risco: null, alertas: 0, avisos: 0, emergencias: 0 },
            anterior: { maxima: null, media: null, totalLeituras: 0, risco: null, alertas: 0 },
            serie: [],
            alertas: []
        };

        // Motor sem sensor: não há leituras para buscar
        if (linha.fkSensor == null) {
            return res.status(200).json(resposta);
        }

        var fkSensor = linha.fkSensor;
        return Promise.all([
            motorModel.buscarResumo(fkSensor, horas, 0, LIMITE_AVISO),
            motorModel.buscarResumo(fkSensor, horas, horas, LIMITE_AVISO),
            motorModel.buscarSerie(fkSensor, horas, 0, periodo.segundosPorGrupo, periodo.formatoHora),
            motorModel.buscarSerie(fkSensor, horas, horas, periodo.segundosPorGrupo, periodo.formatoHora)
        ]).then(function (dados) {
            var serieAtual = converterSerie(dados[2]);
            var serieAnterior = converterSerie(dados[3]);

            // Alertas do período anterior (começa considerando faixa normal)
            var alertasAnteriores = encontrarAlertas(serieAnterior, 'normal');

            // O período atual começa na faixa em que o período anterior terminou
            var faixaInicial = 'normal';
            if (serieAnterior.length > 0) {
                faixaInicial = classificar(serieAnterior[serieAnterior.length - 1].temperatura);
            }
            var alertas = encontrarAlertas(serieAtual, faixaInicial);

            resposta.atual = montarResumo(dados[0][0]);
            resposta.atual.alertas = alertas.length;
            resposta.atual.avisos = contarFaixa(alertas, 'aviso');
            resposta.atual.emergencias = contarFaixa(alertas, 'emergencia');

            resposta.anterior = montarResumo(dados[1][0]);
            resposta.anterior.alertas = alertasAnteriores.length;

            resposta.serie = serieAtual;
            resposta.alertas = alertas;

            res.status(200).json(resposta);
        });
    }).catch(function (erro) {
        console.log("Houve um erro ao buscar o detalhe do motor.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

module.exports = {
    listar,
    visaoGeral,
    detalhe
};
