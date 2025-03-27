"use strict";
// Classe principal que gerencia os processos
class ControleProcessual {
    // Construtor que recebe elementos do DOM necessários
    constructor(tbody) {
        this.tbody = tbody;
        this.processos = []; // Array que armazena todos os processos
        this.carregarProcessos(); // Carrega os processos ao inicializar
    }
    // Método para carregar processos do LocalStorage ou de um arquivo JSON
    async carregarProcessos() {
        try {
            // Tenta carregar do LocalStorage primeiro
            const localData = localStorage.getItem("processos");
            if (localData) {
                // Se existir dados no LocalStorage, converte de JSON para array
                this.processos = JSON.parse(localData);
            }
            else {
                // Se não existir, carrega do arquivo JSON
                await this.carregarProcessosDoJSON();
            }
            // Atualiza a tabela com os dados carregados
            this.atualizarTabela();
        }
        catch (error) {
            console.error("Erro ao carregar processos:", error);
        }
    }
    // Carrega processos de um arquivo JSON externo    
    async carregarProcessosDoJSON() {
        try {
            // Faz requisição para o arquivo JSON
            const response = await fetch("processos.json");
            if (!response.ok)
                throw new Error("Falha ao carregar JSON");
            // Converte a resposta para JSON
            const data = await response.json();
            if (Array.isArray(data)) {
                // Se os dados forem um array, formata cada processo e armazena
                this.processos = data.map(this.formatarProcesso);
                this.salvarNoLocalStorage(); // Salva no LocalStorage para uso futuro
            }
            else {
                console.error("Dados inválidos no arquivo JSON");
            }
        }
        catch (error) {
            console.error("Erro ao carregar JSON:", error);
        }
    }
    // Formata os dados de um processo (padroniza UF, cidade, etc.)
    formatarProcesso(processo) {
        return Object.assign(Object.assign({}, processo), { uf: processo.uf ? processo.uf.trim().toUpperCase() : undefined, cidade: processo.cidade || undefined // Garante que cidade vazia seja undefined
         });
    }
    // Salvar processos no LocalStorage
    salvarNoLocalStorage() {
        localStorage.setItem("processos", JSON.stringify(this.processos));
    }
    // Atualizar a tabela
    atualizarTabela() {
        this.tbody.innerHTML = this.processos
            .map((processo, index) => this.criarLinhaTabela(processo, index))
            .join("");
    }
    // Cria o HTML de uma linha da tabela para um processo específico
    criarLinhaTabela(processo, index) {
        const ufFormatado = processo.uf && processo.uf.trim() ?
            processo.uf.trim().toUpperCase() : "N/A";
        const cidadeFormatada = processo.cidade || "N/A";
        // Retorna o HTML da linha da tabela
        return `
            <tr>
                <td>${processo.numero}</td>
                <td>${processo.reclamante}</td>
                <td>${processo.reclamada}</td>
                <td>${processo.status}</td>
                <td>${this.formatarValor(processo.valorCausa)}</td>
                <td>${processo.dataAjuizamento}</td>
                <td>${cidadeFormatada} / ${ufFormatado}</td>
                <td>${processo.vara}</td>
                <td><button class="editar" data-index="${index}">Editar</button></td>
            </tr>
        `;
    }
    // Formata um valor numérico para moeda brasileira (R$)
    formatarValor(valor) {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }
    // Adiciona um novo processo ou edita um existente
    adicionarOuEditarProcesso(index, processo) {
        // Formata o processo antes de salvar
        const processoFormatado = this.formatarProcesso(processo);
        // Se o index for válido, edita o processo existente
        if (index !== null && index >= 0 && index < this.processos.length) {
            this.processos[index] = Object.assign(Object.assign({}, this.processos[index]), processoFormatado);
        }
        else {
            // Se não, gera um novo ID e adiciona o processo
            processoFormatado.id = this.gerarNovoId();
            this.processos.push(processoFormatado);
        }
        // Salva no LocalStorage e atualiza a tabela
        this.salvarNoLocalStorage();
        this.atualizarTabela();
    }
    // Gera um novo ID para um processo
    gerarNovoId() {
        return this.processos.length > 0 ?
            Math.max(...this.processos.map(p => p.id || 0)) + 1 : 1;
    }
    // Obtém um processo pelo seu índice no array
    getProcessoPorIndice(index) {
        return this.processos[index];
    }
}
// Classe que gerencia o modal (janela pop-up)
class FormularioProcesso {
    constructor(modal, modalTitle, form) {
        this.modal = modal;
        this.modalTitle = modalTitle;
        this.form = form;
    }
    // Abre o modal com um título específico
    abrir(titulo) {
        this.modalTitle.textContent = titulo;
        this.modal.style.display = "block";
    }
    // Fecha o modal e limpa o formulário
    fechar() {
        this.modal.style.display = "none";
        this.form.reset();
    }
    // Preenche o formulário com os dados de um processo existente
    preencherFormulario(processo) {
        var _a;
        document.getElementById("processoId").value =
            ((_a = processo.id) === null || _a === void 0 ? void 0 : _a.toString()) || "";
        document.getElementById("numeroProcesso").value =
            processo.numero;
        document.getElementById("reclamante").value =
            processo.reclamante;
        document.getElementById("reclamada").value =
            processo.reclamada;
        document.getElementById("status").value =
            processo.status;
        document.getElementById("valorCausa").value =
            processo.valorCausa.toString();
        document.getElementById("dataAjuizamento").value =
            processo.dataAjuizamento;
        document.getElementById("cidade").value =
            processo.cidade || "";
        document.getElementById("uf").value =
            processo.uf || "";
        document.getElementById("vara").value =
            processo.vara;
    }
}
// Classe estática que gerencia a lista de estados brasileiros (UF)
class LocalizacaoJudicial {
    // Preenche um elemento select com as opções de estados
    static popularSelect(selectElement) {
        // Limpa o select e adiciona opção padrão
        selectElement.innerHTML = '<option value="">Selecione um estado</option>';
        // Para cada estado, cria uma opção no select
        this.estados.forEach(estado => {
            const option = document.createElement("option");
            option.value = estado.sigla;
            option.textContent = `${estado.nome} (${estado.sigla})`;
            selectElement.appendChild(option);
        });
    }
}
// Lista estática de todos os estados brasileiros com sigla e nome
// ... (demais estados)
LocalizacaoJudicial.estados = [
    { sigla: "AC", nome: "Acre" },
    { sigla: "AL", nome: "Alagoas" },
    { sigla: "AP", nome: "Amapá" },
    { sigla: "AM", nome: "Amazonas" },
    { sigla: "BA", nome: "Bahia" },
    { sigla: "CE", nome: "Ceará" },
    { sigla: "DF", nome: "Distrito Federal" },
    { sigla: "ES", nome: "Espírito Santo" },
    { sigla: "GO", nome: "Goiás" },
    { sigla: "MA", nome: "Maranhão" },
    { sigla: "MT", nome: "Mato Grosso" },
    { sigla: "MS", nome: "Mato Grosso do Sul" },
    { sigla: "MG", nome: "Minas Gerais" },
    { sigla: "PA", nome: "Pará" },
    { sigla: "PB", nome: "Paraíba" },
    { sigla: "PR", nome: "Paraná" },
    { sigla: "PE", nome: "Pernambuco" },
    { sigla: "PI", nome: "Piauí" },
    { sigla: "RJ", nome: "Rio de Janeiro" },
    { sigla: "RN", nome: "Rio Grande do Norte" },
    { sigla: "RS", nome: "Rio Grande do Sul" },
    { sigla: "RO", nome: "Rondônia" },
    { sigla: "RR", nome: "Roraima" },
    { sigla: "SC", nome: "Santa Catarina" },
    { sigla: "SP", nome: "São Paulo" },
    { sigla: "SE", nome: "Sergipe" },
    { sigla: "TO", nome: "Tocantins" }
];
// Quando o DOM estiver completamente carregado, executa este código
document.addEventListener("DOMContentLoaded", () => {
    // Obtém referências para os elementos importantes do DOM
    // Elementos do DOM
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const formProcesso = document.getElementById("formProcesso");
    const tbody = document.getElementById("tabelaProcessos");
    const novoProcessoBtn = document.getElementById("novoProcessoBtn");
    const closeModal = document.querySelector(".close");
    const limparBtn = document.getElementById("limparBtn");
    const ufSelect = document.getElementById("uf");
    // // Inicializa as classes principais
    const processoManager = new ControleProcessual(tbody);
    const modalManager = new FormularioProcesso(modal, modalTitle, formProcesso);
    // Preenche o select de UFs com os estados brasileiros
    LocalizacaoJudicial.popularSelect(ufSelect);
    // Configura os event listeners (ouvintes de eventos)
    // Botão "Novo Processo" - abre o modal para cadastro
    novoProcessoBtn.addEventListener("click", () => {
        modalManager.abrir("Novo Processo");
    });
    // Botão de fechar o modal
    closeModal.addEventListener("click", () => {
        modalManager.fechar();
    });
    // Botão "Limpar" - limpa o formulário
    limparBtn.addEventListener("click", () => {
        formProcesso.reset();
    });
    // Evento de clique na tabela (para editar processos)
    tbody.addEventListener("click", (event) => {
        const target = event.target;
        // Se clicou em um botão "Editar"
        if (target.classList.contains("editar")) {
            // Obtém o índice do processo a ser editado
            const index = parseInt(target.dataset.index || "");
            if (!isNaN(index)) {
                // Obtém o processo e preenche o formulário
                const processo = processoManager.getProcessoPorIndice(index);
                if (processo) {
                    modalManager.preencherFormulario(processo);
                    // Armazena o índice no campo hidden para saber qual processo está sendo editado
                    document.getElementById("processoId").value = index.toString();
                    modalManager.abrir("Editar Processo");
                }
            }
        }
    });
    // Evento de submit do formulário (salvar processo)
    formProcesso.addEventListener("submit", (event) => {
        event.preventDefault(); // Evita o comportamento padrão de submit
        // Obtém o índice do processo (se estiver editando)
        const indexInput = document.getElementById("processoId").value;
        const index = indexInput ? parseInt(indexInput) : null;
        // Formata o valor da causa (trata separadores decimais)
        const valorCausa = parseFloat(document.getElementById("valorCausa").value
            .replace(/\./g, "")
            .replace(",", ".")) || 0;
        // Cria um objeto Processo com os dados do formulário
        const novoProcesso = {
            numero: document.getElementById("numeroProcesso").value,
            reclamante: document.getElementById("reclamante").value,
            reclamada: document.getElementById("reclamada").value,
            status: document.getElementById("status").value,
            valorCausa,
            dataAjuizamento: document.getElementById("dataAjuizamento").value,
            cidade: document.getElementById("cidade").value.trim() || undefined,
            uf: document.getElementById("uf").value || undefined,
            vara: document.getElementById("vara").value
        };
        // Chama o método para adicionar/editar o processo
        processoManager.adicionarOuEditarProcesso(index, novoProcesso);
        // Fecha o modal após salvar
        modalManager.fechar();
    });
});
