var express = require("express");
var router = express.Router();

var dashboardController = require("../controllers/dashboardController");

// Nome da empresa
router.get("/empresa/:idUsuario", function (req, res) {
    dashboardController.buscarEmpresa(req, res);
});

// Os 4 KPIs da visão geral
router.get("/kpis/:idUsuario", function (req, res) {
    dashboardController.buscarKpisGerais(req, res);
});

// Motores da empresa com a última leitura
router.get("/motores/:idUsuario", function (req, res) {
    dashboardController.buscarMotores(req, res);
});

module.exports = router;