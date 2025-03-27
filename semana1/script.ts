// Definição da interface Processo
// Esta interface define a estrutura de dados que representa um processo jurídico
interface Processo {
    id?: number;
    numero: string;
    reclamante: string;
    reclamada: string;
    status: string;
    valorCausa: number;
    dataAjuizamento: string;
    cidade?: string;
    uf?: string;
    vara: string;
}

// Classe principal que gerencia os processos
class ControleProcessual {
    private processos: Processo[] = [];  // Array que armazena todos os processos

    // Construtor que recebe elementos do DOM necessários
    constructor(
        private tbody: HTMLTableSectionElement    ) {
        this.carregarProcessos();   // Carrega os processos ao inicializar
    }

    // Método para carregar processos do LocalStorage ou de um arquivo JSON
    private async carregarProcessos(): Promise<void> {
        try {
            // Tenta carregar do LocalStorage primeiro
            const localData = localStorage.getItem("processos");
            if (localData) {
                 // Se existir dados no LocalStorage, converte de JSON para array
                this.processos = JSON.parse(localData);
            } else {
                // Se não existir, carrega do arquivo JSON
                await this.carregarProcessosDoJSON();
            }
            // Atualiza a tabela com os dados carregados
            this.atualizarTabela();
        } catch (error) {
            console.error("Erro ao carregar processos:", error);
        }
    }

    // Carrega processos de um arquivo JSON externo    
    private async carregarProcessosDoJSON(): Promise<void> {
        try {
            // Faz requisição para o arquivo JSON
            const response = await fetch("processos.json");
            if (!response.ok) throw new Error("Falha ao carregar JSON");
            // Converte a resposta para JSON
            const data = await response.json();
            if (Array.isArray(data)) {
                // Se os dados forem um array, formata cada processo e armazena
                this.processos = data.map(this.formatarProcesso);
                this.salvarNoLocalStorage(); // Salva no LocalStorage para uso futuro
            } else {
                console.error("Dados inválidos no arquivo JSON");
            }
        } catch (error) {
            console.error("Erro ao carregar JSON:", error);
        }
    }

     // Formata os dados de um processo (padroniza UF, cidade, etc.)
    private formatarProcesso(processo: Processo): Processo {
        return {
            ...processo, // Copia todas as propriedades existentes
            uf: processo.uf ? processo.uf.trim().toUpperCase() : undefined, // Padroniza UF
            cidade: processo.cidade || undefined // Garante que cidade vazia seja undefined
        };
    }

    // Salvar processos no LocalStorage
    private salvarNoLocalStorage(): void {
        localStorage.setItem("processos", JSON.stringify(this.processos));
    }

    // Atualizar a tabela
    private atualizarTabela(): void {
        this.tbody.innerHTML = this.processos
            .map((processo, index) => this.criarLinhaTabela(processo, index))
            .join("");
    }


