const dadosPeriodo = {
    '2seg':{
    horario: ['12:10','12:12','12:14','12:16','12:18','12:20','12:22','12:24'],
    temperatura: [60, 63, 68, 74, 82, 91, 88, 83]
    },
    '1h': {
    horario: ['21:10','21:20','21:30','21:40','21:50','22:00'],
    temperatura: [67,70,71,68,77,80]
    },
    '6h':{
    horario: ['05:00','06:00','07:00','08:00','09:00','10:00'],
    temperatura: [62,70,78,68,83,90]
    },
    '24h':{
    horario: ['00:00','03:00','06:00','09:00','12:00','15:00','18:00','21:00'],
    temperatura: [60, 63, 68, 74, 82, 91, 88, 83]
    },
    '7d':{
    horario: ['22/10','23/10','24/10','25/10','26/10','27/10','28/10'],
    temperatura: [70, 76, 74, 80, 59, 91, 75]
    }    
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
    //Preenche os valores do array 80 = o valor que vai preencher,
    // e 0 é o indice que começa e o array.length o indice que termina
    return [linhaAviso,linhaEmergencia]
}

function trocarPeriodo(periodo){
    let temperatura = dadosPeriodo[periodo].temperatura
    let horario = dadosPeriodo[periodo].horario
    let tamanho = horario.length
    criarLinha(tamanho)
    return[temperatura,horario]
}

const ctx = document.getElementById('grafico-temperatura')
const tempo = document.getElementById('slcttempo')
tempo.addEventListener('change', function() {
    let [novatemperatura,novohorario] = trocarPeriodo(tempo.value)
    let [novalinhaAviso,novalinhaEmergencia] = criarLinha(temperatura.length)
    grafico.data.labels = novohorario
    grafico.data.datasets[0].data
    grafico.data.datasets[1].data
    grafico.data.datasets[2].data
    grafico.update()
});

//grafico base
let [temperatura,horario] = trocarPeriodo(tempo.value)
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