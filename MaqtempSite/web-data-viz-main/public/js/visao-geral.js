// Tela de visão geral da planta (dashboard.html)
// Busca na API a situação de todos os motores da empresa do usuário e monta
// os 4 indicadores, o mapa de quadrados e a lista dos mais críticos.

verificarSessao()

const idUsuario = sessionStorage.ID_USUARIO
const QUANTIDADE_CRITICOS = 5

let motores = []          // última resposta da API
let filtroAtual = 'todos' // chip selecionado
let mostrarTodosCriticos = false

function buscarVisaoGeral() {
    fetch('/motores/visao-geral/' + idUsuario, { cache: 'no-store' })
        .then(function (resposta) {
            if (resposta.ok) {
                resposta.json().then(function (dados) {
                    mostrarErro('')
                    motores = dados.motores
                    mostrarEmpresa(dados.empresa)
                    atualizarTela()
                    mostrarHoraAtualizacao()
                })
            } else if (resposta.status == 404) {
                mostrarErro('Seu usuário não está vinculado a nenhuma empresa. Fale com o responsável pela conta.')
            } else {
                mostrarErro('Não foi possível buscar os dados dos motores. Tentando de novo em instantes...')
            }
        })
        .catch(function (erro) {
            console.error('Erro ao buscar a visão geral:', erro)
            mostrarErro('Sem conexão com o servidor. Tentando de novo em instantes...')
        })
}

// Conta quantos motores estão em cada situação
function contarSituacoes(lista, campo) {
    let contagem = { 'normal': 0, 'aviso': 0, 'emergencia': 0, 'sem-leitura': 0 }
    for (let i = 0; i < lista.length; i++) {
        let situacao = lista[i][campo]
        if (situacao != null) {
            contagem[situacao]++
        }
    }
    return contagem
}

// Existe pelo menos um motor com leitura de 24h atrás para comparar?
function temDados24hAtras() {
    for (let i = 0; i < motores.length; i++) {
        if (motores[i].situacao24hAtras != null) return true
    }
    return false
}

function atualizarTela() {
    let total = motores.length
    let agora = contarSituacoes(motores, 'situacao')
    let ontem = contarSituacoes(motores, 'situacao24hAtras')
    let comparar = temDados24hAtras()

    document.getElementById('total-motores').textContent = total

    // ----- KPI 1: motores em emergência -----
    let kpiEmergencia = document.getElementById('kpi-emergencia')
    kpiEmergencia.textContent = agora.emergencia
    kpiEmergencia.className = agora.emergencia > META_EMERGENCIAS ? 'texto-emergencia' : 'texto-normal'
    document.getElementById('kpi-emergencia-total').textContent = 'de ' + total
    let textoEmergencia = 'Meta: ' + META_EMERGENCIAS
    if (comparar) {
        let diferenca = agora.emergencia - ontem.emergencia
        textoEmergencia += ' · ' + textoComparacao(diferenca, Math.abs(diferenca), '24h')
    }
    document.getElementById('kpi-emergencia-detalhe').innerHTML = textoEmergencia

    // ----- KPI 2: frota em zona de risco (>= 80 °C) -----
    let emRisco = agora.aviso + agora.emergencia
    let porcentagem = 0
    if (total > 0) {
        porcentagem = Math.round(emRisco / total * 100)
    }
    let kpiRisco = document.getElementById('kpi-risco')
    kpiRisco.textContent = porcentagem + '%'
    if (emRisco == 0) {
        kpiRisco.className = 'texto-normal'
    } else if (porcentagem <= META_RISCO) {
        kpiRisco.className = 'texto-aviso'
    } else {
        kpiRisco.className = 'texto-emergencia'
    }
    document.getElementById('kpi-risco-total').textContent = emRisco + ' de ' + total
    document.getElementById('kpi-risco-barra').style.width = porcentagem + '%'

    // ----- KPI 3: alertas ativos (motores em aviso ou emergência agora) -----
    document.getElementById('kpi-alertas').textContent = emRisco
    let textoAlertas = agora.emergencia + ' emergência · ' + agora.aviso + ' aviso'
    if (comparar) {
        let diferenca = emRisco - (ontem.aviso + ontem.emergencia)
        textoAlertas += ' · ' + textoComparacao(diferenca, Math.abs(diferenca), '24h')
    }
    document.getElementById('kpi-alertas-detalhe').innerHTML = textoAlertas

    // ----- KPI 4: maior temperatura das últimas 24h -----
    let motorMaisQuente = null
    for (let i = 0; i < motores.length; i++) {
        if (motores[i].maxima24h != null) {
            if (motorMaisQuente == null || motores[i].maxima24h > motorMaisQuente.maxima24h) {
                motorMaisQuente = motores[i]
            }
        }
    }
    let kpiMaxima = document.getElementById('kpi-maxima')
    let detalheMaxima = document.getElementById('kpi-maxima-detalhe')
    if (motorMaisQuente == null) {
        kpiMaxima.textContent = '--'
        kpiMaxima.className = 'texto-sem-leitura'
        detalheMaxima.textContent = 'Nenhuma leitura nas últimas 24h'
        moverMarcador('kpi-maxima-marcador', null)
    } else {
        let maxima = motorMaisQuente.maxima24h
        kpiMaxima.textContent = formatarTemp(maxima)
        kpiMaxima.className = 'texto-' + classificar(maxima)
        let texto = textoSeguro(motorMaisQuente.nome) + ' · '
        if (maxima > LIMITE_EMERGENCIA) {
            texto += formatarTemp(maxima - LIMITE_EMERGENCIA) + ' acima do limite (' + LIMITE_EMERGENCIA + ' °C)'
        } else if (maxima >= LIMITE_AVISO) {
            texto += 'em faixa de aviso, ' + formatarTemp(LIMITE_EMERGENCIA - maxima) + ' abaixo do limite'
        } else {
            texto += 'dentro da faixa normal (< ' + LIMITE_AVISO + ' °C)'
        }
        detalheMaxima.innerHTML = texto
        moverMarcador('kpi-maxima-marcador', maxima)
    }

    // ----- Contadores dos chips -----
    document.getElementById('conta-todos').textContent = total
    document.getElementById('conta-normal').textContent = agora.normal
    document.getElementById('conta-aviso').textContent = agora.aviso
    document.getElementById('conta-emergencia').textContent = agora.emergencia
    document.getElementById('conta-sem-leitura').textContent = agora['sem-leitura']

    document.getElementById('nota-mapa').textContent =
        'Cada quadrado é um motor (' + total + ' no total). Passe o mouse para ver nome e temperatura; ' +
        'clique para abrir o detalhe. Contorno laranja = motor selecionado.'

    desenharGrade()
    desenharCriticos()
}

