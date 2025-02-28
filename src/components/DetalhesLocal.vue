<template>
  <div class="detalhes-local">
    <h2>Itens do Local: {{ local.nome }}</h2>
    <table v-if="local.planilha && local.planilha.length > 0">
      <thead>
        <tr>
          <th v-for="(col, index) in colunas" :key="index">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in local.planilha" :key="index">
          <td v-for="(col, index) in colunas" :key="index">{{ item[col] }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>Nenhum item encontrado na planilha.</p>
    <router-link to="/">Voltar</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { db } from '../utils/DexieDB';

export default defineComponent({
  name: 'DetalhesLocal',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const local = ref<any>({});
    const colunas = ref<string[]>([]);

    const carregarLocal = async () => {
      const localEncontrado = await db.locais.get(Number(props.id));
      console.info(localEncontrado);
      if (localEncontrado) {
        local.value = localEncontrado;

        // Extrai as colunas da planilha (usando o primeiro item como referência)
        if (localEncontrado.planilha && localEncontrado.planilha.length > 0) {
          colunas.value = Object.keys(localEncontrado.planilha[0]);
        }
      }
    };

    // Carrega os dados ao montar o componente
    onMounted(() => {
      carregarLocal();
    });

    return {
      local,
      colunas,
    };
  },
});
</script>

<style scoped>
.detalhes-local {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  text-align: center;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background-color: #f4f4f4;
}

p {
  text-align: center;
  color: #888;
}

a {
  display: block;
  text-align: center;
  color: #42b983;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>