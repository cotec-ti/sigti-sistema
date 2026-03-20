

// Realtime (seguro)
if (typeof supabaseClient !== 'undefined') {
    supabaseClient
      .channel('monitor-geral')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'solicitacoes' }, 
        () => { 
            if (telaAtiva === 'solicitacoes' && typeof renderSolicitacoes === 'function') {
                renderSolicitacoes(); 
            }
        }
      )
      .subscribe();
}

// ESC global
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (typeof fecharModal === "function") {
            fecharModal();
        }
    }
});