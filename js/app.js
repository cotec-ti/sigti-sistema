window.addEventListener('DOMContentLoaded', async () => {
    const salvo = localStorage.getItem('sigti_user');
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        logout();
        return;
    }

    if (salvo) {
        currentUser = JSON.parse(salvo);

        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('sidebar').style.display = 'flex';
        document.getElementById('app').style.display = 'block';
        document.getElementById('user-name').innerText = currentUser.nome;
        document.getElementById('user-role').innerText = currentUser.is_ti ? 'Administrador TI' : 'Colaborador';

        if (currentUser.is_ti) {
            document.getElementById('admin-menu').style.display = 'block';
        }

        if (typeof navegar === "function") {
            navegar('solicitacoes', document.querySelector('.nav-item'));
        }
    }
});

// Realtime
if (typeof supabaseClient !== 'undefined') {
    supabaseClient
      .channel('monitor-geral')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'solicitacoes' }, 
        () => { 
            if (telaAtiva === 'solicitacoes' && typeof renderSolicitacoes === 'function') {
                renderSolicitacoes(); 
            }
        }
      )
      .subscribe();
}

// ESC global
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (typeof fecharModal === "function") {
            fecharModal();
        }
    }
});

window.addEventListener('DOMContentLoaded', async () => {
    const hash = window.location.hash;

    if (hash && hash.includes('access_token')) {
        // 🔥 usuário veio do reset de senha
        const nova = prompt("Digite a nova senha:");

        if (!nova || nova.length < 6) {
            alert("Senha inválida");
            return;
        }

        const { error } = await supabaseClient.auth.updateUser({
            password: nova
        });

        if (error) {
            alert("Erro ao redefinir senha: " + error.message);
        } else {
            alert("Senha redefinida com sucesso!");
            window.location.hash = "";
        }
    }
});
window.addEventListener('DOMContentLoaded', async () => {
    const hash = window.location.hash;

    if (hash && hash.includes('access_token')) {
        const nova = prompt("Digite a nova senha:");

        if (!nova || nova.length < 6) {
            alert("Senha inválida");
            return;
        }

        const { error } = await supabaseClient.auth.updateUser({
            password: nova
        });

        if (error) {
            alert("Erro: " + error.message);
        } else {
            alert("Senha redefinida com sucesso!");
            window.location.hash = "";
        }
    }
});

window.addEventListener('DOMContentLoaded', async () => {
    const hash = window.location.hash;

    if (hash && hash.includes('access_token')) {
        const nova = prompt("Digite a nova senha:");

        if (!nova || nova.length < 6) {
            alert("Senha inválida");
            return;
        }

        const { error } = await supabaseClient.auth.updateUser({
            password: nova
        });

        if (error) {
            alert("Erro: " + error.message);
        } else {
            alert("Senha redefinida com sucesso!");
            window.location.href = "/sigti-sistema/";
        }
    }
});