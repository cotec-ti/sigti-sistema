

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
            <p style="font-size: 13px; color: #64748b; margin-bottom: 15px;">Será enviado um email para redefinir sua senha.</p>
            
            <div style="display: flex; flex-direction: column; gap: 15px; max-width: 350px;">
                
                <button onclick="atualizarSenhaPerfil()" style="width: fit-content; padding: 10px 30px;">
                    Enviar redefinição de senha
                </button>
            </div>
        </div>
    `;
}
    


      async function atualizarSenhaPerfil() {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("Usuário não logado");
        return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(user.email, {
    redirectTo: "https://cotec-ti.github.io/sigti-sistema/reset.html"

    });

    if (error) {
        alert("Erro: " + error.message);
    } else {
        alert("Email para redefinir senha enviado!");
    }
}
    
