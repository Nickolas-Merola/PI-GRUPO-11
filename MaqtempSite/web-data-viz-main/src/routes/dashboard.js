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

router.get("/motor/:idUsuario/:idMotor", function (req, res) {
    dashboardController.buscarMotor(req, res);
});

// Os 4 KPIs do motor no período (horas = 1, 6, 24 ou 168)
router.get("/kpis-motor/:idUsuario/:idMotor/:horas", function (req, res) {
    dashboardController.buscarKpisMotor(req, res);
});

// Pontos do gráfico de linha (grafico-temperatura)
router.get("/grafico/:idUsuario/:idMotor/:horas", function (req, res) {
    dashboardController.buscarGrafico(req, res);
});

// Lista "Alertas do período"
router.get("/alertas/:idUsuario/:idMotor/:horas", function (req, res) {
    dashboardController.buscarAlertas(req, res);
});

module.exports = router;