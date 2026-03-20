
async function renderPerfil() {
    const container = document.getElementById('view-container');
    
    container.innerHTML = `
        <h1>Meu Perfil</h1>
        
        <div class="card" style="max-width: 600px !important;">
            <div style="display: flex !important; align-items: center; gap: 20px; margin-bottom: 25px;">
                <div style="width: 70px; height: 70px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold;">
                    ${currentUser.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 style="margin:0">${currentUser.nome}</h2>
                    <p style="margin:0; color: #64748b;">${currentUser.is_ti ? 'Equipe de TI / Administrador' : 'Colaborador'}</p>
                </div>
            </div>

        <div class="form-grid" style="grid-template-columns: 1fr 1fr !important;">
                <div>
                    <label style="font-size: 12px; color: #64748b;">Matrícula</label>
                    <input type="text" value="${currentUser.matricula}" disabled style="background: #f1f5f9;">
                </div>
                <div>
                    <label style="font-size: 12px; color: #64748b;">E-mail</label>
                    <input type="text" value="${currentUser.email}" disabled style="background: #f1f5f9;">
                </div>
            </div>

            <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e2e8f0;">

            <h3>Alterar Senha</h3>
            <p style="font-size: 13px; color: #64748b; margin-bottom: 15px;">Deseja atualizar sua senha de acesso? Preencha os campos abaixo.</p>
            
            <div style="display: flex; flex-direction: column; gap: 15px; max-width: 350px;">
                <input type="password" id="p-senha-nova" placeholder="Nova Senha (mín. 6 dígitos)">
                <input type="password" id="p-senha-confirma" placeholder="Confirme a Nova Senha">
                <button onclick="atualizarSenhaPerfil()" style="width: fit-content; padding: 10px 30px;">Atualizar Senha</button>
            </div>
        </div>
    `;
}

      async function atualizarSenhaPerfil() {
    const nova = document.getElementById('p-senha-nova').value.trim();
    const confirma = document.getElementById('p-senha-confirma').value.trim();

    if (nova.length < 6) return alert("Mínimo 6 caracteres.");
    if (nova !== confirma) return alert("Senhas não coincidem.");

    try {
        const novaHash = await gerarHash(nova);
        
        // 🔍 TESTE 1: Ver o que tem dentro do currentUser no console
        console.log("DEBUG - Dados do Usuário Logado:", currentUser);

        if (!currentUser || !currentUser.email) {
            alert("Sessão perdida. Por favor, saia e entre novamente no sistema.");
            return;
        }

        const emailBusca = currentUser.email.trim().toLowerCase();

        // 🔍 TESTE 2: Tentar atualizar usando o ID e o EMAIL ao mesmo tempo (um dos dois deve bater)
        const { data, error } = await supabaseClient
            .from('usuarios')
            .update({ senha: novaHash })
            .or(`id.eq.${currentUser.id},email.eq.${emailBusca}`) 
            .select();

        if (error) throw error;

        if (data && data.length > 0) {
            alert("SENHA ATUALIZADA COM SUCESSO!");
            
            // Atualiza localmente
            currentUser.senha = novaHash;
            localStorage.setItem('sigti_user', JSON.stringify(currentUser));

            document.getElementById('p-senha-nova').value = '';
            document.getElementById('p-senha-confirma').value = '';
        } else {
            // 🔍 TESTE 3: Se falhou, vamos listar no console o que o banco tem
            const { data: todos } = await supabaseClient.from('usuarios').select('email, id').limit(5);
            console.log("DEBUG - Primeiros e-mails no banco:", todos);
            
            alert("Ainda não encontrou. Verifique o F12 (Console) para ver os dados técnicos.");
        }

    } catch (err) {
        console.error("Erro técnico detalhado:", err);
        alert("Erro: " + err.message);
    }
}
