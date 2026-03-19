async function renderTermos() {
    const container = document.getElementById('view-container');
    if (!container) return;

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        container.innerHTML = `<p>Usuário não logado.</p>`;
        return;
    }

    let query = supabaseClient.from('termos').select('*');

    if (!currentUser.is_ti) {
        query = query.eq('usuario_id', user.id);
    }

    const { data: lista, error } = await query.order('created_at', { ascending: false });
    if (error) return console.error("Erro Supabase:", error);


    container.innerHTML = `
        <div class="header-page"><h1>Meus Termos e Documentos</h1></div>
        <div class="card">
            <table class="table-custom">
                <thead>
                    <tr><th>Nº Termo</th><th>Tipo</th><th>Data</th><th>Ações</th></tr>
                </thead>
                <tbody>
                    ${lista && lista.length > 0 ? lista.map(t => `
                        <tr>
                            <td><b>#${t.solicitacao_id}</b></td>
                            <td>${t.tipo} ${t.equipamento_cod ? `(${t.equipamento_cod})` : ''}</td>
                            <td>${t.data_geracao}</td>
                            <td><button class="btn-outline" onclick="visualizarTermo('${t.id}')">📄 Visualizar / Imprimir</button></td>
                        </tr>
                    `).join('') : '<tr><td colspan="4">Nenhum documento encontrado.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

async function visualizarTermo(id) {
    // Busca o termo específico no Supabase
    const { data: t, error } = await supabaseClient
        .from('termos')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !t) return alert("Erro ao carregar detalhes do termo.");

    let tituloTermo = "TERMO DE RESPONSABILIDADE";
    let corpoTexto = "";

    // LÓGICA DE TEXTO POR TIPO
            if (t.tipo === 'Notebook') {
                const acessorios = Array.isArray(t.acessorios) ? t.acessorios : [];
                const checkbox = (item) => acessorios.includes(item) ? `☑ ${item}` : `☐ ${item}`;
                 const nenhum = acessorios.length === 0 ? '☑ Nenhum' : '☐ Nenhum';

                corpoTexto = `
            <p style="margin:5px 0;">
            Eu, <b>${t.usuario_nome}</b>, matrícula nº <b>${t.matricula || '---'}</b>, 
            declaro que recebi em caráter de empréstimo um notebook pertencente à instituição, 
            registrado sob o nº de patrimônio <b>${t.equipamento_cod}</b>.
            </p>

            <p style="margin:5px 0;">
            Declaro estar ciente de que o equipamento permanecerá sob minha responsabilidade durante todo o período de utilização, comprometendo-me a:
            </p>

            <ul style="list-style:none; padding-left:0; margin:5px 0;">
            <li>• Utilizá-lo exclusivamente para fins institucionais, pedagógicos ou de extensão;</li>
            <li>• Não é permitida a instalação de softwares não lincenciados.</li>
            <li>• Zelar pela conservação e integridade do equipamento;</li>
            <li>• Comunicar imediatamente ao setor responsável qualquer dano, falha ou ocorrência anormal;</li>
            <li>• Devolver o equipamento imediatamente após o término da atividade para a qual foi solicitado.</li>
            </ul>

            <p style="margin:5px 0;"><b>Acessórios entregues juntamente com o equipamento:</b></p>

            <p style="margin:5px 0;">
                ${t.acessorios?.includes('Carregador') ? '☑' : '☐'} Carregador &nbsp;&nbsp;
                ${t.acessorios?.includes('Mouse') ? '☑' : '☐'} Mouse &nbsp;&nbsp;
                ${t.acessorios?.includes('Teclado') ? '☑' : '☐'} Teclado &nbsp;&nbsp;
                ${t.acessorios?.includes('Fone') ? '☑' : '☐'} Fone &nbsp;&nbsp;
                ${t.acessorios?.includes('Nenhum') ? '☑' : '☐'} Nenhum
                </p>

            
            <p style="margin:15px 0 5px 0;">______________________________________________</p>
            <p style="margin:0;"><b>Assinatura do solicitante</b></p>
                    <p style="margin:5px 0;">Santa Helena de Goiás, ${
            t.data_geracao 
            ? t.data_geracao.split('T')[0].split('-').reverse().join('/') 
            : new Date().toLocaleDateString('pt-BR')
        }</p>
            <p style="margin:15px 0 5px 0;"><b>Preenchimento obrigatório no ato da devolução (setor responsável)</b></p>

            <p style="margin:5px 0;">
            Após conferência técnica, declaro ter recebido o notebook de patrimônio nº 
            <b>${t.equipamento_cod}</b>, conforme descrito neste termo:
            </p>

                <p style="margin:5px 0;">
            ( ) Em conformidade&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            ( ) Com observações
            </p>

            <p style="margin:10px 0 3px 0;"><b>Observações:</b></p>
            <p style="margin:2px 0;">Data de devolução:____/____/______._______________________________</p>
            <p style="margin:2px 0;">______________________________________________________________</p>
            

            <p style="margin:15px 0 5px 0;">Responsável pela conferência: ____________________________________</p>
            

            
            `;

        } else if (t.tipo === 'Projetor') {

                    corpoTexto = `
                <p style="margin:5px 0;">
                Eu, <b>${t.usuario_nome}</b>, matrícula nº <b>${t.matricula || '---'}</b>, 
                declaro que recebi em caráter de empréstimo um projetor multimídia pertencente à instituição, 
                registrado sob o nº de patrimônio <b>${t.equipamento_cod}</b>.
                </p>

                <p style="margin:5px 0;">
                Declaro estar ciente de que o equipamento permanecerá sob minha responsabilidade durante todo o período de utilização, comprometendo-me a:
                </p>

                <ul style="list-style:none; padding-left:0; margin:5px 0;">
                <li>• Utilizá-lo exclusivamente para fins institucionais, pedagógicos ou de extensão;</li>
                <li>• Zelar pela conservação e integridade do equipamento;</li>
                <li>• Comunicar imediatamente ao setor responsável qualquer dano, falha ou ocorrência anormal;</li>
                <li>• Devolver o equipamento imediatamente após o término da atividade para a qual foi solicitado.</li>
                </ul>

                <p style="margin:5px 0;"><b>Acessórios entregues juntamente com o equipamento:</b></p>

                <p style="margin:5px 0;">
                    ${t.acessorios?.includes('Cabo HDMI') ? '☑' : '☐'} Cabo HDMI &nbsp;&nbsp;
                    ${t.acessorios?.includes('Cabo VGA') ? '☑' : '☐'} Cabo VGA &nbsp;&nbsp;
                    ${t.acessorios?.includes('Extensão') ? '☑' : '☐'} Extensão Elétrica
                    </p>               
                
                <p style="margin:15px 0 5px 0;">______________________________________________</p>
                <p style="margin:0;"><b>Assinatura do solicitante</b></p>
                <p style="margin:5px 0;">Santa Helena de Goiás, ${
                t.data_geracao 
                ? t.data_geracao.split('T')[0].split('-').reverse().join('/') 
                : new Date().toLocaleDateString('pt-BR')
            }</p>

                <p style="margin:15px 0 5px 0;"><b>Preenchimento obrigatório no ato da devolução (setor responsável)</b></p>

                <p style="margin:5px 0;">
                Após conferência técnica, declaro ter recebido o projetor multimídia de patrimônio nº 
                <b>${t.equipamento_cod}</b>, conforme descrito neste termo:
                </p>

                <p style="margin:3px 0;">  ( ) Em conformidade   
                ( ) Com observações</p>

                <p style="margin:2px 0;">Data de devolução:____/____/______._______________________________</p>
            <p style="margin:2px 0;">______________________________________________________________</p>
                

                <p style="margin:15px 0 5px 0;">Responsável pela conferência:
                ____________________________________</p>

                               
                `;
        
    } else if (t.tipo.toLowerCase().includes('manuten')) { 

            tituloTermo = "ORDEM DE SERVIÇO TÉCNICO (OS)";

                    corpoTexto = `
                <p style="text-align:center; margin:5px 0;"><b>ORDEM DE SERVIÇO – ASSISTÊNCIA TEC.</b></p>

                <p style="margin:10px 0;">
                <b>Solicitante:</b> ${t.usuario_nome || '---'}, matrícula nº <b>${t.matricula || '---'}</b>
                </p>
              
                <p style="margin:5px 0;">Santa Helena de Goiás, ${
            t.data_geracao 
            ? t.data_geracao.split('T')[0].split('-').reverse().join('/') 
            : new Date().toLocaleDateString('pt-BR')
        }</p>
                <p style="margin:8px 0 3px 0;"><b>Descrição do serviço:</b></p>
                <p style="margin:5px 0;">${t.descricao || ''}</p>

                <p style="margin:15px 0 5px 0;"><b>Registro Técnico do Atendimento:</b></p>

                <p style="margin:2px 0;">______________________________________________________________</p>
                <p style="margin:2px 0;">______________________________________________________________</p>
                <p style="margin:2px 0;">______________________________________________________________</p>
                <p style="margin:2px 0;">______________________________________________________________</p>

                <p style="margin:10px 0 5px 0;"><b>Status do Atendimento:</b></p>

                <p style="margin:2px 0;">
                ( ) Concluído<br>
                ( ) Encaminhado para manutenção externa<br>
                ( ) Aguardando peças<br>
                ( ) Não constatado defeito
                </p>
                <p style="margin:20px 0 5px 0;">______________________________________________</p>
                <p style="margin:0;"><b>Ass. do Solicitnate</b></p>
                <p style="margin:20px 0 5px 0;">______________________________________________</p>
                <p style="margin:0;"><b>Responsável Técnico</b></p>
                     <p style="margin:5px 0;">Santa Helena de Goiás, ${
            t.data_geracao 
            ? t.data_geracao.split('T')[0].split('-').reverse().join('/') 
            : new Date().toLocaleDateString('pt-BR')
        }</p>           
                `;
                
} else { 
    // SEÇÃO DE ACESSÓRIOS / OUTROS (O "Coringa")
    
    tituloTermo = "REGISTRO DE SERVIÇO / ACESSÓRIOS";

    // Pega os dados com 'Proteção de Valor Vazio' (Se não achar no banco, usa o texto padrão)
    const solicitante = t.usuario_nome || t.solicitante || "Responsável pelo Setor";
    const acaoRealizada = t.descricao || t.observacao || t.justificativa || "Manutenção/Troca de periférico conforme solicitado.";
    
    // Data formatada direto para o texto
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const dataDocumento = t.data_geracao ? t.data_geracao.split(/[-T ]/).reverse().slice(-3).join('/') : dataAtual;

    corpoTexto = `
        <div style="text-align:center; margin-bottom: 20px;">
            <p><b>ORDEM DE SERVIÇO – ACESSÓRIOS E PERIFÉRICOS</b></p>
        </div>

        <p style="margin:10px 0;">
        <b>Solicitante:</b> ${t.usuario_nome || '---'}, matrícula nº <b>${t.matricula || '---'}</b>
        </p>
        <p style="margin: 10px 0;"><b>Descrição do Serviço:<br></b> ${acaoRealizada}</p>

        <p style="margin: 25px 0; line-height: 1.6;">
            Informamos a realização de manutenção, configuração ou troca de acessórios/periféricos técnicos para assegurar a continuidade das atividades no setor.
        </p>

        <p style="margin: 40px 0;">Santa Helena de Goiás, ${dataDocumento}</p>

        <br><br>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 50px;">
            <div style="border-top: 1px solid #000; width: 300px; text-align: center; padding-top: 8px;">
                
                Assinatura do Solicitante
            </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 50px;">
            <div style="border-top: 1px solid #000; width: 300px; text-align: center; padding-top: 8px;">
                
                Renponsável Técnico
            </div>
        </div>
    `;
}


    const modal = document.getElementById('modal-termo');
    const printArea = document.getElementById('print-area');

    // Monta o modal
    // Ajuste estas medidas se o texto ficar muito em cima ou muito embaixo
    const margemSuperior = "4.5cm"; // Espaço para o cabeçalho da imagem
    const margemInferior = "2.5cm"; // Espaço para o rodapé da imagem

    printArea.innerHTML = `
        <div class="no-print" style="margin-bottom: 25px; display: flex; justify-content: space-between; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <button class="secondary" onclick="fecharModal()">⬅️ Voltar ao Sistema</button>
            <button id="btn-imprimir" style="background: #059669; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer;">
                🖨️ Imprimir Documento Agora
            </button>
        </div>

        <div id="printable-content" style="
            width: 21cm; 
            min-height: 29.7cm; 
            margin: 0 auto; 
            background-image: url('img/timbrado.jpeg'); 
            background-size: 100% 100%; 
            background-repeat: no-repeat; 
            background-position: center;
            padding: ${margemSuperior} 2cm ${margemInferior} 2cm; 
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
            position: relative;
        ">
            <div style="text-align: right; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 14pt;">${tituloTermo}</h3>
                <p style="margin: 0; font-size: 12pt; color: red;"><b>Nº OS: ${t.solicitacao_id}</b></p>
            </div>

            <div style="font-size: 11pt; line-height: 1.6; text-align: justify;">
                ${corpoTexto}
            </div>
        </div>
    `;

    // Mostra modal
    modal.style.display = 'flex';

    // Configura impressão
    document.getElementById('btn-imprimir').onclick = function() {
    // 1. Pegamos o conteúdo do HTML
    let conteudoOriginal = document.getElementById('printable-content').innerHTML;

    // 2. FUNÇÃO INTERNA PARA FORMATAR (Garante que funcione aqui dentro)
    const converterData = (str) => {
        if (!str) return '';
        // Se a data vier com hífen (2026-03-07), nós invertemos
        if (str.includes('-')) {
            const p = str.split(/[-T ]/);
            return `${p[2]}/${p[1]}/${p[0]}`;
        }
        return str; // Se já estiver certa, mantém
    };

    // 3. CAPTURA A DATA DA OS (Tentando pegar do objeto 't' que você usa)
    const dataOS = converterData(t.data_geracao || t.created_at || new Date().toISOString());

    const novaJanela = window.open('', '_blank', 'width=900,height=700');
    const urlImagem = window.location.origin + '/timbrado.jpeg';

    novaJanela.document.write(`
        <html>
        <head>
            <title>Impressão SIGTI</title>
            <style>
                @media print {
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    @page { size: A4; margin: 0; }
                }
                body { margin: 0; padding: 0; font-family: 'Times New Roman', serif; }
                .container-impressao { position: relative; width: 21cm; height: 29.7cm; }
                .fundo-timbrado { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }
                .texto-sobreposto { position: relative; padding: 4.5cm 2cm 2cm 2cm; z-index: 1; }
                p { font-size: 12pt; line-height: 1.5; }
            </style>
        </head>
            <body>
                <div class="container-impressao">
        <img src="img/timbrado.jpeg" class="fundo-timbrado">
        
        <div class="texto-sobreposto">
            ${conteudoOriginal}
        </div>
         </div>
            
            <script>
                window.onload = () => {
                    setTimeout(() => {
                        window.print();
                        window.close();
                    }, 800);
                };
            </script>
        </body>
        </html>
    `);
    novaJanela.document.close();
};
    
    // Pequena pausa para a imagem carregar antes de imprimir
    setTimeout(() => {
                
    }, 500);
    };


    
    
function imprimirTermo() {
    const conteudo = document.getElementById('printable-content').innerHTML;
    const minhaJanela = window.open('', '', 'width=900,height=700');
    minhaJanela.document.write('<html><head><title>Termo</title></head><body>');
    minhaJanela.document.write(conteudo);
    minhaJanela.document.write('</body></html>');
    minhaJanela.document.close();
    minhaJanela.focus();
    minhaJanela.print();
    minhaJanela.close();

}
async function confirmarDevolucao(idTermo, patrimonio) {
    if (!confirm(`Confirmar a devolução do patrimônio ${patrimonio}?`)) return;

    try {
        // 1. Atualiza o termo (IMPORTANTE: usamos o AWAIT aqui)
        
        const { error: errorTermo } = await supabaseClient
            .from('termos')
            .update({ devolvido: true })
            .eq('id', idTermo);

        if (errorTermo) throw errorTermo;

        // 2. Volta o item para disponível (AWAIT aqui também)
        const { error: errorEstoque } = await supabaseClient
            .from('estoque')
            .update({ status: 'disponivel' })
            .eq('patrimonio', patrimonio);

        if (errorEstoque) throw errorEstoque;

        alert("Devolução registrada com sucesso!");

        // 3. Agora sim, recarrega a tela. 
        // Como o 'await' segurou o código, os dados já estarão novos no banco.
       
        await renderHistorico(); 

    } catch (err) {
        console.error("Erro na devolução:", err);
        alert("Erro ao processar: " + err.message);
    }
}