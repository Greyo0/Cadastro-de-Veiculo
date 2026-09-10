const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORTA = 3000;

const caminhoBanco = path.join(__dirname, 'banco', 'banco.json');

app.use(express.json());

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'cadastro-veiculo.html'));
});

function carregarBanco() {
    const dados = fs.readFileSync(caminhoBanco, 'utf8');
    return JSON.parse(dados);
}

function salvarBanco(banco) {
    fs.writeFileSync(
        caminhoBanco,
        JSON.stringify(banco, null, 4)
    );
}

app.get('/api/modelos', (req, res) => {
    try {
        const banco = carregarBanco();

        res.json(banco.modelos);
    } catch (erro) {
        res.status(500).json({
            erro: 'Erro ao carregar modelos'
        });
    }
});


app.post('/api/modelos', (req, res) => {
    try {
        const { nome } = req.body;

        if (!nome) {
            return res.status(400).json({
                erro: 'Nome do modelo não informado'
            });
        }

        const banco = carregarBanco();

        const modeloExistente = banco.modelos.find(
            modelo => modelo.nome.toLowerCase() === nome.toLowerCase()
        );

        if (modeloExistente) {
            return res.status(409).json({
                erro: 'Modelo já cadastrado'
            });
        }

        const novoId =
            banco.modelos.length > 0
                ? Math.max(...banco.modelos.map(modelo => modelo.id)) + 1
                : 1;

        const novoModelo = {
            id: novoId,
            nome: nome
        };

        banco.modelos.push(novoModelo);

        salvarBanco(banco);

        res.status(201).json(novoModelo);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: 'Erro ao salvar modelo'
        });
    }
});

app.get('/api/veiculos', (req, res) => {
    try {
        const banco = carregarBanco();

        const veiculos = banco.veiculos.map(veiculo => {
            const modelo = banco.modelos.find(
                modelo => modelo.id === veiculo.modeloId
            );

            return {
                id: veiculo.id,
                modeloId: veiculo.modeloId,
                modelo: modelo ? modelo.nome : 'Modelo não encontrado',
                placa: veiculo.placa,
                ano: veiculo.ano,
                cor: veiculo.cor
            };
        });

        res.json(veiculos);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: 'Erro ao carregar veículos'
        });
    }
});


app.post('/api/veiculos', (req, res) => {
    try {
        const { modeloId, placa, ano, cor } = req.body;

        if (!modeloId || !placa || !ano || !cor) {
            return res.status(400).json({
                erro: 'Modelo, placa, ano e cor são obrigatórios'
            });
        }

        const placaFormatada = placa.trim().toUpperCase();

        const regexPlacaAntiga = /^[A-Z]{3}-?\d{4}$/;
        const regexPlacaMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/;

        if (!regexPlacaAntiga.test(placaFormatada) && !regexPlacaMercosul.test(placaFormatada)) {
            return res.status(400).json({
                erro: 'Placa em formato inválido'
            });
        }

        const anoNumero = Number(ano);
        const anoAtual = new Date().getFullYear();

        if (!Number.isInteger(anoNumero) || anoNumero < 1900 || anoNumero > anoAtual + 1) {
            return res.status(400).json({
                erro: 'Ano inválido'
            });
        }

        const banco = carregarBanco();

        const modelo = banco.modelos.find(
            modelo => modelo.id === Number(modeloId)
        );

        if (!modelo) {
            return res.status(404).json({
                erro: 'Modelo não encontrado'
            });
        }

        const placaExistente = banco.veiculos.find(
            veiculo => veiculo.placa === placaFormatada
        );

        if (placaExistente) {
            return res.status(409).json({
                erro: 'Placa já cadastrada'
            });
        }

        const novoId =
            banco.veiculos.length > 0
                ? Math.max(...banco.veiculos.map(veiculo => veiculo.id)) + 1
                : 1;

        const novoVeiculo = {
            id: novoId,
            modeloId: Number(modeloId),
            placa: placaFormatada,
            ano: anoNumero,
            cor: cor
        };

        banco.veiculos.push(novoVeiculo);

        salvarBanco(banco);

        res.status(201).json({
            id: novoVeiculo.id,
            modeloId: novoVeiculo.modeloId,
            modelo: modelo.nome,
            placa: novoVeiculo.placa,
            ano: novoVeiculo.ano,
            cor: novoVeiculo.cor
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: 'Erro ao salvar veículo'
        });
    }
});


app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});