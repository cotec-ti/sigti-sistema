let currentUser = null;
let tempoInativo;

// 🔹 FUNÇÃO DE HASH (SHA-256)
async function gerarHash(texto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// 🔹 FUNÇÃO DE LOGIN
async function fazerLogin() {
    const email = document.getElementById('log-email').value.trim().toLowerCase();
    const senha = document.getElementById('log-senha').value.trim();
    const errorMsg = document.getElementById('login-error');

    try {
        const senhaHash = await gerarHash(senha);

        // 1️⃣ Busca na tabela usuarios
        const { data: usuario, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('senha', senhaHash)  // ✅ coluna correta
            .eq('ativo', true)
            .maybeSingle();

        if (error) throw error;

        if (!usuario) {
            errorMsg.style.display = 'block';
            return;
        }

        // 2️⃣ LOGIN NO SUPABASE AUTH
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (authError) {
            alert("Erro Auth: " + authError.message);
            return;
        }

        // 3️⃣ LOGIN LOCAL
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

        navegar('solicitacoes');

        // 🔹 Inicia cronômetro de inatividade
        resetarCronometro();

    } catch (err) {
        console.error("Erro no Login:", err);
        alert("Erro técnico: " + err.message);
    }
}

// 🔹 LOGOUT
async function logout() {
    await supabaseClient.auth.signOut(); // desloga do Supabase
    localStorage.removeItem('sigti_user'); // limpa usuário local
    location.reload(); // recarrega página
}

// 🔹 CRONÔMETRO DE INATIVIDADE (15min)
function resetarCronometro() {
    if (!currentUser) return;

    clearTimeout(tempoInativo);
    tempoInativo = setTimeout(() => {
        alert("Sessão expirada por inatividade.");
        logout();
    }, 900000); // 15 min
}

// 🔹 ONLOAD: verifica sessão e carrega usuário
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

        resetarCronometro();
    }
});

// 🔹 Torna logout global para botão
window.logout = logout;