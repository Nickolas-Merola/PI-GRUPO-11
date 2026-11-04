const horarios = {
    '2seg': ['21:46','21:48','21:50','21:52','21:54','21:56','21:58','22:00'],
    '1h':   ['21:10','21:20','21:30','21:40','21:50','22:00'],
    '6h':   ['17:00','18:00','19:00','20:00','21:00','22:00'],
    '24h':  ['01:00','04:00','07:00','10:00','13:00','16:00','19:00','22:00'],
    '7d':   ['28/10','29/10','30/10','31/10','01/11','02/11','03/11']
}

const temperaturas = {
    1: { '2seg':[59.2,59.8,60.1,59.6,60.3,60.0,60.2,60.4], '1h':[58.4,59.1,59.7,60.5,60.2,60.4], '6h':[57.8,58.9,60.2,59.4,61.0,60.4], '24h':[55.9,54.8,56.3,59.7,63.2,64.0,62.1,60.4], '7d':[61.2,62.5,60.8,63.1,61.9,62.7,60.4] },
    2: { '2seg':[78.1,78.9,79.5,80.6,81.4,82.0,81.1,80.4], '1h':[74.2,76.8,79.1,81.5,82.3,80.4], '6h':[70.5,74.2,78.8,83.1,82.0,80.4], '24h':[62.4,60.8,63.5,69.2,74.6,81.3,82.4,80.4], '7d':[70.1,72.4,76.8,80.9,78.3,82.6,80.4] },
    3: { '2seg':[86.2,88.1,89.5,90.8,92.3,91.6,90.9,90.4], '1h':[81.6,84.9,88.7,91.8,92.6,90.4], '6h':[72.4,79.5,85.3,93.1,89.6,90.4], '24h':[66.1,64.2,70.4,78.9,86.7,94.2,91.3,90.4], '7d':[69.8,74.5,83.2,88.1,92.7,87.4,90.4] }
}

function atualizarRelogio(){
    let dataAtual = new Date()
    let dataAtualFormatada = dataAtual.toLocaleTimeString("pt-BR")//Deixa sua string do horario na formatação do Brasil
    let horario = document.getElementById("relogio")
    horario.textContent = dataAtualFormatada
}
atualizarRelogio()
setInterval(atualizarRelogio,2000)

function criarLinha(tamanho){
    let linhaAviso = new Array(tamanho)
    let linhaEmergencia = new Array(tamanho)
    linhaAviso.fill(80) 
    linhaEmergencia.fill(90)
    return [linhaAviso,linhaEmergencia]
}

// Agora recebe o motor e o período e devolve as temperaturas e os horários certos
function trocarPeriodo(motor, periodo){
    let temperatura = temperaturas[motor][periodo]
    let horario = horarios[periodo]
    return[temperatura,horario]
}

function classificar(t){
    if (t > 90) return 'emergencia'
    if (t >= 80) return 'aviso'
    return 'normal'
}
const ordem = { normal: 0, aviso: 1, emergencia: 2 }
const nomeFaixa = { normal: 'Normal', aviso: 'Aviso', emergencia: 'Emergência' }

// 1,5 em vez de 1.5 (formato brasileiro)
function formatar(n){
    return n.toFixed(1).replace('.', ',')
}

// Calcula as 4 KPIs e a lista de alertas a partir de uma lista de temperaturas
// Alerta = momento em que a temperatura ENTRA numa faixa pior que a anterior
function calcularKpis(lista, horas){
    let soma = 0
    let emRisco = 0
    let eventos = []
    for (let i = 0; i < lista.length; i++){
        soma += lista[i]
        if (lista[i] >= 80) emRisco++
        if (i > 0){
            let atual = classificar(lista[i])
            let anterior = classificar(lista[i - 1])
            if (ordem[atual] > ordem[anterior]){
                eventos.push({ faixa: atual, temp: lista[i], hora: horas[i] })
            }
        }
    }
    return {
        maxima: Math.max(...lista),
        media: soma / lista.length,
        risco: Math.round(emRisco / lista.length * 100),
        eventos: eventos
    }
}

const ctx = document.getElementById('grafico-temperatura')
const tempo = document.getElementById('slcttempo')
const motor = document.getElementById('slct-motor')

