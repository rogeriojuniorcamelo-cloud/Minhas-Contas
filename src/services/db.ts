/**
 * Serviço de Banco de Dados Local com IndexedDB para o aplicativo Minhas Contas
 * 100% gratuito, local, sem dependências externas e persistente entre sessões.
 */

import { Expense } from '../types/expense';
import { generateInstallments, getTodayString } from '../utils/dateUtils';

const DB_NAME = 'MinhasContasDB';
const DB_VERSION = 1;
const STORE_NAME = 'despesas';

let dbInstance: IDBDatabase | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('dueDate', 'dueDate', { unique: false });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('Erro ao abrir IndexedDB:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Retorna todas as despesas cadastradas
 */
export async function getAllExpenses(): Promise<Expense[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as Expense[]);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Salva ou atualiza uma despesa no IndexedDB
 */
export async function saveExpense(expense: Expense): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(expense);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Remove uma despesa por ID
 */
export async function deleteExpense(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Limpa todas as despesas cadastradas
 */
export async function clearAllExpenses(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Exporta todos os dados do banco para JSON formatado
 */
export async function exportBackupJSON(): Promise<string> {
  const expenses = await getAllExpenses();
  const backupData = {
    app: 'Minhas Contas',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    totalRecords: expenses.length,
    expenses,
  };
  return JSON.stringify(backupData, null, 2);
}

/**
 * Importa despesas a partir de um JSON de backup
 */
export async function importBackupJSON(
  jsonString: string,
  mode: 'replace' | 'merge' = 'replace'
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const parsed = JSON.parse(jsonString);
    const expenses: Expense[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.expenses)
      ? parsed.expenses
      : [];

    if (!expenses || expenses.length === 0) {
      return { success: false, count: 0, error: 'Nenhuma despesa válida encontrada no arquivo.' };
    }

    // Validação básica dos registros
    const validExpenses: Expense[] = expenses.filter(
      (item) => item && typeof item.name === 'string' && typeof item.totalAmount === 'number'
    );

    if (validExpenses.length === 0) {
      return { success: false, count: 0, error: 'O formato do arquivo de backup não é compatível.' };
    }

    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      if (mode === 'replace') {
        store.clear();
      }

      for (const exp of validExpenses) {
        // Assegura campos essenciais
        if (!exp.id) {
          exp.id = 'exp_' + Math.random().toString(36).substring(2, 9);
        }
        if (!exp.installments || exp.installments.length === 0) {
          exp.installments = generateInstallments(
            exp.totalInstallments || 1,
            exp.installmentAmount || exp.totalAmount,
            exp.dueDate || getTodayString(),
            exp.paidInstallments || 0
          );
        }
        store.put(exp);
      }

      transaction.oncomplete = () => {
        resolve({ success: true, count: validExpenses.length });
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      error: 'Erro ao processar o arquivo JSON: ' + (err.message || 'Arquivo corrompido'),
    };
  }
}

/**
 * Inicializa com dados de demonstração caso o banco de dados esteja totalmente vazio
 */
export async function seedSampleDataIfEmpty(): Promise<Expense[]> {
  const existing = await getAllExpenses();
  if (existing.length > 0) {
    return existing;
  }

  const today = getTodayString();
  const [year, month] = today.split('-');
  const currentMonthDue = `${year}-${month}-15`;
  const nextMonthDue = `${year}-${month}-25`;

  const sampleExpenses: Expense[] = [
    {
      id: 'demo-1',
      name: 'Aluguel do Apartamento',
      category: 'moradia',
      type: 'a_vista',
      totalAmount: 1850.0,
      installmentAmount: 1850.0,
      totalInstallments: 1,
      paidInstallments: 0,
      dueDate: `${year}-${month}-10`,
      dueDay: 10,
      notes: 'Transferência Pix para o proprietário até o 5º dia útil.',
      installments: generateInstallments(1, 1850.0, `${year}-${month}-10`, 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      name: 'Notebook Dell Inspiron',
      category: 'cartao',
      type: 'parcelado',
      totalAmount: 3600.0,
      installmentAmount: 360.0,
      totalInstallments: 10,
      paidInstallments: 3,
      dueDate: currentMonthDue,
      dueDay: 15,
      notes: 'Compra parcelada sem juros no cartão de crédito.',
      installments: generateInstallments(10, 360.0, `${year}-${month}-15`, 3),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      name: 'Energia Elétrica (Enel)',
      category: 'moradia',
      type: 'a_vista',
      totalAmount: 245.8,
      installmentAmount: 245.8,
      totalInstallments: 1,
      paidInstallments: 1,
      dueDate: `${year}-${month}-05`,
      dueDay: 5,
      notes: 'Conta do mês de referência já paga com débito automático.',
      installments: generateInstallments(1, 245.8, `${year}-${month}-05`, 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-4',
      name: 'Internet Fibra Óptica 500MB',
      category: 'servicos',
      type: 'a_vista',
      totalAmount: 119.9,
      installmentAmount: 119.9,
      totalInstallments: 1,
      paidInstallments: 0,
      dueDate: nextMonthDue,
      dueDay: 25,
      notes: 'Boleto bancário via e-mail.',
      installments: generateInstallments(1, 119.9, nextMonthDue, 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-5',
      name: 'Curso de Especialização Online',
      category: 'educacao',
      type: 'parcelado',
      totalAmount: 1500.0,
      installmentAmount: 250.0,
      totalInstallments: 6,
      paidInstallments: 2,
      dueDate: `${year}-${month}-20`,
      dueDay: 20,
      notes: 'Formação profissional continuada.',
      installments: generateInstallments(6, 250.0, `${year}-${month}-20`, 2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const exp of sampleExpenses) {
    await saveExpense(exp);
  }

  return sampleExpenses;
}
