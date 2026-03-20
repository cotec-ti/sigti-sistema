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
            .eq('password', senhaHash)
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

        document.getElementById('user-name').innerText = usuario.nome;
        document.getElementById('user-role').innerText = usuario.is_ti ? "Administrador TI" : "Colaborador";

        if (usuario.is_ti) {
            document.getElementById('admin-menu').style.display = 'block';
        }

        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('sidebar').style.display = 'flex';
        document.getElementById('app').style.display = 'block';

        if (typeof navegar === "function") {
            navegar('solicitacoes');
        }

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
window.logout = async function() {
    await supabaseClient.auth.signOut();
    localStorage.removeItem('sigti_user');
    location.reload();
}

/* ---------------- CRONOMETRO INATIVIDADE ---------------- */
let tempoInativo;

function resetarCronometro() {
    if (!currentUser) return;

    clearTimeout(tempoInativo);

    tempoInativo = setTimeout(() => {
        alert("Sessão expirada por inatividade.");
        logout();
    }, 90000); // 7 min
}

/* ---------------- DOM CONTENT LOADED ---------------- */
window.addEventListener('DOMContentLoaded', async () => {
    const salvo = localStorage.getItem('sigti_user');

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();

        // Se não houver usuário logado no Supabase, apenas mostra a tela de login
        if (!user) {
            document.getElementById('login-screen').style.display = 'block';
            document.getElementById('sidebar').style.display = 'none';
            document.getElementById('app').style.display = 'none';
            return;
        }

        // Se tiver usuário salvo localmente, restaura sessão
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

    } catch (err) {
        console.error("Erro ao verificar sessão:", err);
        // não faz logout, apenas mostra login
        document.getElementById('login-screen').style.display = 'block';
        document.getElementById('sidebar').style.display = 'none';
        document.getElementById('app').style.display = 'none';
    }
});