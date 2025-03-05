<template>
  <div class="home">
    <h1>Gerenciamento de Locais</h1>

    <!-- Botão de instalação da PWA -->
    <button v-if="mostrarBotaoInstalar" @click="instalarPWA" class="botao-instalar">
      Instalar App
    </button>

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
    const mostrarBotaoInstalar = ref<boolean>(false); // Controla a visibilidade do botão de instalação
    const deferredPrompt = ref<any>(null); // Armazena o evento de instalação

    // Carrega os dados do local
    const carregarLocais = async () => {
      locais.value = await db.locais.toArray();
    };

    // Adiciona o listener para o evento beforeinstallprompt
    onMounted(() => {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault(); // Impede o prompt automático de instalação
        deferredPrompt.value = e; // Armazena o evento para uso posterior
        mostrarBotaoInstalar.value = true; // Mostra o botão de instalação
      });
    });

    // Função para instalar a PWA
    const instalarPWA = async () => {
      if (deferredPrompt.value) {
        deferredPrompt.value.prompt(); // Mostra o prompt de instalação
        const { outcome } = await deferredPrompt.value.userChoice; // Aguarda a escolha do usuário
        if (outcome === 'accepted') {
          console.log('PWA instalado com sucesso!');
        } else {
          console.log('Instalação cancelada pelo usuário.');
        }
        deferredPrompt.value = null; // Limpa o evento
        mostrarBotaoInstalar.value = false; // Oculta o botão de instalação
      }
    };

    // Carrega os locais ao montar o componente
    onMounted(() => {
      carregarLocais();
    });

    return {
      locais,
      carregarLocais,
      mostrarBotaoInstalar,
      instalarPWA,
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

.botao-instalar {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.botao-instalar:hover {
  background-color: #3aa876;
}
</style>