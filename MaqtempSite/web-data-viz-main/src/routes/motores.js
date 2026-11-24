var express = require("express");
var router = express.Router();

var motorController = require("../controllers/motorController");

// Lista de todos os motores cadastrados da empresa do usuário (seletor da página de detalhe)
router.get("/listar/:idUsuario", function (req, res) {
    motorController.listar(req, res);
});

// Situação atual de todos os motores ativos (página de visão geral)
router.get("/visao-geral/:idUsuario", function (req, res) {
    motorController.visaoGeral(req, res);
});

// Indicadores, gráfico e alertas de um motor (página de detalhe). Aceita ?horas=1|6|24|168
router.get("/detalhe/:idUsuario/:idMotor", function (req, res) {
    motorController.detalhe(req, res);
});

module.exports = router;
