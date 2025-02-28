import Dexie from 'dexie';

// Define a estrutura do Local
export interface PlanilhaItem {
  [key: string]: any; // Colunas dinâmicas da planilha
  verificado?: boolean; // Indica se o item foi verificado
  dataVerificacao?: string; // Data/hora da verificação
  observacoes?: string; // Observações da verificação
}

export interface Local {
  id?: number; // Auto-incremento
  nome: string;
  planilha: PlanilhaItem[]; // Armazena os dados da planilha
}

// Cria uma classe que estende Dexie
export class DexieDB extends Dexie {
  public locais: Dexie.Table<Local, number>;

  constructor() {
    super('LocaisDB'); // Nome do banco de dados

    // Define a estrutura do banco de dados
    this.version(1).stores({
      locais: '++id, nome', // '++id' significa auto-incremento
    });

    // Tipagem para a tabela
    this.locais = this.table('locais');
  }
}

// Instância única do banco de dados
export const db = new DexieDB();