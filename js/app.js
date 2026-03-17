window.addEventListener('DOMContentLoaded', () => {
    // Pega o usuário salvo no localStorage
    const salvo = localStorage.getItem('sigti_user');
    if (salvo) {
        const currentUser = JSON.parse(salvo);

        // Mostra/oculta elementos da interface
        const loginScreen = document.getElementById('login-screen');
        const sidebar = document.getElementById('sidebar');
        const app = document.getElementById('app');
        const userName = document.getElementById('user-name');
        const userRole = document.getElementById('user-role');
        const adminMenu = document.getElementById('admin-menu');

        if (loginScreen) loginScreen.style.display = 'none';
        if (sidebar) sidebar.style.display = 'flex';
        if (app) app.style.display = 'block';
        if (userName) userName.innerText = currentUser.nome;
        if (userRole) userRole.innerText = currentUser.is_ti ? 'Administrador TI' : 'Colaborador';
        if (currentUser.is_ti && adminMenu) adminMenu.style.display = 'block';

        // Navega para solicitações se a função existir
        if (typeof navegar === "function") {
            navegar('solicitacoes', document.querySelector('.nav-item'));
        }
    }
});

// Listener Supabase para atualizações em tempo real
if (typeof supabaseClient !== 'undefined') {
    supabaseClient
      .channel('monitor-geral')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'solicitacoes' }, 
        (payload) => { 
            console.log('Mudança detectada no banco!', payload);

            // Atualiza somente se a aba ativa for solicitações
            if (typeof telaAtiva !== 'undefined' && telaAtiva === 'solicitacoes') {
                console.log('Atualizando lista de solicitações em tempo real...');
                if (typeof renderSolicitacoes === 'function') renderSolicitacoes(); 
            }
        }
      )
      .subscribe();
} else {
    console.warn('supabaseClient não está definido');
}