// Texto do balãozinho que aparece ao passar o mouse no quadrado
function textoDica(motor) {
    if (motor.situacao == 'sem-leitura') {
        if (motor.ultimaLeitura == null) return motor.nome + ' · sem leitura'
        return motor.nome + ' · sem leitura desde ' + motor.ultimaLeitura
    }
    return motor.nome + ' · ' + formatarTemp(motor.temperaturaAtual) + ' · ' + nomeFaixa[motor.situacao]
}

function passaNaBusca(motor, termo) {
    if (termo == '') return true
    let texto = (motor.nome + ' ' + motor.modelo + ' ' + motor.local).toLowerCase()
    return texto.includes(termo)
}

function desenharGrade() {
    let termo = document.getElementById('busca').value.trim().toLowerCase()
    let selecionado = sessionStorage.MOTOR_SELECIONADO
    let html = ''

    for (let i = 0; i < motores.length; i++) {
        let motor = motores[i]
        if (filtroAtual != 'todos' && motor.situacao != filtroAtual) continue
        if (!passaNaBusca(motor, termo)) continue

        let classes = 'quadrado ' + motor.situacao
        if (String(motor.idMotor) == selecionado) {
            classes += ' selecionado'
        }
        let dica = textoSeguro(textoDica(motor))
        html += `<a class="${classes}" href="motor.html?id=${motor.idMotor}" data-dica="${dica}" aria-label="${dica}"></a>`
    }

    if (html == '') {
        html = '<p class="vazio">Nenhum motor encontrado com esse filtro.</p>'
    }
    document.getElementById('grade-motores').innerHTML = html
}

function desenharCriticos() {
    // Só entram motores em aviso ou emergência, do mais quente para o mais frio
    let criticos = []
    for (let i = 0; i < motores.length; i++) {
        if (motores[i].situacao == 'aviso' || motores[i].situacao == 'emergencia') {
            criticos.push(motores[i])
        }
    }
    criticos.sort(function (a, b) {
        return b.temperaturaAtual - a.temperaturaAtual
    })

    let lista = document.getElementById('lista-criticos')
    let botao = document.getElementById('ver-todos')

    if (criticos.length == 0) {
        lista.innerHTML = '<li><p class="vazio">Nenhum motor em zona de risco agora.</p></li>'
        botao.style.display = 'none'
        return
    }

    let quantidade = criticos.length
    if (!mostrarTodosCriticos && quantidade > QUANTIDADE_CRITICOS) {
        quantidade = QUANTIDADE_CRITICOS
    }

    let html = ''
    for (let i = 0; i < quantidade; i++) {
        let motor = criticos[i]
        html += `<li><a class="item" href="motor.html?id=${motor.idMotor}">
                    <span class="etiqueta ${motor.situacao}">${nomeFaixa[motor.situacao]}</span>
                    <span class="item-nome">${textoSeguro(motor.nome)}</span>
                    <span class="item-temp texto-${motor.situacao}">${formatarTemp(motor.temperaturaAtual)}</span>
                 </a></li>`
    }
    lista.innerHTML = html

    if (criticos.length > QUANTIDADE_CRITICOS) {
        botao.style.display = 'block'
        if (mostrarTodosCriticos) {
            botao.textContent = 'Mostrar só os ' + QUANTIDADE_CRITICOS + ' mais críticos ‹'
        } else {
            botao.textContent = 'Ver todos os ' + criticos.length + ' motores em risco ›'
        }
    } else {
        botao.style.display = 'none'
    }
}

// ----- Eventos -----
document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
        filtroAtual = chip.dataset.filtro
        document.querySelectorAll('.chip').forEach(function (outro) {
            outro.classList.remove('ativo')
        })
        chip.classList.add('ativo')
        desenharGrade()
    })
})

document.getElementById('busca').addEventListener('input', desenharGrade)

document.getElementById('ver-todos').addEventListener('click', function () {
    mostrarTodosCriticos = !mostrarTodosCriticos
    desenharCriticos()
})

buscarVisaoGeral()
setInterval(buscarVisaoGeral, INTERVALO_ATUALIZACAO)
