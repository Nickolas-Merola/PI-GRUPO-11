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

module.exports = {
    buscarEmpresa,
    buscarKpisGerais,
    buscarMotores
};