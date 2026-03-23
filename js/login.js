async function fazerLogin() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (error) {
            console.error("Erro login:", error);
            alert("Email ou senha inválidos");
            return;
        }

        console.log("LOGIN OK:", data);

        // 🔥 TESTE CRÍTICO
        const { data: { session } } = await supabaseClient.auth.getSession();
        console.log("SESSION APÓS LOGIN:", session);

        if (!session) {
            alert("Login não criou sessão");
            return;
        }

        alert("Login realizado com sucesso!");

        // 👉 carrega perfil
        await carregarUsuario();

        // 👉 entra no sistema
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';

    } catch (err) {
        console.error("Erro geral:", err);
        alert("Erro ao fazer login");
    }
}

async function gerarHash(texto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ✅ LOGOUT SIMPLES (SEM AUTH)
function logout() {
    localStorage.removeItem('sigti_user');
    currentUser = null;
    clearTimeout(tempoInativo);

    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('user-name').innerText = '';
    document.getElementById('user-role').innerText = '';
    document.getElementById('admin-menu').style.display = 'none';
}

let tempoInativo;

function resetarCronometro() {
    if (!currentUser) return;

    clearTimeout(tempoInativo);

    tempoInativo = setTimeout(() => {
        alert("Sessão expirada por inatividade.");
        logout();
    }, 900000); // 15 min
}