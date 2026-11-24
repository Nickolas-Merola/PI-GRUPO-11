// Funções usadas pelas duas telas da dashboard (dashboard.html e motor.html)

// Faixas de temperatura (as mesmas do backend e da API do Arduino)
// Normal < 80 °C · Aviso 80 a 90 °C · Emergência > 90 °C
const LIMITE_AVISO = 80
const LIMITE_EMERGENCIA = 90

// Metas de operação da MaqTemp
const META_EMERGENCIAS = 0 // nenhum motor em emergência
const META_RISCO = 10      // no máximo 10% em zona de risco (>= 80 °C)

// Régua de temperatura dos cards vai de 40 °C a 100 °C
const ESCALA_MIN = 40
const ESCALA_MAX = 100

// De quanto em quanto tempo a tela busca dados novos (10 segundos)
const INTERVALO_ATUALIZACAO = 10000

const nomeFaixa = {
    'normal': 'Normal',
    'aviso': 'Aviso',
    'emergencia': 'Emergência',
    'sem-leitura': 'Sem leitura'
}

// Sem login não tem como saber de qual empresa são os motores
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

// 1,5 em vez de 1.5 (formato brasileiro)
function formatar(n) {
    return n.toFixed(1).replace('.', ',')
}

function formatarTemp(n) {
    if (n == null) return '--'
    return formatar(n) + ' °C'
}

// Texto "▲ +3 vs. 24h anteriores". Para temperatura e alertas, subir é ruim.
// diferenca: número (positivo, negativo ou zero)
// textoValor: o tamanho da diferença já formatado, sem sinal (ex.: "3" ou "3,1 °C")
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

// Converte uma temperatura na posição (%) da régua de 40 a 100 °C
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

// Cabeçalho: nome da empresa e unidade
function mostrarEmpresa(empresa) {
    if (empresa.nome == '') return
    let texto = empresa.nome
    if (empresa.local != '') {
        texto += ' · ' + empresa.local
    }
    document.getElementById('empresa-local').textContent = texto
}

// "Atualizado às 17:02:01" mostra a hora em que os dados chegaram da API
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

// Evita que um nome com < ou > vire HTML ao usar innerHTML
function textoSeguro(texto) {
    if (texto == null) return ''
    return String(texto).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}
