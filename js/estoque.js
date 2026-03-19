async function renderEstoque() {
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="header-page">
                <h1>Controle de Estoque</h1>
            </div>
            <div class="card">
                <h3 style="margin-bottom:15px">Cadastrar Novo Item</h3>
                <div class="form-grid">
                    <input type="text" id="est-pat" placeholder="Número do Patrimônio">
                    <select id="est-tipo">
                        <option>Notebook</option>
                        <option>Projetor</option>
                        <option>Monitor</option>
                    </select>
                    <input type="text" id="est-mod" placeholder="Modelo / Marca">
                    <button onclick="cadastrarEstoque()">Adicionar ao Banco</button>
                </div>
            </div>
            <div class="card">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr><th>Patrimônio</th><th>Tipo</th><th>Modelo</th><th>Status</th></tr>
                        </thead>
                        <tbody id="lista-estoque"></tbody>
                    </table>
                </div>
            </div>
        `;
        carregarTabelaEstoque();
    }

    async function cadastrarEstoque() {
        const p = document.getElementById('est-pat').value;
        const t = document.getElementById('est-tipo').value;
        const m = document.getElementById('est-mod').value;

        if (!p) return alert("Patrimônio obrigatório.");

        const { error } = await supabaseClient
            .from('estoque')
            .insert([{
                patrimonio: p,
                tipo: t,
                modelo: m,
                status: 'disponivel'
            }]);

        if (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar no banco. Verifique se o patrimônio já existe.");
        } else {
            alert("Item cadastrado!");
            document.getElementById('est-pat').value = '';
            document.getElementById('est-mod').value = '';
            carregarTabelaEstoque();
        }
    } 
async function carregarTabelaEstoque() {
    const { data: dados, error } = await supabaseClient
        .from('estoque')
        .select('*')
        .order('patrimonio', { ascending: true });

    if (error) {
        console.error("Erro ao carregar:", error);
        return;
    }

    const container = document.getElementById('lista-estoque');
    if (!container) return;

    container.innerHTML = dados.map(i => `
        <tr>
            <td>${i.patrimonio}</td>
            <td>${i.tipo}</td>
            <td>${i.modelo || '---'}</td>
            <td>
                <span class="badge status-${i.status === 'disponivel' ? 'aprovado' : 'uso'}">
                    ${i.status}
                </span>
            </td>
        </tr>
    `).join('');
}