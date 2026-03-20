// login.js
window.currentUser = null; // torna global
let tempoInativo;

// HASH opcional, se quiser manter a senha criptografada
async function gerarHash(texto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function fazerLogin() {
    const email = document.getElementById('log-email').value.trim().toLowerCase();
    const senha = document.getElementById('log-senha').value.trim();
    const errorMsg = document.getElementById('login-error');

    try {
        const senhaHash = await gerarHash(senha);

        const { data: usuario, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('senha', senhaHash)
            .eq('ativo', true)
            .maybeSingle();

        if (error) throw error;
        if (!usuario) { errorMsg.style.display = 'block'; return; }

        // 🔹 LOGIN SUPABASE AUTH
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (authError) { alert("Erro Auth: " + authError.message); return; }

        // 🔹 LOGIN LOCAL
        window.currentUser = usuario;
        localStorage.setItem('sigti_user', JSON.stringify(usuario));

        document.getElementById('user-name').innerText = usuario.nome;
        document.getElementById('user-role').innerText = usuario.is_ti ? "Administrador TI" : "Colaborador";

        if (usuario.is_ti) document.getElementById('admin-menu').style.display = 'block';

        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('sidebar').style.display = 'flex';
        document.getElementById('app').style.display = 'block';

        navegar('solicitacoes');

        resetarCronometro();

    } catch (err) {
        console.error("Erro no Login:", err);
        alert("Erro técnico: " + err.message);
    }
}

// 🔹 LOGOUT
async function logout() {
    await supabaseClient.auth.signOut();
    localStorage.removeItem('sigti_user');
    location.reload();
}
window.logout = logout; // torna global para botões

// 🔹 CRONÔMETRO DE INATIVIDADE
function resetarCronometro() {
    if (!window.currentUser) return;
    clearTimeout(tempoInativo);
    tempoInativo = setTimeout(() => {
        alert("Sessão expirada por inatividade.");
        logout();
    }, 900000);
}

// 🔹 ONLOAD
window.addEventListener('DOMContentLoaded', async () => {
    const salvo = localStorage.getItem('sigti_user');
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) { logout(); return; }

    if (salvo) {
        window.currentUser = JSON.parse(salvo);
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('sidebar').style.display = 'flex';
        document.getElementById('app').style.display = 'block';
        document.getElementById('user-name').innerText = window.currentUser.nome;
        document.getElementById('user-role').innerText = window.currentUser.is_ti ? 'Administrador TI' : 'Colaborador';
        if (window.currentUser.is_ti) document.getElementById('admin-menu').style.display = 'block';
        if (typeof navegar === "function") navegar('solicitacoes');
        resetarCronometro();
    }
});