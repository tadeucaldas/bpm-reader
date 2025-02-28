<template>
  <div class="lista-locais">
    <h2>Locais Cadastrados</h2>
    <ul>
      <li v-for="local in locais" :key="local.id">
        <router-link :to="`/detalhes/${local.id}`">
          {{ local.nome }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { db } from '../utils/DexieDB';

export default defineComponent({
  name: 'ListaLocais',
  setup() {
    const locais = ref<any[]>([]);

    const carregarLocais = async () => {
      locais.value = await db.locais.toArray();
    };

    // Carrega os locais ao montar o componente
    onMounted(() => {
      carregarLocais();
    });

    return {
      locais,
    };
  },
});
</script>

<style scoped>
.lista-locais ul {
  list-style-type: none;
  padding: 0;
}

.lista-locais li {
  margin: 10px 0;
}

.lista-locais a {
  text-decoration: none;
  color: #42b983;
}

.lista-locais a:hover {
  text-decoration: underline;
}
</style>