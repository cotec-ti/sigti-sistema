
async function fazerLogin() {
    const email = document.getElementById('log-email').value.trim().toLowerCase();
    const senha = document.getElementById('log-senha').value.trim();
    const errorMsg = document.getElementById('login-error');

    try {
        const senhaHash = await gerarHash(senha);

        // verifica se usuário existe no seu DB
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

        // faz login no Supabase Auth
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (authError) {
            alert("Login inválido: " + authError.message);
            return;
        }

        // salva info do usuário
        currentUser = usuario;
        localStorage.setItem('sigti_user', JSON.stringify(usuario));

        document.getElementById('user-name').innerText = usuario.nome;
        document.getElementById('user-role').innerText =
            usuario.is_ti ? "Administrador TI" : "Colaborador";

        if (usuario.is_ti) {
            document.getElementById('admin-menu').style.display = 'block';
        }

        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('sidebar').style.display = 'flex';
        document.getElementById('app').style.display = 'block';

        navegar('solicitacoes');

    } catch (err) {
        console.error("Erro no Login:", err);
        alert("Erro técnico: " + err.message);
    }
}

async function gerarHash(texto) {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function logout() {
    localStorage.removeItem('sigti_user'); 
    window.location.reload();
}

let tempoInativo;

function resetarCronometro() {
    if (!currentUser) return;

    clearTimeout(tempoInativo);

    tempoInativo = setTimeout(() => {
        alert("Sessão expirada por inatividade.");
        logout();
    }, 900000);
}
const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: senha
});

if (error) {
    alert("Login inválido");
    return;
}

// salva se quiser
localStorage.setItem('sigti_user', JSON.stringify({
    nome: "Usuário" // ou o que você já usa
}));