// Uma função só que lê os dois selects e atualiza TUDO da tela
function atualizarPainel(){
    let [temperatura,horario] = trocarPeriodo(motor.value, tempo.value)
    let kpis = calcularKpis(temperatura, horario)

    // KPI temperatura máxima
    let faixaMax = classificar(kpis.maxima)
    document.getElementById('kpi-max').textContent = formatar(kpis.maxima) + ' °C'
    let etiquetaMax = document.getElementById('kpi-max-etiqueta')
    etiquetaMax.textContent = nomeFaixa[faixaMax]
    etiquetaMax.className = 'etiqueta ' + faixaMax

    // KPI temperatura média
    document.getElementById('kpi-media').textContent = formatar(kpis.media) + ' °C'

    // KPI número de alertas
    let avisos = kpis.eventos.filter(function(e){ return e.faixa === 'aviso' }).length
    let emergencias = kpis.eventos.filter(function(e){ return e.faixa === 'emergencia' }).length
    document.getElementById('kpi-alertas').textContent = kpis.eventos.length
    document.getElementById('kpi-alertas-detalhe').textContent =
        avisos + (avisos === 1 ? ' aviso' : ' avisos') + ' · ' +
        emergencias + (emergencias === 1 ? ' emergência' : ' emergências')

    // KPI tempo em zona de risco
    document.getElementById('kpi-risco').textContent = kpis.risco + '%'
    document.getElementById('kpi-barra').style.width = kpis.risco + '%'

    // Lista de alertas (o mais recente primeiro)
    let lista = document.getElementById('lista-alertas')
    if (kpis.eventos.length === 0){
        lista.innerHTML = '<li>Nenhum alerta no período</li>'
    } else {
        let html = ''
        for (let i = kpis.eventos.length - 1; i >= 0; i--){
            let e = kpis.eventos[i]
            html += '<li><span class="etiqueta ' + e.faixa + '">' + nomeFaixa[e.faixa] + '</span>' +
                    '<strong>' + formatar(e.temp) + ' °C</strong>' +
                    '<span>Motor ' + motor.value + ' </span>' +
                    '<span class="hora">' + e.hora + '</span></li>'
        }
        lista.innerHTML = html
    }

    // Destaque do motor selecionado na lista lateral
    document.querySelectorAll('.motor').forEach(function(botao){
        if (botao.dataset.motor === motor.value){
            botao.classList.add('selecionado')
        } else {
            botao.classList.remove('selecionado')
        }
    })

    // Gráfico
    let [novalinhaAviso,novalinhaEmergencia] = criarLinha(temperatura.length)
    grafico.data.labels = horario
    grafico.data.datasets[0].data = temperatura
    grafico.data.datasets[1].data = novalinhaAviso
    grafico.data.datasets[2].data = novalinhaEmergencia
    grafico.update()
}

tempo.addEventListener('change', atualizarPainel)
motor.addEventListener('change', atualizarPainel)

// Clicar num motor da lista lateral também troca o motor do select
document.querySelectorAll('.motor').forEach(function(botao){
    botao.addEventListener('click', function(){
        motor.value = botao.dataset.motor
        atualizarPainel()
    })
})

//grafico base
let [temperatura,horario] = trocarPeriodo(motor.value, tempo.value)
let [linhaAviso,linhaEmergencia] = criarLinha(temperatura.length)
const data = {
    labels: horario,
    datasets: [{
        label: 'Temperatura', //Nome
        data: temperatura, //Dado que vai ter
        borderColor: '#4b5f7e', //Cor da linha
        tension: 0.3, //Curvatura das linhas
        pointRadius: 2.5 //Tamanho do ponto de cada dado no grafico
    },{
        label: "Aviso(80 °C)",
        data: linhaAviso,
        borderColor: "#d4a000",
        borderWidth: 1.5, //Espessura da linha
        pointRadius: 0,
        borderDash: [6,4] //Faz a linha ficar tracejada 6px de traço e 4px de espaço entre os tracejados
    },{
        label: "Emergência(90 °C)",
        data: linhaEmergencia,
        borderColor: "#b82a2a",
        borderWidth: 1.5, //Espessura da linha
        pointRadius: 0,
        borderDash: [6,4] 
    }]
}

const config = {
  type: 'line',
  data: data,
  options: {
    maintainAspectRatio:false,
    //Faz com que o tamanho de grafico mude de forma dinamica de acordo com os valores
    //porem como eu marquei false eu determino o limite do grafico embaixo no scales
    scales:{
        y: {
            min: 40,
            max: 100
        }
    }
}
}

const grafico = new Chart(ctx,
    config
)

// Preenche a tela já com o motor e período que vêm selecionados no HTML
atualizarPainel()