    // Cria o HTML de uma linha da tabela para um processo específico
    private criarLinhaTabela(processo: Processo, index: number): string {
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
    private formatarValor(valor: number): string {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    // Adiciona um novo processo ou edita um existente
    public adicionarOuEditarProcesso(index: number | null, processo: Processo): void {
        // Formata o processo antes de salvar
        const processoFormatado = this.formatarProcesso(processo);
        
        // Se o index for válido, edita o processo existente
        if (index !== null && index >= 0 && index < this.processos.length) {
            this.processos[index] = { ...this.processos[index], ...processoFormatado };
        } else {
            // Se não, gera um novo ID e adiciona o processo
            processoFormatado.id = this.gerarNovoId();
            this.processos.push(processoFormatado);
        }
        // Salva no LocalStorage e atualiza a tabela
        this.salvarNoLocalStorage();
        this.atualizarTabela();
    }

    // Gera um novo ID para um processo
    private gerarNovoId(): number {
        return this.processos.length > 0 ? 
            Math.max(...this.processos.map(p => p.id || 0)) + 1 : 1;
    }

    // Obtém um processo pelo seu índice no array
    public getProcessoPorIndice(index: number): Processo | undefined {
        return this.processos[index];
    }
}

// Classe que gerencia o modal (janela pop-up)
class FormularioProcesso {
    constructor(
        private modal: HTMLDivElement,
        private modalTitle: HTMLHeadingElement,
        private form: HTMLFormElement
    ) {}

    // Abre o modal com um título específico
    public abrir(titulo: string): void {
        this.modalTitle.textContent = titulo;
        this.modal.style.display = "block";
    }

    // Fecha o modal e limpa o formulário
    public fechar(): void {
        this.modal.style.display = "none";
        this.form.reset();
    }

    // Preenche o formulário com os dados de um processo existente
    public preencherFormulario(processo: Processo): void {
        (document.getElementById("processoId") as HTMLInputElement).value = 
            processo.id?.toString() || "";
        (document.getElementById("numeroProcesso") as HTMLInputElement).value = 
            processo.numero;
        (document.getElementById("reclamante") as HTMLInputElement).value = 
            processo.reclamante;
        (document.getElementById("reclamada") as HTMLInputElement).value = 
            processo.reclamada;
        (document.getElementById("status") as HTMLInputElement).value = 
            processo.status;
        (document.getElementById("valorCausa") as HTMLInputElement).value = 
            processo.valorCausa.toString();
        (document.getElementById("dataAjuizamento") as HTMLInputElement).value = 
            processo.dataAjuizamento;
        (document.getElementById("cidade") as HTMLInputElement).value = 
            processo.cidade || "";
        (document.getElementById("uf") as HTMLSelectElement).value = 
            processo.uf || "";
        (document.getElementById("vara") as HTMLInputElement).value = 
            processo.vara;
    }
}

// Classe estática que gerencia a lista de estados brasileiros (UF)
class LocalizacaoJudicial {
    // Lista estática de todos os estados brasileiros com sigla e nome
    // ... (demais estados)
    private static readonly estados: Estado[] = [
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

    // Preenche um elemento select com as opções de estados
    public static popularSelect(selectElement: HTMLSelectElement): void {
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

// Interface auxiliar para representar um estado brasileiro
interface Estado {
    sigla: string;
    nome: string;
}

// Quando o DOM estiver completamente carregado, executa este código
document.addEventListener("DOMContentLoaded", () => {
    // Obtém referências para os elementos importantes do DOM
    // Elementos do DOM
    const modal = document.getElementById("modal") as HTMLDivElement;
    const modalTitle = document.getElementById("modalTitle") as HTMLHeadingElement;
    const formProcesso = document.getElementById("formProcesso") as HTMLFormElement;
    const tbody = document.getElementById("tabelaProcessos") as HTMLTableSectionElement;
    const novoProcessoBtn = document.getElementById("novoProcessoBtn") as HTMLButtonElement;
    const closeModal = document.querySelector(".close") as HTMLSpanElement;
    const limparBtn = document.getElementById("limparBtn") as HTMLButtonElement;
    const ufSelect = document.getElementById("uf") as HTMLSelectElement;

    // // Inicializa as classes principais
    const processoManager = new ControleProcessual(tbody);
    const modalManager = new FormularioProcesso (modal, modalTitle, formProcesso);
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
        const target = event.target as HTMLElement;
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
                    (document.getElementById("processoId") as HTMLInputElement).value = index.toString();
                    modalManager.abrir("Editar Processo");
                }
            }
        }
    });

    // Evento de submit do formulário (salvar processo)
    formProcesso.addEventListener("submit", (event) => {
        event.preventDefault(); // Evita o comportamento padrão de submit
        
        // Obtém o índice do processo (se estiver editando)
        const indexInput = (document.getElementById("processoId") as HTMLInputElement).value;
        const index = indexInput ? parseInt(indexInput) : null;
        
        // Formata o valor da causa (trata separadores decimais)
        const valorCausa = parseFloat(
            (document.getElementById("valorCausa") as HTMLInputElement).value
                .replace(/\./g, "")
                .replace(",", ".")
        ) || 0;

        // Cria um objeto Processo com os dados do formulário
        const novoProcesso: Processo = {
            numero: (document.getElementById("numeroProcesso") as HTMLInputElement).value,
            reclamante: (document.getElementById("reclamante") as HTMLInputElement).value,
            reclamada: (document.getElementById("reclamada") as HTMLInputElement).value,
            status: (document.getElementById("status") as HTMLInputElement).value,
            valorCausa,
            dataAjuizamento: (document.getElementById("dataAjuizamento") as HTMLInputElement).value,
            cidade: (document.getElementById("cidade") as HTMLInputElement).value.trim() || undefined,
            uf: (document.getElementById("uf") as HTMLSelectElement).value || undefined,
            vara: (document.getElementById("vara") as HTMLInputElement).value
        };

        // Chama o método para adicionar/editar o processo
        processoManager.adicionarOuEditarProcesso(index, novoProcesso);
        // Fecha o modal após salvar
        modalManager.fechar();
    });
});