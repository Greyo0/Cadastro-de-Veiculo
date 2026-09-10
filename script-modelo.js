const form = document.getElementById('formModelo');
const inputNomeModelo = document.getElementById('nomeModelo');
const lista = document.getElementById('listaModelos');


async function carregarModelos() {
    const resposta = await fetch('/api/modelos');

    if (!resposta.ok) {
        throw new Error('Erro ao carregar modelos');
    }

    return await resposta.json();
}


async function renderizarListaModelos() {
    try {
        const modelos = await carregarModelos();

        lista.innerHTML = '';

        if (modelos.length === 0) {
            const vazio = document.createElement('li');

            vazio.className = 'vazio';
            vazio.textContent = 'Nenhum modelo cadastrado ainda.';

            lista.appendChild(vazio);

            return;
        }

        modelos.forEach(modelo => {
            const item = document.createElement('li');

            item.textContent = modelo.nome;

            lista.appendChild(item);
        });

    } catch (erro) {
        console.error(erro);
    }
}


form.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const nomeModelo = inputNomeModelo.value.trim();

    if (!nomeModelo) {
        return;
    }

    try {
        const resposta = await fetch('/api/modelos', {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                nome: nomeModelo
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro);
            return;
        }

        form.reset();

        inputNomeModelo.focus();

        await renderizarListaModelos();

    } catch (erro) {
        console.error(erro);

        alert('Erro ao conectar com o servidor.');
    }
});


renderizarListaModelos();