
window.navegar = function(tela, el) {
    telaAtiva = tela;

    document.querySelectorAll('.nav-item').forEach(item =>
        item.classList.remove('active')
    );

    if (el && el.classList) el.classList.add('active');

    const container = document.getElementById('view-container');
    if (!container) return;

    switch(tela) {
        case 'solicitacoes':
            renderSolicitacoes();
            break;
        case 'estoque':
            renderEstoque();
            break;
        case 'usuarios':
            renderUsuarios();
            break;
        case 'termos':
            renderTermos();
            break;
        case 'historico':
            renderHistorico();
            break;
        case 'perfil':
            if(typeof renderPerfil === "function") renderPerfil();
            break;
    }
};


/*function navegar(tela, el) {
    telaAtiva = tela; // <--- Adicione isso aqui
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    // ... restante do seu código (o switch, etc)

    if (el && el.classList) { el.classList.add('active'); }

    const container = document.getElementById('view-container');
    if (!container) return;

    switch(tela) {
        case 'solicitacoes':
            renderSolicitacoes();
            break;
        case 'estoque':
            renderEstoque();
            break;
        case 'usuarios':
            renderUsuarios();
            break;
        case 'termos':
            renderTermos();
            break;
        case 'historico':
            renderHistorico();
            break;
        case 'perfil': // <--- O "pulo do gato" está aqui
            renderPerfil();
            break;
    }
}*/
