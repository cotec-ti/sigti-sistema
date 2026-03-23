window.addEventListener('DOMContentLoaded', () => {
    const salvo = localStorage.getItem('sigti_user');

    if (!salvo) return;

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
});