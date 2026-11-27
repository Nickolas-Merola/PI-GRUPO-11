const LIMITE_AVISO = 80
const LIMITE_EMERGENCIA = 90

const META_EMERGENCIAS = 0
const META_RISCO = 10

const ESCALA_MIN = 40
const ESCALA_MAX = 100

const INTERVALO_ATUALIZACAO = 10000

const nomeFaixa = {
    'normal': 'Normal',
    'aviso': 'Aviso',
    'emergencia': 'Emergência',
    'sem-leitura': 'Sem leitura'
}

function verificarSessao() {
    if (sessionStorage.ID_USUARIO == undefined) {
        window.location = 'login.html'
    }
}

function sair() {
    sessionStorage.clear()
    window.location = 'login.html'
}

function classificar(t) {
    if (t > LIMITE_EMERGENCIA) return 'emergencia'
    if (t >= LIMITE_AVISO) return 'aviso'
    return 'normal'
}

function formatar(n) {
    return n.toFixed(1).replace('.', ',')
}

function formatarTemp(n) {
    if (n == null) return '--'
    return formatar(n) + ' °C'
}

function textoComparacao(diferenca, textoValor, rotuloPeriodo) {
    let textoPeriodo = ' vs. ' + rotuloPeriodo + ' anteriores'
    if (diferenca == 0) {
        return '= igual às ' + rotuloPeriodo + ' anteriores'
    }
    if (diferenca > 0) {
        return '<span class="piorou">▲ +' + textoValor + '</span>' + textoPeriodo
    }
    return '<span class="melhorou">▼ −' + textoValor + '</span>' + textoPeriodo
}

function posicaoNaEscala(t) {
    let posicao = (t - ESCALA_MIN) / (ESCALA_MAX - ESCALA_MIN) * 100
    if (posicao < 0) posicao = 0
    if (posicao > 100) posicao = 100
    return posicao
}

function moverMarcador(idMarcador, temperatura) {
    let marcador = document.getElementById(idMarcador)
    if (temperatura == null) {
        marcador.style.display = 'none'
    } else {
        marcador.style.display = 'block'
        marcador.style.left = posicaoNaEscala(temperatura) + '%'
    }
}

function mostrarEmpresa(dadosUnidade) {
    let texto = dadosUnidade.empresa
    if (dadosUnidade.unidade != null && dadosUnidade.unidade != '') {
        texto += ' · ' + dadosUnidade.unidade
    }
    document.getElementById('empresa-local').textContent = texto
}

function mostrarHoraAtualizacao() {
    let agora = new Date()
    document.getElementById('relogio').textContent = agora.toLocaleTimeString('pt-BR')
}

function mostrarErro(texto) {
    let caixa = document.getElementById('mensagem-erro')
    if (texto == '') {
        caixa.style.display = 'none'
    } else {
        caixa.textContent = texto
        caixa.style.display = 'block'
    }
}

function textoSeguro(texto) {
    if (texto == null) return ''
    return String(texto).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}