window.addEventListener('DOMContentLoaded', async () => {
    const salvo = localStorage.getItem('sigti_user');

    const { data: { user } } = await supabaseClient.auth.getUser();

    // 🔥 Se não tiver sessão no Supabase → força logout
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

// Realtime (seguro)
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