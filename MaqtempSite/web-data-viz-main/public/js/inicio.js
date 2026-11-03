// Demonstração local: nenhum sensor é consultado.
const painel = document.querySelector('.painel-demo');
const cenarios = document.querySelectorAll('[data-temperatura]');
function classificarTemperatura(temperatura) {
    if (temperatura > 90) return { estado: 'emergencia', nome: 'Emergência', descricao: 'Acima de 90 °C: situação crítica na simulação do protótipo.' };
    if (temperatura >= 80) return { estado: 'aviso', nome: 'Aviso', descricao: 'Entre 80 e 90 °C: a leitura entrou na faixa de atenção.' };
    return { estado: 'normal', nome: 'Normal', descricao: 'Temperatura abaixo da faixa de aviso do protótipo.' };
}
cenarios.forEach((botao) => {
    botao.addEventListener('click', () => {
        const temperatura = Number(botao.dataset.temperatura);
        const status = classificarTemperatura(temperatura);
        painel.dataset.estado = status.estado;
        document.getElementById('demo-temperatura').textContent = temperatura;
        document.getElementById('demo-status').textContent = `● ${status.nome}`;
        document.getElementById('demo-descricao').textContent = status.descricao;
        painel.querySelector('.escala-demo span').style.width = `${Math.min(100, temperatura / 110 * 100)}%`;
        cenarios.forEach((item) => item.setAttribute('aria-pressed', String(item === botao)));
    });
});

// Valida e copia a mensagem; não envia nem armazena dados.
const formulario = document.getElementById('form-contato');
formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const nome = formulario.elements.nome;
    const mensagem = formulario.elements.mensagem;
    nome.setCustomValidity(nome.value.trim() ? '' : 'Digite seu nome.');
    mensagem.setCustomValidity(mensagem.value.trim().length >= 10 ? '' : 'Escreva uma mensagem com pelo menos 10 caracteres.');
    if (!formulario.reportValidity()) return;
    const texto = `Nome: ${nome.value.trim()}\nE-mail: ${formulario.elements.email.value.trim()}\n\n${mensagem.value.trim()}`;
    const feedback = document.getElementById('contato-feedback');
    const copiaManual = document.getElementById('copia-manual');
    try {
        await navigator.clipboard.writeText(texto);
        copiaManual.hidden = true;
        feedback.textContent = 'Mensagem copiada! Cole no canal de contato que preferir. Nenhuma mensagem foi enviada pelo site.';
    } catch {
        copiaManual.hidden = false;
        const pronta = document.getElementById('mensagem-pronta');
        pronta.value = texto;
        pronta.focus();
        pronta.select();
        feedback.textContent = 'Não foi possível copiar automaticamente. O texto está selecionado abaixo: use Ctrl + C ou a opção Copiar do seu dispositivo.';
    }
});
formulario.addEventListener('input', (evento) => {
    if (typeof evento.target.setCustomValidity === 'function') evento.target.setCustomValidity('');
    document.getElementById('contato-feedback').textContent = '';
    document.getElementById('copia-manual').hidden = true;
    document.getElementById('mensagem-pronta').value = '';
});