const veiculosRegistrados = [];

const form = document.getElementById('formVeiculo');
const inputVeiculo = document.getElementById('veiculo');
const inputCor = document.getElementById('cor');
const lista = document.getElementById('listaVeiculos');

function renderizarLista() {
  lista.innerHTML = '';

  if (veiculosRegistrados.length === 0) {
    const vazio = document.createElement('li');
    vazio.className = 'vazio';
    vazio.textContent = 'Nenhum registro nos arquivos ainda.';
    lista.appendChild(vazio);
    return;
  }

  veiculosRegistrados.forEach((registro) => {
    const item = document.createElement('li');

    const nome = document.createElement('span');
    nome.textContent = registro.veiculo;

    const cor = document.createElement('span');
    cor.className = 'cor';
    cor.textContent = registro.cor;

    item.appendChild(nome);
    item.appendChild(cor);
    lista.appendChild(item);
  });
}

form.addEventListener('submit', function (evento) {
  evento.preventDefault();

  const veiculo = inputVeiculo.value.trim();
  const cor = inputCor.value.trim();

  if (!veiculo || !cor) return;

  veiculosRegistrados.push({ veiculo, cor });
  renderizarLista();

  form.reset();
  inputVeiculo.focus();
});

renderizarLista();