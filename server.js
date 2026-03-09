const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Funções Auxiliares
const lerDados = (arquivo) => JSON.parse(fs.readFileSync(`./${arquivo}.json`, 'utf-8'));
const salvarDados = (arquivo, dados) => fs.writeFileSync(`./${arquivo}.json`, JSON.stringify(dados, null, 2));

// --- LOGIN ---
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    const usuarios = lerDados('usuarios');
    const user = usuarios.find(u => u.email === email && u.senha === senha);
    user ? res.json(user) : res.status(401).send();
});

// --- GESTÃO DE USUÁRIOS (SAVE 5) ---
app.get('/api/usuarios', (req, res) => {
    const usuarios = lerDados('usuarios');
    res.json(usuarios.map(({ senha, ...u }) => u)); // Oculta senha na listagem
});

app.post('/api/usuarios', (req, res) => {
    const usuarios = lerDados('usuarios');
    const novo = {
    id: parseInt(req.body.matricula) || Date.now(), // Fallback caso a matrícula venha vazia
    nome: req.body.nome,
    email: req.body.email,
    senha: req.body.senha, // Usa a senha enviada 
    cargo: req.body.cargo,
    is_ti: req.body.is_ti
};
    usuarios.push(novo);
    salvarDados('usuarios', usuarios);
    res.status(201).json(novo);
});

// --- ESTOQUE ---
app.get('/api/estoque', (req, res) => {
    let estoque = lerDados('estoque');
    if (req.query.tipo) estoque = estoque.filter(i => i.tipo === req.query.tipo);
    res.json(estoque);
});

app.post('/api/estoque', (req, res) => {
    const estoque = lerDados('estoque');
    estoque.push({ ...req.body, status: 'disponivel' });
    salvarDados('estoque', estoque);
    res.status(201).send();
});

app.patch('/api/estoque/:patrimonio', (req, res) => {
    const estoque = lerDados('estoque');
    const item = estoque.find(i => i.patrimonio === req.params.patrimonio);
    if (item) item.status = req.body.status;
    salvarDados('estoque', estoque);
    res.send();
});

// --- SOLICITAÇÕES (OS) ---
app.get('/api/solicitacoes', (req, res) => {
    const lista = lerDados('solicitacoes');
    const { user_id, is_ti } = req.query;
    res.json(is_ti === 'true' ? lista : lista.filter(s => s.usuario_id == user_id));
});

app.post('/api/solicitacoes', (req, res) => {
    const lista = lerDados('solicitacoes');
    const nova = { id: Date.now(), ...req.body, status: 'pendente' };
    lista.push(nova);
    salvarDados('solicitacoes', lista);
    res.status(201).json(nova);
});

app.patch('/api/solicitacoes/:id', (req, res) => {
    const lista = lerDados('solicitacoes');
    const os = lista.find(s => s.id == req.params.id);
    if (os) os.status = req.body.status;
    salvarDados('solicitacoes', lista);
    res.send();
});

// --- TERMOS ---
app.get('/api/termos', (req, res) => {
    const termos = lerDados('termos');
    const { user_id, is_ti } = req.query;
    res.json(is_ti === 'true' ? termos : termos.filter(t => t.usuario_id == user_id));
});

app.post('/api/termos/gerar', (req, res) => {
    const termos = lerDados('termos');
    const novoTermo = {
        id: Date.now(),
        ...req.body,
        data_geracao: new Date().toLocaleDateString('pt-BR'),
        aceito: false,
        devolvido: false
    };
    termos.push(novoTermo);
    salvarDados('termos', termos);
    res.status(201).json(novoTermo);
});

app.patch('/api/termos/:id/assinar', (req, res) => {
    const termos = lerDados('termos');
    const t = termos.find(x => x.id == req.params.id);
    if (t) t.aceito = true;
    salvarDados('termos', termos);
    res.send();
});

app.patch('/api/termos/:id/devolver', (req, res) => {
    const termos = lerDados('termos');
    const estoque = lerDados('estoque');
    const t = termos.find(x => x.id == req.params.id);
    
    if (t) {
        t.devolvido = true;
        const item = estoque.find(i => i.patrimonio === t.equipamento_cod);
        if (item) item.status = 'disponivel';
        salvarDados('termos', termos);
        salvarDados('estoque', estoque);
    }
    res.send();
});

app.listen(3000, () => console.log("SIGTI Online: http://localhost:3000"));