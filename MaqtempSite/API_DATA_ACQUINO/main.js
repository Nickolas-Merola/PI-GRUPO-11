// importa as bibliotecas necessárias
const serialport = require('serialport');
const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

// constantes para configurações
const SERIAL_BAUD_RATE = 9600;
const SERVIDOR_PORTA = 3300;

const senha = process.env.SENHA;
const user = process.env.USERAPI;

// habilita ou desabilita a inserção de dados no banco de dados
const HABILITAR_OPERACAO_INSERIR = true;

// true: gera dados falsos, sem precisar do Arduino (modo treino)
// false: lê os dados reais do Arduino pela porta serial
const HABILITAR_SENSORES_SIMULADOS = false;

const ACRESCIMO_POR_SENSOR = 10;

// faixas usadas nos KPIs (as mesmas do dashboard)
const LIMITE_AVISO = 80;
const LIMITE_EMERGENCIA = 90;

// pool único, compartilhado pela leitura serial E pelo servidor (KPIs)
const poolBancoDados = mysql.createPool({
    host: '127.0.0.1',
    user: user,
    password: senha,
    database: 'maqtemp',
    port: 3307
}).promise();

const classificarTemperatura = (temperatura) => {
    if (temperatura >= 18 && temperatura <= 27) {
        return 'Normal';
    }
    if ((temperatura >= 15 && temperatura < 18) || (temperatura > 27 && temperatura <= 32)) {
        return 'Atenção';
    }
    return 'Alerta';
};

// função para comunicação serial
const serial = async (valoresLm35) => {

    // trata uma linha no formato "digital;analogico", vinda do Arduino ou do simulador
    const tratarLinha = async (data) => {
        try {
            console.log(data);
            const valores = data.split(';');
            // pega o último valor da linha: funciona com "24.53" (Arduino) e "0;24.53" (simulador)
            const lm35 = parseFloat(valores[valores.length - 1]);

            valoresLm35.push(lm35);

            if (HABILITAR_OPERACAO_INSERIR) {
                const [linhas] = await poolBancoDados.execute(
                    `SELECT COUNT(idSensor) AS total FROM sensores`
                );
                // no contexto real você usaria o select com where para pegar o sensor daquele usuário
                const total = linhas[0].total;

                for (let contador = 1; contador <= total; contador++) {
                    const temperatura = lm35 + (contador - 1) * ACRESCIMO_POR_SENSOR;
                    const situacao = classificarTemperatura(temperatura);

                    await poolBancoDados.execute(
                        'INSERT INTO leituraTemperatura (fkSensor,fkMotor,temperatura,situacao) VALUES (?,?,?,?)',
                        [contador, contador, temperatura, situacao]
                    );
                    console.log(`Sensor ${contador} | ${temperatura.toFixed(2)} ºC | ${situacao}`);
                }
            }
        } catch (erro) {
            // sem isso, um erro de banco derruba o Node inteiro
            console.error('Erro ao tratar linha:', erro.message);
        }
    };

    // modo simulado: gera uma linha por segundo, no mesmo formato que o Arduino envia
    if (HABILITAR_SENSORES_SIMULADOS) {
        console.log('*** MODO SIMULADO: os dados são falsos, o Arduino NÃO está sendo lido ***');
        setInterval(() => {
            const tcrt5000 = Math.round(Math.random());
            const lm35 = (18 + Math.random() * 4).toFixed(2);
            tratarLinha(`${tcrt5000};${lm35}`);
        }, 1000);
        return;
    }

    // lista as portas seriais disponíveis e procura pelo Arduino
    const portas = await serialport.SerialPort.list();
    const portaArduino = portas.find((p) => p.vendorId == 2341 && p.productId == 43);
    if (!portaArduino) {
        throw new Error('O arduino não foi encontrado em nenhuma porta serial');
    }

    const arduino = new serialport.SerialPort({
        path: portaArduino.path,
        baudRate: SERIAL_BAUD_RATE
    });

    arduino.on('open', () => {
        console.log(`A leitura do arduino foi iniciada na porta ${portaArduino.path} utilizando Baud Rate de ${SERIAL_BAUD_RATE}`);
    });

    arduino.pipe(new serialport.ReadlineParser({ delimiter: '\r\n' })).on('data', tratarLinha);

    arduino.on('error', (mensagem) => {
        console.error(`Erro no arduino (Mensagem: ${mensagem})`);
    });
};

// função para criar e configurar o servidor web
const servidor = (valoresLm35) => {
    const app = express();

    app.use((request, response, next) => {
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
        next();
    });

    app.listen(SERVIDOR_PORTA, () => {
        console.log(`API executada com sucesso na porta ${SERVIDOR_PORTA}`);
    });

    // leituras em tempo real (vem da memória, alimenta o gráfico)
    app.get('/sensores/lm35', (_, response) => {
        return response.json(valoresLm35);
    });

    // KPIs de um motor (vêm do banco, alimentam os cards)
    app.get('/kpis/:motor', async (request, response) => {
        const motor = parseInt(request.params.motor);
        try {
            const [linhas] = await poolBancoDados.execute(
                `SELECT
                    MAX(temperatura)                         AS maxima,
                    AVG(temperatura)                         AS media,
                    COALESCE(SUM(temperatura > ?), 0)        AS alertas,
                    COALESCE(ROUND(100 * SUM(temperatura >= ?) / COUNT(*)), 0) AS risco,
                    COUNT(*)                                 AS total
                 FROM leituraTemperatura
                 WHERE fkMotor = ?`,
                [LIMITE_EMERGENCIA, LIMITE_AVISO, motor]
            );

            const k = linhas[0];
            return response.json({
                maxima: k.maxima === null ? null : Number(k.maxima),
                media: k.media === null ? null : Number(k.media),
                alertas: Number(k.alertas),
                risco: Number(k.risco),
                total: Number(k.total)
            });
        } catch (erro) {
            console.error('Erro ao buscar KPIs:', erro.message);
            return response.status(500).json({ erro: 'falha ao consultar o banco' });
        }
    });
};

(async () => {
    const valoresLm35 = [];
    await serial(valoresLm35);
    servidor(valoresLm35);
})();