var dashboardModel = require("../models/dashboardModel");

// Unidades liberadas para o usuário (seletor de unidade + cabeçalho)
function buscarUnidades(req, res) {
    var idUsuario = req.params.idUsuario;

    dashboardModel.buscarUnidades(idUsuario).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(404).send("Usuário sem unidade liberada!");
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar as unidades.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function buscarKpisGerais(req, res) {
    var idUsuario = req.params.idUsuario;
    var idEndereco = req.params.idEndereco;

    dashboardModel.buscarKpisGerais(idUsuario, idEndereco).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(404).send("Unidade não liberada para este usuário!");
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar os KPIs da visão geral.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function buscarMotores(req, res) {
    var idUsuario = req.params.idUsuario;
    var idEndereco = req.params.idEndereco;

    dashboardModel.buscarMotores(idUsuario, idEndereco).then(function (resultado) {
        res.status(200).json(resultado);
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar os motores.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function periodoValido(horas) {
    return horas == 1 || horas == 6 || horas == 24 || horas == 168;
}

function buscarMotor(req, res) {
    var idUsuario = req.params.idUsuario;
    var idMotor = req.params.idMotor;

    dashboardModel.buscarMotor(idUsuario, idMotor).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(404).send("Motor não encontrado para este usuário!");
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar o motor.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function buscarKpisMotor(req, res) {
    var idUsuario = req.params.idUsuario;
    var idMotor = req.params.idMotor;
    var horas = req.params.horas;

    if (!periodoValido(horas)) {
        res.status(400).send("Período inválido! Use 1, 6, 24 ou 168 horas.");
    } else {
        dashboardModel.buscarKpisMotor(idUsuario, idMotor, horas).then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(404).send("Motor não encontrado para este usuário!");
            }
        }).catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar os KPIs do motor.", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
    }
}

function buscarGrafico(req, res) {
    var idUsuario = req.params.idUsuario;
    var idMotor = req.params.idMotor;
    var horas = req.params.horas;

    if (!periodoValido(horas)) {
        res.status(400).send("Período inválido! Use 1, 6, 24 ou 168 horas.");
    } else {
        var formato = '%H:%i';
        if (horas == 24 || horas == 168) {
            formato = '%d/%m %Hh';
        }

        dashboardModel.buscarGrafico(idUsuario, idMotor, horas, formato).then(function (resultado) {
            res.status(200).json(resultado);
        }).catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar os dados do gráfico.", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
    }
}

function buscarAlertas(req, res) {
    var idUsuario = req.params.idUsuario;
    var idMotor = req.params.idMotor;
    var horas = req.params.horas;

    if (!periodoValido(horas)) {
        res.status(400).send("Período inválido! Use 1, 6, 24 ou 168 horas.");
    } else {
        dashboardModel.buscarAlertas(idUsuario, idMotor, horas).then(function (resultado) {
            res.status(200).json(resultado);
        }).catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar os alertas.", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
    }
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