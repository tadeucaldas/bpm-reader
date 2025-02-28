<template>
    <div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th v-for="(col, index) in columns" :key="index">
              {{ col }}
              <!-- Adiciona um campo de filtro para a coluna "username" -->
              <input
                v-if="col === 'username'"
                v-model="filtroUsername"
                placeholder="Filtrar por username"
                @input="filtrarDados"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in dadosFiltrados" :key="item.id">
            <td>{{ item.id }}</td>
            <td v-for="(col, index) in columns" :key="index">{{ item[col] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted, computed } from 'vue';
  import { db } from '../utils/DexieDB';
  
  export default defineComponent({
    name: 'ExibirDados',
    setup() {
      const data = ref<any[]>([]); // Dados brutos carregados do banco de dados
      const columns = ref<string[]>([]); // Colunas dinâmicas
      const filtroUsername = ref<string>(''); // Valor do filtro para o campo "username"
  
      // Carrega os dados do banco de dados
      const loadData = async () => {
        data.value = await db.planilha.toArray();
  
        // Extrai as colunas dinâmicas do primeiro item (se existir)
        if (data.value.length > 0) {
          columns.value = Object.keys(data.value[0]).filter((key) => key !== 'id');
        }
      };
  
      // Filtra os dados com base no valor do campo "username"
      const dadosFiltrados = computed(() => {
        if (!filtroUsername.value) {
          return data.value; // Retorna todos os dados se não houver filtro
        }
        return data.value.filter((item) =>
          item.username.toLowerCase().includes(filtroUsername.value.toLowerCase())
        );
      });
  
      // Carregar dados quando o componente for montado
      onMounted(() => {
        loadData();
      });
  
      return {
        data,
        columns,
        filtroUsername,
        dadosFiltrados,
      };
    },
  });
  </script>
  
  <style scoped>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  
  th {
    background-color: #f4f4f4;
  }
  
  input {
    width: 100%;
    padding: 4px;
    box-sizing: border-box;
  }
  </style>