var dashboardModel = require("../models/dashboardModel");

function buscarEmpresa(req, res) {
    var idUsuario = req.params.idUsuario;

    dashboardModel.buscarEmpresa(idUsuario).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(404).send("Usuário sem empresa vinculada!");
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar a empresa.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function buscarKpisGerais(req, res) {
    var idUsuario = req.params.idUsuario;

    dashboardModel.buscarKpisGerais(idUsuario).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(404).send("Usuário não encontrado!");
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar os KPIs da visão geral.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function buscarMotores(req, res) {
    var idUsuario = req.params.idUsuario;
    dashboardModel.buscarMotores(idUsuario).then(function (resultado) {
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
    buscarEmpresa,
    buscarKpisGerais,
    buscarMotores,
    buscarMotor,
    buscarKpisMotor,
    buscarGrafico,
    buscarAlertas
};