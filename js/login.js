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
            .eq('password', senhaHash)
            .eq('ativo', true)
            .maybeSingle();

        if (error) throw error;

        if (usuario) {

            // 🔥 LOGIN NO SUPABASE AUTH (OBRIGATÓRIO)
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email: email,
                password: senha
            });

            console.log("AUTH DATA:", authData);
            console.log("AUTH ERROR:", authError);

            if (authError) {
                alert("Erro Auth: " + authError.message);
                return;
            }

            // 🔹 seu sistema continua normal
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

        } else {
            errorMsg.style.display = 'block';
        }

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

async function logout() {
    await supabaseClient.auth.signOut(); // 🔥 ESSENCIAL
    localStorage.removeItem('sigti_user');
    currentUser = null;
    clearTimeout(tempoInativo);
    window.location.reload();
}

let tempoInativo;

function resetarCronometro() {
    if (!currentUser) return;

    clearTimeout(tempoInativo);

    tempoInativo = setTimeout(() => {
        alert("Sessão expirada por inatividade.");
        logout(); // ✔ já chama o logout correto
    }, 900000); // 15 min
}