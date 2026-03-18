/* ============================================================
   CONEXÃO SUPABASE
   ============================================================ */
const SB_URL = 'https://ilyhtxionytobqkerdka.supabase.co';
const SB_KEY = 'sb_publishable_iNHedC8e8Ztp46umNmFEQQ_NV-vq8Kt';
var supabaseClient = supabase.createClient(SB_URL, SB_KEY);

/* ============================================================
   VARIÁVEL GLOBAL DE SESSÃO
   ============================================================ */
let currentUser = null;
let telaAtiva = null;

/* ============================================================
   INICIALIZAÇÃO AO CARREGAR A PÁGINA
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
    const salvo = localStorage.getItem('sigti_user');
    if (salvo) {
        currentUser = JSON.parse(salvo);

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

        // Navega para a aba inicial
        if (typeof navegar === "function") {
            navegar('solicitacoes', document.querySelector('.nav-item'));
        }
    } else {
        console.warn("Nenhum usuário logado!");
    }
});

/* ============================================================
   FUNÇÃO DE NAVEGAÇÃO ENTRE TELAS
   ============================================================ */
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
            if(typeof renderSolicitacoes === "function") renderSolicitacoes();
            break;
        case 'estoque':
            if(typeof renderEstoque === "function") renderEstoque();
            break;
        case 'usuarios':
            if(typeof renderUsuarios === "function") renderUsuarios();
            break;
        case 'termos':
            if(typeof renderTermos === "function") renderTermos();
            break;
        case 'historico':
            if(typeof renderHistorico === "function") renderHistorico();
            break;
        case 'perfil':
            if(typeof renderPerfil === "function") renderPerfil();
            break;
    }
};

/* ============================================================
   MONITORAMENTO EM TEMPO REAL (SUPABASE)
   ============================================================ */
if (typeof supabaseClient !== 'undefined') {
    supabaseClient
      .channel('monitor-geral')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'solicitacoes' },
        (payload) => {
            console.log('Mudança detectada no banco!', payload);

            // Atualiza somente se a aba ativa for solicitações
            if (telaAtiva === 'solicitacoes' && typeof renderSolicitacoes === 'function') {
                renderSolicitacoes();
            }
        }
      )
      .subscribe();
} else {
    console.warn('supabaseClient não está definido');
}

/* ============================================================
   FUNÇÕES DE RENDER SEGUROS
   ============================================================ */

// Exemplo renderPerfil seguro
async function renderPerfil() {
    const container = document.getElementById('view-container');
    if (!container) return;
    if (!currentUser) {
        container.innerHTML = `<p>Erro: nenhum usuário logado.</p>`;
        return;
    }

    container.innerHTML = `
        <h1>Meu Perfil</h1>
        <p>Nome: ${currentUser.nome}</p>
        <p>Função: ${currentUser.is_ti ? 'Administrador TI' : 'Colaborador'}</p>
        <p>Email: ${currentUser.email || ''}</p>
    `;
}

// Exemplo renderTermos seguro
async function renderTermos() {
    const container = document.getElementById('view-container');
    if (!container) return;
    if (!currentUser) {
        container.innerHTML = `<p>Erro: nenhum usuário logado.</p>`;
        return;
    }

    let query = supabaseClient.from('termos').select('*');
    if (!currentUser.is_ti) query = query.eq('usuario_id', currentUser.id);

    const { data: lista, error } = await query.order('created_at', { ascending: false });
    if (error) return console.error("Erro Supabase:", error);

    container.innerHTML = `
        <h1>Meus Termos e Documentos</h1>
        <table>
            <thead>
                <tr><th>#</th><th>Tipo</th><th>Data</th><th>Ações</th></tr>
            </thead>
            <tbody>
                ${lista && lista.length > 0 ? lista.map(t => `
                    <tr>
                        <td>#${t.solicitacao_id}</td>
                        <td>${t.tipo}</td>
                        <td>${t.data_geracao}</td>
                        <td><button onclick="visualizarTermo('${t.id}')">📄 Visualizar</button></td>
                    </tr>
                `).join('') : '<tr><td colspan="4">Nenhum documento encontrado.</td></tr>'}
            </tbody>
        </table>
    `;
}