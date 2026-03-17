async function renderHistorico() {
    const container = document.getElementById('view-container');

    // Busca no Supabase todas as movimentações
    const { data: dados, error } = await supabaseClient
        .from('termos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return console.error(error);

    container.innerHTML = `
        <div class="header-page"><h1>Auditoria de Empréstimos</h1></div>
        <div class="card">
            <div class="table-container">
                <table>
                    <thead><tr><th>Usuário</th><th>Patrimônio</th><th>Status</th><th>Ação</th></tr></thead>
                    <tbody>
                        ${dados && dados.length > 0 ? dados.map(t => `
                            <tr>
                                <td>${t.usuario_nome}</td>
                                <td>${t.equipamento_cod || 'N/A'}</td>
                                <td>
                                    <span class="badge ${t.devolvido ? 'status-aprovado' : 'status-pendente'}">
                                        ${t.devolvido ? 'Devolvido' : 'Em Posse'}
                                    </span>
                                </td>
                                <td>
                                    ${(!t.devolvido && t.equipamento_cod && t.equipamento_cod !== 'N/A - SERVIÇO') ? 
                                        `<button onclick="confirmarDevolucao('${t.id}', '${t.equipamento_cod}')" style="background:#f59e0b; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Dar Baixa</button>` 
                                        : '---'}
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="4">Sem registros.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
