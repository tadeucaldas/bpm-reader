<template>
    <div class="upload-planilha">
      <input type="file" @change="handleFileUpload" accept=".xlsx, .xls, .csv" />
    </div>
</template>
  
<script lang="ts">
  import { defineComponent } from 'vue';
  import * as XLSX from 'xlsx';
  import { db } from '../utils/DexieDB';
  
  export default defineComponent({
    name: 'UploadPlanilha',
    emits: ['upload-success'],
    setup(props, { emit }) {
      const handleFileUpload = async (event: Event) => {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
          const file = input.files[0];
          const reader = new FileReader();
  
          reader.onload = async (e: ProgressEvent<FileReader>) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
  
            // Converter a planilha para JSON
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
            // A primeira linha é o cabeçalho (nomes das colunas)
            const [header, ...rows] = json;
  
            // Mapear as linhas para objetos com as colunas como chaves
            const formattedData = rows.map((row: any[]) => {
              const obj: { [key: string]: any } = {};
              header.forEach((col: string, index: number) => {
                obj[col] = row[index];
              });
              return obj;
            });
  
            // Salvar os dados no Dexie
            await db.planilha.bulkAdd(formattedData);
  
            // Emitir evento de sucesso
            emit('upload-success');
          };
  
          reader.readAsArrayBuffer(file);
        }
      };
  
      return {
        handleFileUpload,
      };
    },
  });
</script>
  
<style scoped>
  .upload-planilha {
    margin-bottom: 20px;
  }
</style>