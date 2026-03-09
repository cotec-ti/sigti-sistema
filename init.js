const fs = require('fs');

const inicializar = () => {
    const dados = {
        'usuarios.json': [
            { id: 1, nome: "Admin SIGTI", email: "admin@ti.com", matricula: "1001", cargo: "Analista TI", is_ti: true, senha: "123" },
            { id: 2, nome: "Joaquim Silva", email: "user@ti.com", matricula: "2002", cargo: "Assistente Adm", is_ti: false, senha: "123" }
        ],
        'equipamentos.json': [
            { id: 101, nome: "Dell Latitude 3420", codigo: "PAT-001", local: "Estoque TI" },
            { id: 102, nome: "Monitor Samsung 24'", codigo: "PAT-002", local: "Sala 04" },
            { id: 103, nome: "Projetor Epson", codigo: "PAT-003", local: "Auditório" }
        ],
        'solicitacoes.json': [
            { id: 501, usuario_id: 2, usuario: "Joaquim Silva", tipo: "Notebook", descricao: "Uso em home office", status: "pendente", data: "30/01/2026" }
        ],
        'termos.json': []
    };

    Object.entries(dados).forEach(([arquivo, conteudo]) => {
        if (!fs.existsSync(arquivo)) {
            fs.writeFileSync(arquivo, JSON.stringify(conteudo, null, 2));
            console.log(`✅ Arquivo ${arquivo} criado!`);
        }
    });
};

inicializar();
console.log("\n🚀 Sistema populado com sucesso! Agora rode: node server.js");