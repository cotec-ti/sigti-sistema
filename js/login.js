/* ---------------- LOGIN ---------------- */
async function fazerLogin() {
    const email = document.getElementById('log-email').value.trim().toLowerCase();
    const senha = document.getElementById('log-senha').value.trim();
    const errorMsg = document.getElementById('login-error');

    try {
        const senhaHash = await gerarHash(senha);

        // Busca usuário no banco
        const { data: usuario, error } = await supabaseClient
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', senhaHash)   // ✅ corrigido
        .eq('ativo', true)
        .maybeSingle();
        if (error) throw error;

        if (!usuario) {
            errorMsg.style.display = 'block';
            return;
        }

        // LOGIN no Supabase Auth
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (authError) {
            alert("Erro Auth: " + authError.message);
            return;
        }

        // Salva usuário local e atualiza UI
        currentUser = usuario;
        localStorage.setItem('sigti_user', JSON.stringify(usuario));

        mostrarApp();
        navegar('solicitacoes');

    } catch (err) {
        console.error("Erro no Login:", err);
        alert("Erro técnico: " + err.message);
    }
}

/* ---------------- HASH ---------------- */
async function gerarHash(texto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ---------------- LOGOUT ---------------- */
async function logout() {
    await supabaseClient.auth.signOut();
    localStorage.removeItem('sigti_user');
    esconderApp();
}

/* ---------------- CRONOMETRO INATIVIDADE ---------------- */
let tempoInativo;
function resetarCronometro() {
    if (!currentUser) return;

    clearTimeout(tempoInativo);

    tempoInativo = setTimeout(() => {
        alert("Sessão expirada por inatividade.");
        logout();
    }, 900000); // 15 min
}

/* ---------------- MOSTRAR / ESCONDER APP ---------------- */
function mostrarApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('sidebar').style.display = 'flex';
    document.getElementById('app').style.display = 'block';
    document.getElementById('user-name').innerText = currentUser.nome;
    document.getElementById('user-role').innerText = currentUser.is_ti ? 'Administrador TI' : 'Colaborador';

    if (currentUser.is_ti) {
        document.getElementById('admin-menu').style.display = 'block';
    }
}

function esconderApp() {
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('app').style.display = 'none';
}

/* ---------------- DOM CONTENT LOADED ---------------- */
window.addEventListener('DOMContentLoaded', async () => {
    const salvo = localStorage.getItem('sigti_user');

    if (salvo) {
        currentUser = JSON.parse(salvo);

        // Verifica sessão Supabase (opcional)
        try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (!user) {
                // Não faz logout, apenas mostra login
                esconderApp();
                return;
            }
        } catch (err) {
            console.error("Erro ao verificar sessão:", err);
            esconderApp();
            return;
        }

        mostrarApp();
        if (typeof navegar === "function") navegar('solicitacoes');
    } else {
        esconderApp();
    }
});

// Torna logout global para HTML
window.logout = logout;