# Gerenciador de Processos Judiciais


## 📌 Sobre o Projeto

Este projeto tem como objetivo o gerenciamento de processos judiciais, permitindo:


✅ Visualizar processos em uma tabela interativa  
➕ Adicionar novos processos  
✏️ Editar processos existentes  
💾 Salvar dados localmente no navegador (LocalStorage)  
📂 Carregar dados iniciais de um arquivo JSON  
🏷️ Gerenciar informações como número do processo, partes envolvidas, status, valor da causa, entre outros.

---


## 🔄 Fluxo de Funcionamento

### 🔍 Leitura de Dados


```typescript
private async carregarProcessos(): Promise<void> {
    // 1º Tenta ler do LocalStorage
    const localData = localStorage.getItem("processos");
    
    // 2º Se não houver dados, carrega do arquivo JSON
    if (!localData) {
        await this.carregarProcessosDoJSON();
    }
}



```


📌 **Ordem de carregamento:**
1️⃣ Verifica se há processos armazenados no LocalStorage.  
2️⃣ Caso não existam, carrega os dados do arquivo `processos.json`.  

---


## 📁 Estrutura dos Dados

Os processos são armazenados em um formato JSON:

```json
[
  {
    "numero": "7572812-53.2007.5.09.7387",
    "reclamante": "Henrique Fernandes",
    "reclamada": "da Rosa da Conceição Ltda.",
    "status": "Encerrado",
    "valorCausa": 46574.8,
    "dataAjuizamento": "2020-04-10",
    "cidade": "Nascimento",
    "uf": "MS",
    "vara": "2ª Vara do Trabalho"
  },
]
```

🔹 **Transformação dos dados para exibição:**
- Cada processo é convertido em uma linha HTML (`<tr>`).
- Formatação aplicada aos valores:
  - 💰 Moeda: `R$ 12.500,50`
  - 📍 UF: `SP` (sempre em maiúsculas)
  - 🏛️ Cidade/Vara: Exibe `N/A` se não houver valor definido.

---



## ✏️ Edição e Cadastro de Processo


```typescript
public adicionarOuEditarProcesso(index: number | null, processo: Processo) {
    if (index !== null) {
        // Edição
        this.processos[index] = { ...processo };
    } else {
        // Novo processo
        this.processos.push(processo);
    }
}
```

📌 **Diferenciação entre edição e novo cadastro:**  
- Se `index` for diferente de `null`, o processo existente é editado.  
- Caso contrário, um novo processo é adicionado à lista.  
- O operador spread (`...`) é utilizado para garantir a cópia segura dos dados.

---



## ⚡ Recursos do TypeScript Utilizados





| Recurso                  | Aplicação                              | Benefício |
|--------------------------|----------------------------------------|-----------|
| Interfaces               | `interface Processo` e `interface Estado` | Define a estrutura dos dados de forma tipada |
| Modificadores de acesso  | `private`, `public`                    | Controla a visibilidade dos métodos |
| Tipos genéricos          | `Promise<void>`, `HTMLTableSectionElement` | Melhora o autocompletar e validação |
| Union Types              | `number | null`                         | Permite múltiplos tipos para um valor |
| Optional Chaining        | `processo.id?.toString()`               | Evita erros com valores opcionais |
| Async/Await              | `carregarProcessosDoJSON()`             | Facilita a manipulação de código assíncrono |


---

## 🚀 Como Compilar e Executar

### 📌 Pré-requisitos
- **Node.js** instalado
- **TypeScript** instalado globalmente:

```sh
npm install -g typescript
```

### 📂 Estrutura de Arquivos

```
📂 Projeto
├── index.html
├── processos.json
├── script.js
├── script.ts
├── style.css
├── tsconfig.json
```

### 🔧 Passo a Passo

1️⃣ **Criar o arquivo `tsconfig.json`** (caso ainda não exista):
```sh
tsc --init
```
Isso criará um arquivo `tsconfig.json` com as configurações do TypeScript.

📌 Exemplo de `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "ES6",
    "strict": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"]
}
```

2️⃣ **Compilar o TypeScript para JavaScript**:
```sh
tsc
```
Isso converterá os arquivos `.ts` para `.js`.

🔄 **Para compilar automaticamente a cada alteração:**
```sh
tsc --watch
```

3️⃣ **Executar o projeto**
- Abra o `index.html` diretamente no navegador ou utilize um servidor local, como o **Live Server** no VSCode.

---

## 🛠️ Melhorias e Dicas

✅ **Adicionar validações para evitar entradas inválidas:**
```typescript
if (!processo.numero.match(/\d{7}-\d{2}\.\d{4}/)) {
    alert("Número do processo inválido!");
}
```

✅ **Implementar filtros para facilitar a busca por status:**
```typescript
filtrarPorStatus(status: string) {
    return this.processos.filter(p => p.status === status);
}
```

✅ **Melhorar a persistência dos dados** adicionando integração com backend (Firebase, REST API, etc.).

---

## 🎯 Conclusão
Este sistema demonstra o uso prático de **TypeScript** para aplicações web, proporcionando:

✔️ Tipagem estática para maior segurança e controle  
✔️ Organização modular do código  
✔️ Manipulação eficiente do DOM  
✔️ Persistência local dos dados  

💡 **Agora você tem um gerenciador de processos judiciais interativo e pronto para ser aprimorado!** 🚀