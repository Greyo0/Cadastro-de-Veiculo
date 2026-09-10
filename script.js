const form = document.getElementById('formVeiculo');
const selectModelo = document.getElementById('modelo');
const inputPlaca = document.getElementById('placa');
const inputAno = document.getElementById('ano');
const inputCor = document.getElementById('cor');
const lista = document.getElementById('listaVeiculos');
const avisoSemModelo = document.getElementById('avisoSemModelo');


async function carregarModelos() {
    const resposta = await fetch('/api/modelos');

    if (!resposta.ok) {
        throw new Error('Erro ao carregar modelos');
    }

    return await resposta.json();
}


async function popularSelectModelos() {
    try {
        const modelos = await carregarModelos();

        selectModelo.innerHTML =
            '<option value="" disabled selected>Selecione um modelo</option>';

        modelos.forEach(modelo => {
            const opcao = document.createElement('option');

            opcao.value = modelo.id;
            opcao.textContent = modelo.nome;

            selectModelo.appendChild(opcao);
        });

        avisoSemModelo.hidden = modelos.length !== 0;

    } catch (erro) {
        console.error(erro);
    }
}


async function carregarVeiculos() {
    const resposta = await fetch('/api/veiculos');

    if (!resposta.ok) {
        throw new Error('Erro ao carregar veículos');
    }

    return await resposta.json();
}


async function renderizarListaVeiculos() {
    try {
        const veiculos = await carregarVeiculos();

        lista.innerHTML = '';

        if (veiculos.length === 0) {
            const vazio = document.createElement('li');

            vazio.className = 'vazio';
            vazio.textContent = 'Nenhum registro nos arquivos ainda.';

            lista.appendChild(vazio);

            return;
        }

        veiculos.forEach(registro => {
            const item = document.createElement('li');

            const nome = document.createElement('span');

            nome.textContent = registro.modelo;

            const placa = document.createElement('span');

            placa.className = 'placa';
            placa.textContent = registro.placa;

            const ano = document.createElement('span');

            ano.className = 'ano';
            ano.textContent = registro.ano;

            const cor = document.createElement('span');

            cor.className = 'cor';
            cor.textContent = registro.cor;

            item.appendChild(nome);
            item.appendChild(placa);
            item.appendChild(ano);
            item.appendChild(cor);

            lista.appendChild(item);
        });

    } catch (erro) {
        console.error(erro);
    }
}


const regexPlacaAntiga = /^[A-Z]{3}-?\d{4}$/;
const regexPlacaMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/;

function placaValida(placa) {
    return regexPlacaAntiga.test(placa) || regexPlacaMercosul.test(placa);
}

inputPlaca.addEventListener('input', function () {
    inputPlaca.value = inputPlaca.value.toUpperCase();
});

form.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const modeloId = selectModelo.value;
    const placa = inputPlaca.value.trim().toUpperCase();
    const ano = inputAno.value;
    const cor = inputCor.value;

    if (!modeloId || !cor) {
        return;
    }

    if (!placaValida(placa)) {
        alert('Placa inválida. Use o formato ABC-1234 ou ABC1D23 (Mercosul).');
        return;
    }

    const anoAtual = new Date().getFullYear();

    if (!ano || ano < 1900 || ano > anoAtual + 1) {
        alert('Ano inválido.');
        return;
    }

    try {
        const resposta = await fetch('/api/veiculos', {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                modeloId: modeloId,
                placa: placa,
                ano: Number(ano),
                cor: cor
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro);
            return;
        }

        form.reset();

        selectModelo.focus();

        await renderizarListaVeiculos();

    } catch (erro) {
        console.error(erro);

        alert('Erro ao conectar com o servidor.');
    }
});


popularSelectModelos();
renderizarListaVeiculos(); 