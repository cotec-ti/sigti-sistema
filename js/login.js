// login.js

window.currentUser = null; // ⚠️ declaração global única

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

        // Busca no banco customizado (opcional, depende da sua tabela)
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

        // Login no Supabase Auth (obrigatório)
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (authError) {
            alert("Erro Auth: " + authError.message);
            return;
        }

        // Salva usuário global e localStorage
        window.currentUser = usuario;
        localStorage.setItem('sigti_user', JSON.stringify(usuario));

        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('sidebar').style.display = 'flex';
        document.getElementById('app').style.display = 'block';
        document.getElementById('user-name').innerText = usuario.nome;
        document.getElementById('user-role').innerText = usuario.is_ti ? "Administrador TI" : "Colaborador";

        if (usuario.is_ti) {
            document.getElementById('admin-menu').style.display = 'block';
        }

        // Navega para a tela principal
        if (typeof navegar === "function") {
            navegar('solicitacoes');
        }

        resetarCronometro(); // Ativa cronômetro de inatividade

    } catch (err) {
        console.error("Erro no Login:", err);
        alert("Erro técnico: " + err.message);
    }
}

// Logout global
async function logout() {
    await supabaseClient.auth.signOut(); // desloga do Supabase
    localStorage.removeItem('sigti_user'); // limpa usuário local
    window.currentUser = null;
    location.reload(); // recarrega página
}

// Cronômetro de inatividade
let tempoInativo;
function resetarCronometro() {
    if (!currentUser) return;

    clearTimeout(tempoInativo);

    tempoInativo = setTimeout(() => {
        alert("Sessão expirada por inatividade.");
        logout();
    }, 900000); // 15 min
}

// Reseta cronômetro em eventos de interação
['click', 'mousemove', 'keydown'].forEach(ev => {
    window.addEventListener(ev, resetarCronometro);
});

// Ao carregar a página, tenta restaurar sessão
window.addEventListener('DOMContentLoaded', async () => {
    const salvo = localStorage.getItem('sigti_user');
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            logout();
            return;
        }

        if (salvo) {
            window.currentUser = JSON.parse(salvo);

            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('sidebar').style.display = 'flex';
            document.getElementById('app').style.display = 'block';
            document.getElementById('user-name').innerText = currentUser.nome;
            document.getElementById('user-role').innerText = currentUser.is_ti ? 'Administrador TI' : 'Colaborador';

            if (currentUser.is_ti) {
                document.getElementById('admin-menu').style.display = 'block';
            }

            if (typeof navegar === "function") {
                navegar('solicitacoes');
            }

            resetarCronometro();
        }
    } catch (err) {
        console.error("Erro ao restaurar sessão:", err);
        logout();
    }
});