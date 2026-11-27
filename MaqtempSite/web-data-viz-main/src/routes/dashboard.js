var express = require("express");
var router = express.Router();

var dashboardController = require("../controllers/dashboardController");

// Unidades que o usuário pode ver (seletor de unidade e cabeçalho)
router.get("/unidades/:idUsuario", function (req, res) {
    dashboardController.buscarUnidades(req, res);
});

// Os 4 KPIs da visão geral de uma unidade
router.get("/kpis/:idUsuario/:idEndereco", function (req, res) {
    dashboardController.buscarKpisGerais(req, res);
});

// Motores de uma unidade com a última leitura
router.get("/motores/:idUsuario/:idEndereco", function (req, res) {
    dashboardController.buscarMotores(req, res);
});

// Dados de um motor (só se ele estiver numa unidade liberada)
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