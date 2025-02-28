<template>
    <div class="cadastrar-local">
      <h2>Cadastrar Local</h2>
      <form @submit.prevent="cadastrarLocal">
        <div>
          <label for="nome">Nome do Local:</label>
          <input id="nome" v-model="nome" type="text" required />
        </div>
        <div>
          <label for="planilha">Planilha:</label>
          <input id="planilha" type="file" @change="handleFileUpload" accept=".xlsx, .xls, .csv" required />
        </div>
        <button type="submit">Cadastrar</button>
      </form>
    </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import * as XLSX from 'xlsx';
  import { db } from '../utils/DexieDB';
  
  export default defineComponent({
    name: 'CadastrarLocal',
    emits: ['local-cadastrado'],
    setup(props, { emit }) {
      const nome = ref<string>('');
      const planilha = ref<any[]>([]);
  
      const handleFileUpload = (event: Event) => {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
          const file = input.files[0];
          const reader = new FileReader();
  
          reader.onload = (e: ProgressEvent<FileReader>) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
            // A primeira linha é o cabeçalho (nomes das colunas)
            const [header, ...rows] = json;
  
            // Mapear as linhas para objetos com as colunas como chaves
            planilha.value = rows.map((row: any[]) => {
              const obj: { [key: string]: any } = {};
              header.forEach((col: string, index: number) => {
                obj[col] = row[index];
              });
              return obj;
            });
  
            console.log('Planilha carregada:', planilha.value); // Debug: Verifique se a planilha foi carregada
          };
  
          reader.readAsArrayBuffer(file);
        }
      };
  
      const cadastrarLocal = async () => {
        if (!nome.value || planilha.value.length === 0) {
          alert('Preencha o nome do local e carregue uma planilha.');
          return;
        }
  
        // Garantir que os dados da planilha sejam serializáveis
        const planilhaSerializada = JSON.parse(JSON.stringify(planilha.value));
  
        const novoLocal = {
          nome: nome.value,
          planilha: planilhaSerializada, // Usar a versão serializada
        };
  
        try {
          // Salva o local no banco de dados
          await db.locais.add(novoLocal);
  
          // Limpa o formulário
          nome.value = '';
          planilha.value = [];
  
          // Emite evento para atualizar a lista de locais
          emit('local-cadastrado');
        } catch (error) {
          console.error('Erro ao salvar local:', error);
          alert('Erro ao salvar local. Verifique o console para mais detalhes.');
        }
      };
  
      return {
        nome,
        handleFileUpload,
        cadastrarLocal,
      };
    },
  });
</script>
  
<style scoped>
  .cadastrar-local {
    margin-bottom: 20px;
  }
  
  form div {
    margin-bottom: 10px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
  }
  
  input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
  }
  
  button {
    padding: 10px 20px;
    background-color: #42b983;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #3aa876;
  }
</style>