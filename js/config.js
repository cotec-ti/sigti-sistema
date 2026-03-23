/* ============================================================ 
   CONEXÃO OFICIAL - SIGTI
   ============================================================ */
const SB_URL = 'https://ilyhtxionytobqkerdka.supabase.co';
const SB_KEY = 'sb_publishable_iNHedC8e8Ztp46umNmFEQQ_NV-vq8Kt'; 

const supabaseClient = supabase.createClient(URL, KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: localStorage
    }
});

let currentUser = null;

supabaseClient.from('usuarios').select('count', { count: 'exact', head: true })
    .then(res => {
        console.log("Status da Conexão Supabase:", res.error ? "Erro: " + res.error.message : "Conectado com Sucesso!");
    });