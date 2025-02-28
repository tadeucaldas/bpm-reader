<template>
  <div class="detalhes-view">
    <h2>Itens do Local: {{ local.nome }}</h2>

    <!-- Botão para escanear QRCode -->
    <div class="qr-code-scanner">
      <button @click="iniciarScanner">Escanear QRCode</button>
      <qrcode-stream
        v-if="scannerAtivo"
        @detect="onDetect"
        @init="onInit"
        :track="paintBoundingBox"
      />
    </div>

    <!-- Campo de pesquisa -->
    <div class="pesquisa">
      <input
        v-model="termoPesquisa"
        placeholder="Pesquisar nas três primeiras colunas..."
      />
    </div>

    <!-- Tabela de itens -->
    <table v-if="itensFiltrados.length > 0">
      <thead>
        <tr>
          <th v-for="(col, index) in colunas" :key="index">{{ col }}</th>
          <th>Verificado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in itensPaginados" :key="index">
          <td v-for="(col, index) in colunas" :key="index">{{ item[col] }}</td>
          <td>
            <button
              :class="['toggle', { verificado: item.verificado }]"
              @click="abrirPopupVerificacao(item)"
            >
              {{ item.verificado ? 'Sim' : 'Não' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Nenhum item encontrado.</p>

    <!-- Paginação -->
    <div class="paginacao">
      <button :disabled="paginaAtual === 1" @click="paginaAnterior">
        Anterior
      </button>
      <span>Página {{ paginaAtual }} de {{ totalPaginas }}</span>
      <button
        :disabled="paginaAtual === totalPaginas"
        @click="proximaPagina"
      >
        Próxima
      </button>
    </div>

    <!-- Popup de confirmação -->
    <div v-if="popupVisivel" class="popup-overlay">
      <div class="popup">
        <h3>Confirmar Verificação</h3>
        <p>Deseja marcar o item como verificado?</p>
        <textarea
          v-model="observacoes"
          placeholder="Digite observações (opcional)"
        ></textarea>
        <div class="popup-botoes">
          <button @click="confirmarVerificacao">Confirmar</button>
          <button @click="fecharPopup">Cancelar</button>
        </div>
      </div>
    </div>

    <router-link to="/">Voltar</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { db } from '../utils/DexieDB';
import { QrcodeStream } from 'vue-qrcode-reader';

export default defineComponent({
  name: 'DetalhesView',
  components: {
    QrcodeStream,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const local = ref<any>({});
    const colunas = ref<string[]>([]);
    const termoPesquisa = ref<string>('');
    const itensPorPagina = ref<number>(10); // Itens por página
    const paginaAtual = ref<number>(1); // Página atual
    const scannerAtivo = ref<boolean>(false); // Controle do scanner de QRCode
    const popupVisivel = ref<boolean>(false); // Controle do popup de confirmação
    const observacoes = ref<string>(''); // Campo de observações
    const itemParaVerificar = ref<any>(null); // Item selecionado para verificação

    // Carrega os dados do local
    const carregarLocal = async () => {
      const localEncontrado = await db.locais.get(Number(props.id));
      if (localEncontrado) {
        local.value = localEncontrado;

        // Extrai as colunas da planilha (usando o primeiro item como referência)
        if (localEncontrado.planilha && localEncontrado.planilha.length > 0) {
          colunas.value = Object.keys(localEncontrado.planilha[0]);
        }
      }
    };

    // Filtra os itens com base no termo de pesquisa (nas três primeiras colunas)
    const itensFiltrados = computed(() => {
      if (!local.value.planilha) return [];

      return local.value.planilha.filter((item: any) => {
        const colunasPesquisaveis = colunas.value.slice(0, 3); // Apenas as três primeiras colunas
        return colunasPesquisaveis.some((col) =>
          String(item[col]).toLowerCase().includes(termoPesquisa.value.toLowerCase())
        );
      });
    });

    // Lógica de paginação
    const itensPaginados = computed(() => {
      const inicio = (paginaAtual.value - 1) * itensPorPagina.value;
      const fim = inicio + itensPorPagina.value;
      return itensFiltrados.value.slice(inicio, fim);
    });

    const totalPaginas = computed(() => {
      return Math.ceil(itensFiltrados.value.length / itensPorPagina.value);
    });

    const proximaPagina = () => {
      if (paginaAtual.value < totalPaginas.value) {
        paginaAtual.value++;
      }
    };

    const paginaAnterior = () => {
      if (paginaAtual.value > 1) {
        paginaAtual.value--;
      }
    };

    // Abre o popup de confirmação
    const abrirPopupVerificacao = (item: any) => {
      itemParaVerificar.value = item;
      popupVisivel.value = true;
    };

    // Fecha o popup de confirmação
    const fecharPopup = () => {
      popupVisivel.value = false;
      observacoes.value = '';
      itemParaVerificar.value = null;
    };

    // Confirma a verificação do item
    const confirmarVerificacao = async () => {
      if (itemParaVerificar.value) {
        itemParaVerificar.value.verificado = true;
        itemParaVerificar.value.dataVerificacao = new Date().toISOString(); // Data/hora atual
        itemParaVerificar.value.observacoes = observacoes.value; // Observações

        local.value.planilha = local.value.planilha.map((item: any) => {
          if (item.username === itemParaVerificar.value.username) {
            return itemParaVerificar.value;
          }
          return item;
        });

        console.info(local.value.planilha);

        // Atualiza o item no IndexedDB
        await db.locais.update(Number(props.id), {
          planilha: JSON.parse(JSON.stringify(local.value.planilha)),
        });

        fecharPopup();
      }
    };

    // Inicia o scanner de QRCode
    const iniciarScanner = () => {
      scannerAtivo.value = true;
    };

    // Callback quando um QRCode é detectado
    const onDetect = (detectedCodes: any[]) => {
      if (detectedCodes.length > 0) {
        const resultado = detectedCodes[0].rawValue; // Valor do QRCode detectado
        scannerAtivo.value = false; // Desativa o scanner após a leitura

        // Procura o item correspondente ao valor do QRCode nas três primeiras colunas
        const itemEncontrado = local.value.planilha.find((item: any) => {
          const colunasPesquisaveis = colunas.value.slice(0, 3); // Apenas as três primeiras colunas
          return colunasPesquisaveis.some((col) => String(item[col]) === resultado);
        });

        if (itemEncontrado) {
          abrirPopupVerificacao(itemEncontrado);
        } else {
          alert('Nenhum item correspondente encontrado.');
        }
      }
    };

    // Callback para inicialização do scanner
    const onInit = async (promise: Promise<any>) => {
      try {
        await promise;
      } catch (error) {
        console.error('Erro ao inicializar o scanner de QRCode:', error);
        alert('Erro ao acessar a câmera. Verifique as permissões.');
      }
    };

    // Função para desenhar a caixa de rastreamento ao redor do QRCode
    const paintBoundingBox = (detectedCodes: any, ctx: CanvasRenderingContext2D) => {
      for (const detectedCode of detectedCodes) {
        const [firstPoint, ...otherPoints] = detectedCode.cornerPoints;

        ctx.strokeStyle = '#FF3C58'; // Cor da borda
        ctx.lineWidth = 4; // Espessura da borda

        ctx.beginPath();
        ctx.moveTo(firstPoint.x, firstPoint.y);
        for (const { x, y } of otherPoints) {
          ctx.lineTo(x, y);
        }
        ctx.lineTo(firstPoint.x, firstPoint.y);
        ctx.closePath();
        ctx.stroke();
      }
    };

    // Carrega os dados ao montar o componente
    onMounted(() => {
      carregarLocal();
    });

    return {
      local,
      colunas,
      termoPesquisa,
      itensFiltrados,
      itensPaginados,
      paginaAtual,
      totalPaginas,
      proximaPagina,
      paginaAnterior,
      scannerAtivo,
      iniciarScanner,
      onDetect,
      onInit,
      paintBoundingBox,
      popupVisivel,
      observacoes,
      abrirPopupVerificacao,
      fecharPopup,
      confirmarVerificacao,
    };
  },
});
</script>

<style scoped>
.detalhes-view {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  text-align: center;
}

.qr-code-scanner {
  margin-bottom: 20px;
}

.qr-code-scanner button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.qr-code-scanner button:hover {
  background-color: #3aa876;
}

.pesquisa {
  margin-bottom: 20px;
}

.pesquisa input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f4f4f4;
}

.toggle {
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.toggle.verificado {
  background-color: #42b983;
  color: white;
}

.paginacao {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.paginacao button {
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  background-color: #42b983;
  color: white;
  border-radius: 4px;
}

.paginacao button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
}

.popup h3 {
  margin-top: 0;
}

.popup textarea {
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.popup-botoes {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.popup-botoes button {
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.popup-botoes button:first-child {
  background-color: #42b983;
  color: white;
}

.popup-botoes button:last-child {
  background-color: #f0f0f0;
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