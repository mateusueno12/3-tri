// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const cepInput = document.getElementById('cep');
    const btnBuscar = document.getElementById('btnBuscar');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const addressInfo = document.getElementById('addressInfo');
    const recentList = document.getElementById('recentList');
    
    // Elementos para exibir as informações do endereço
    const infoCep = document.getElementById('infoCep');
    const infoLogradouro = document.getElementById('infoLogradouro');
    const infoBairro = document.getElementById('infoBairro');
    const infoCidade = document.getElementById('infoCidade');
    const infoEstado = document.getElementById('infoEstado');

    // Array para armazenar consultas recentes (máximo 5)
    let recentSearches = JSON.parse(localStorage.getItem('recentCeps')) || [];

    // Formatar CEP enquanto digita
    cepInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.slice(0, 5) + '-' + value.slice(5, 8);
        }
        e.target.value = value;
    });

    // Buscar CEP ao pressionar Enter
    cepInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarCEP();
        }
    });

    // Buscar CEP ao clicar no botão
    btnBuscar.addEventListener('click', buscarCEP);

    // Função principal para buscar CEP
    async function buscarCEP() {
        // Limpar formatação do CEP (remover hífen)
        let cep = cepInput.value.replace(/\D/g, '');
        
        // Validar CEP
        if (!validarCEP(cep)) {
            mostrarErro('CEP inválido! Digite um CEP com 8 números.');
            return;
        }

        // Esconder resultados anteriores e mostrar loading
        esconderResultados();
        loading.style.display = 'block';

        try {
            // Fazer requisição para a API ViaCEP
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            // Verificar se houve erro na resposta
            if (data.erro) {
                throw new Error('CEP não encontrado');
            }

            // Preencher os dados na tela
            preencherDados(data);
            
            // Salvar nos recentes
            salvarConsultaRecente(cep);
            
            // Mostrar o resultado
            loading.style.display = 'none';
            addressInfo.style.display = 'block';

        } catch (error) {
            // Tratar erro
            loading.style.display = 'none';
            mostrarErro(error.message);
        }
    }

    // Função para validar CEP
    function validarCEP(cep) {
        return cep && cep.length === 8 && /^\d+$/.test(cep);
    }

    // Função para preencher os dados na tela
    function preencherDados(data) {
        infoCep.textContent = data.cep;
        infoLogradouro.textContent = data.logradouro || 'Não disponível';
        infoBairro.textContent = data.bairro || 'Não disponível';
        infoCidade.textContent = data.localidade || 'Não disponível';
        infoEstado.textContent = data.uf || 'Não disponível';
    }

    // Função para mostrar erro
    function mostrarErro(mensagem) {
        errorMessage.querySelector('p').textContent = `❌ ${mensagem}`;
        errorMessage.style.display = 'block';
        
        // Esconder erro após 3 segundos
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }

    // Função para esconder resultados
    function esconderResultados() {
        loading.style.display = 'none';
        errorMessage.style.display = 'none';
        addressInfo.style.display = 'none';
    }

    // Função para salvar consulta recente
    function salvarConsultaRecente(cep) {
        // Formatar CEP para exibição
        const cepFormatado = cep.slice(0, 5) + '-' + cep.slice(5);
        
        // Verificar se o CEP já existe na lista
        if (!recentSearches.includes(cepFormatado)) {
            // Adicionar no início da lista
            recentSearches.unshift(cepFormatado);
            
            // Manter apenas os 5 mais recentes
            if (recentSearches.length > 5) {
                recentSearches.pop();
            }
            
            // Salvar no localStorage
            localStorage.setItem('recentCeps', JSON.stringify(recentSearches));
        }
        
        // Atualizar a exibição da lista
        atualizarListaRecentes();
    }

    // Função para atualizar a lista de recentes
    function atualizarListaRecentes() {
        recentList.innerHTML = '';
        
        if (recentSearches.length === 0) {
            recentList.innerHTML = '<p class="recent-item">Nenhuma consulta recente</p>';
            return;
        }
        
        recentSearches.forEach(cep => {
            const item = document.createElement('span');
            item.className = 'recent-item';
            item.textContent = cep;
            item.addEventListener('click', () => {
                cepInput.value = cep;
                buscarCEP();
            });
            recentList.appendChild(item);
        });
    }

    // Função para limpar o formulário
    function limparFormulario() {
        cepInput.value = '';
        esconderResultados();
    }

    // Inicializar lista de recentes
    atualizarListaRecentes();

    // Adicionar botão de limpar (opcional)
    const limparBtn = document.createElement('button');
    limparBtn.textContent = 'Limpar';
    limparBtn.className = 'btn-primary';
    limparBtn.style.marginLeft = '10px';
    limparBtn.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    limparBtn.addEventListener('click', limparFormulario);
    
    // Adicionar botão de limpar ao lado do botão buscar (opcional)
    // document.querySelector('.input-group').appendChild(limparBtn);
});
