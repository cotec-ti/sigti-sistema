function fecharModal() {
    document.getElementById('modal-termo').style.display = 'none';
}

function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('sigti-theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        }         
        if(localStorage.getItem('sigti-theme') === 'dark') document.body.classList.add('dark-mode');