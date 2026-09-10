const form = document.getElementById('formVeiculo');
const selectModelo = document.getElementById('modelo');
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

            const cor = document.createElement('span');

            cor.className = 'cor';
            cor.textContent = registro.cor;

            item.appendChild(nome);
            item.appendChild(cor);

            lista.appendChild(item);
        });

    } catch (erro) {
        console.error(erro);
    }
}


form.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const modeloId = selectModelo.value;
    const cor = inputCor.value;

    if (!modeloId || !cor) {
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