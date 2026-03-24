async function renderUsuarios() {
            const container = document.getElementById('view-container');
            container.innerHTML = `
                <h1>Gestão de Pessoas</h1>
                
                <div class="card">
                    <h3>Novo Acesso</h3>
                    <div class="form-grid">
                        <input type="text" id="u-nome" placeholder="Nome Completo">
                        <input type="number" id="u-mat" placeholder="Matrícula">
                        <input type="email" id="u-email" placeholder="E-mail" autocomplete="new-password">
                        <input type="password" id="u-senha" placeholder="Senha Provisória" autocomplete="new-password">
                        <select id="u-ti">
                            <option value="false">Colaborador</option>
                            <option value="true">TI / Admin</option>
                        </select>
                        <button onclick="salvarUsuario()">Criar Acesso</button>
                    </div>
                </div>

                <div class="card">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; align-items: center; gap: 10px;">
                        <h3 style="margin:0">Lista de Colaboradores</h3>
                        <label style="font-size: 12px; color: #64748b; cursor: pointer;">
                            <input type="checkbox" id="chk-mostrar-inativos" onchange="carregarTabelaUsuarios()"> 
                            Exibir Desativados
                        </label>
                    </div>
                    
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>MAT</th>
                                    <th>Nome</th>
                                    <th>E-mail</th>
                                    <th>Perfil</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="lista-usuarios"></tbody>
                        </table>
                    </div>
                </div>
            `;
            carregarTabelaUsuarios();
        }

        async function salvarUsuario() {
    const n = document.getElementById('u-nome').value.trim();
    const m = document.getElementById('u-mat').value.trim();
    const e = document.getElementById('u-email').value.trim().toLowerCase();
    const s = document.getElementById('u-senha').value.trim();
    const ti = document.getElementById('u-ti').value === "true";

    try {
        // 🔒 VALIDAÇÕES
        if (!n || !m || !e || !s) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        if (!e.includes("@")) {
            alert("Email inválido.");
            return;
        }

        if (s.length < 6) {
            alert("Senha deve ter no mínimo 6 caracteres.");
            return;
        }

        // 🔥 1️⃣ CRIA NO AUTH
        const { data, error: authError } = await supabaseClient.auth.signUp({
            email: e,
            password: s
        });

        if (authError) {
            console.error("Erro Auth:", authError);
            alert("Erro ao criar login: " + authError.message);
            return;
        }

        const user = data.user;

        // 🔐 2️⃣ HASH (se quiser manter)
        const senhaHash = await gerarHash(s);

        // 📦 3️⃣ CRIA NA TABELA
        const { error } = await supabaseClient
            .from('usuarios')
            .insert([{
                id: user.id, // 🔥 ligação com auth
                nome: n,
                matricula: m,
                email: e,
                senha: senhaHash,
                is_ti: ti,
                ativo: true
            }]);

        if (error) throw error;

        alert("Usuário criado com sucesso!");
        renderUsuarios();

    } catch (err) {
        console.error("Erro ao salvar usuário:", err);
        alert("Erro ao salvar usuário: " + err.message);
    }
}

    async function carregarTabelaUsuarios() {
    const mostrarInativos = document.getElementById('chk-mostrar-inativos').checked;
    const tbody = document.getElementById('lista-usuarios');
    
    let query = supabaseClient.from('usuarios').select('*');
    if (!mostrarInativos) query = query.eq('ativo', true);
    
    const { data: lista, error } = await query.order('nome');
    if (error) return;

    tbody.innerHTML = lista.map(u => `
        <tr style="opacity: ${u.ativo ? '1' : '0.6'}">
            <td>${u.matricula || '-'}</td>
            <td>${u.nome}</td>
            <td>${u.email}</td>
            <td>${u.is_ti ? 'TI' : 'Colaborador'}</td>
            <td>
    ${u.ativo ? 
        // Se está ativo, mostra botão de DESATIVAR
        `<button onclick="alternarStatusUsuario('${u.id}', true)" 
                style="background: #fee2e2; color: #991b1b; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">
            Desativar
        </button>` 
        : 
        // Se está inativo, mostra botão de REATIVAR
        `<button onclick="alternarStatusUsuario('${u.id}', false)" 
                style="background: #dcfce7; color: #166534; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">
            Reativar
        </button>`
    }
</td>
        </tr>
    `).join('');
}
async function excluirUsuario(id) {
        // 1. Confirmação
        if (!confirm("Deseja realmente remover este acesso?")) return;

        try {
            console.log("Tentando excluir ID:", id); // Veja isso no F12

            // 2. Executa a atualização no Supabase
            const { error } = await supabaseClient
                .from('usuarios')
                .update({ ativo: false }) // Certifique-se que a coluna chama 'ativo'
                .eq('id', id);

            if (error) {
                console.error("Erro do Supabase:", error);
                alert("Erro no banco: " + error.message);
                return;
            }

            // 3. Sucesso: Feedback e recarregar
            alert("Usuário desativado com sucesso!");
            
            // Use a função que reconstrói a lista para ele sumir da tela
            if (typeof carregarTabelaUsuarios === "function") {
                carregarTabelaUsuarios();
            } else {
                renderUsuarios(); 
            }

        } catch (err) {
            console.error("Erro catastrófico:", err);
            alert("Erro inesperado: " + err.message);
        }
    }
    async function alternarStatusUsuario(id, estaAtivo) {
    const novaSituacao = !estaAtivo; // Inverte: se era true, vai pra false
    const mensagem = novaSituacao ? "reativar" : "desativar";

    if (!confirm(`Deseja realmente ${mensagem} este usuário?`)) return;

    try {
        const { error } = await supabaseClient
            .from('usuarios')
            .update({ ativo: novaSituacao })
            .eq('id', id);

        if (error) throw error;

        alert(`Usuário ${novaSituacao ? 'reativado' : 'desativado'}!`);
        carregarTabelaUsuarios(); // Atualiza a lista na tela
    } catch (err) {
        alert("Erro ao mudar status: " + err.message);
    }
}
/*
    async function alterarSenha(id) {
        const nova = prompt("Nova senha:");
        if (!nova) return;
    
        const hash = await gerarHash(nova);
        const { error } = await supabaseClient
        .from('usuarios')
        .update({ senha: hash })
        .eq('id', id);

    if (error) alert("Erro: " + error.message);
    else alert("Senha alterada!");
}
    */