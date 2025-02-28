<template>
  <div class="home">
    <h1>Gerenciamento de Locais</h1>
    <CadastrarLocal @local-cadastrado="carregarLocais" />
    <ListaLocais :locais="locais" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import CadastrarLocal from '../components/CadastrarLocal.vue';
import ListaLocais from '../components/ListaLocais.vue';
import { db } from '../utils/DexieDB';

export default defineComponent({
  name: 'HomeView',
  components: {
    CadastrarLocal,
    ListaLocais,
  },
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
      carregarLocais,
    };
  },
});
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  text-align: center;
}
</style>