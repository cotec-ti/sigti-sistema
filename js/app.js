// 🔥 RESET DE SENHA (TEM QUE SER O PRIMEIRO)
window.addEventListener('DOMContentLoaded', async () => {
    const hash = window.location.hash;

    if (hash && hash.includes('access_token')) {
        console.log('RESET DETECTADO');

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

            // limpa hash
            window.location.hash = "";

            // recarrega limpo
            window.location.reload();
        }

        return; // ⛔ impede o resto de rodar durante reset
    }

    // 🔐 FLUXO NORMAL DO SISTEMA
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


// 🔄 REALTIME
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


// ⌨️ ESC GLOBAL
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (typeof fecharModal === "function") {
            fecharModal();
        }
    }
});