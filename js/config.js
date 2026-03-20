/* ============================================================ 
   CONEXÃO OFICIAL - SIGTI
   ============================================================ */
const SB_URL = 'https://ilyhtxionytobqkerdka.supabase.co';
const SB_KEY = 'sb_publishable_iNHedC8e8Ztp46umNmFEQQ_NV-vq8Kt'; 

var supabaseClient = supabase.createClient(SB_URL, SB_KEY);

window.currentUser = null;

supabaseClient.from('usuarios').select('count', { count: 'exact', head: true })
    .then(res => {
        console.log("Status da Conexão Supabase:", res.error ? "Erro: " + res.error.message : "Conectado com Sucesso!");
    });