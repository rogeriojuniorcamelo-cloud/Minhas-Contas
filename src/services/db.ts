/**
 * Serviço de Banco de Dados Local com IndexedDB para o aplicativo Minhas Contas
 * 100% gratuito, local, sem dependências externas e persistente entre sessões.
 * Suporta Despesas, Parcelamento, Despesas Recorrentes e Gerenciamento de Categorias.
 * Sem dados de demonstração e sem categorias predefinidas (Melhoria 3).
 */

import {
  Expense,
  CategoryInfo,
  RecurrenceDetails,
} from '../types/expense';
import {
  generateInstallments,
  getTodayString,
  getNextRecurrenceDate,
  addMonthsPreservingDay,
} from '../utils/dateUtils';

const DB_NAME = 'MinhasContasDB';
const DB_VERSION = 2; // Suporte a despesas e categorias dinâmicas
const STORE_EXPENSES = 'despesas';
const STORE_CATEGORIES = 'categorias';

let dbInstance: IDBDatabase | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Object Store de Despesas
      if (!db.objectStoreNames.contains(STORE_EXPENSES)) {
        const store = db.createObjectStore(STORE_EXPENSES, { keyPath: 'id' });
        store.createIndex('dueDate', 'dueDate', { unique: false });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }

      // Object Store de Categorias Dinâmicas
      if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
        const categoryStore = db.createObjectStore(STORE_CATEGORIES, { keyPath: 'id' });
        categoryStore.createIndex('label', 'label', { unique: false });
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

/* ==========================================================================
   LIMPEZA DE DADOS DEMONSTRATIVOS E CATEGORIAS PREDEFINIDAS (MELHORIA 3)
   ========================================================================== */

/**
 * Remove despesas fictícias e categorias predefinidas legadas se existirem no IndexedDB,
 * preservando todas as despesas reais e categorias criadas pelo usuário.
 */
export async function cleanupLegacyDemoData(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_EXPENSES, STORE_CATEGORIES], 'readwrite');
    const expStore = transaction.objectStore(STORE_EXPENSES);
    const catStore = transaction.objectStore(STORE_CATEGORIES);

    // 1. Remove apenas despesas demonstrativas conhecidas
    const expReq = expStore.getAll();
    expReq.onsuccess = () => {
      const allExp = expReq.result as Expense[];
      if (allExp) {
        for (const exp of allExp) {
          const isDemo =
            exp.id.startsWith('demo-') ||
            exp.id.startsWith('rec_grp_aluguel_demo') ||
            exp.id.startsWith('rec_grp_internet_demo') ||
            exp.recurrence?.groupId === 'grp_aluguel_demo' ||
            exp.recurrence?.groupId === 'grp_internet_demo';

          if (isDemo) {
            expStore.delete(exp.id);
          }
        }
      }
    };

    // 2. Remove categorias predefinidas antigas para deixar a lista vazia por padrão
    const catReq = catStore.getAll();
    catReq.onsuccess = () => {
      const allCats = catReq.result as CategoryInfo[];
      const legacyCategoryIds = [
        'moradia',
        'alimentacao',
        'transporte',
        'cartao',
        'saude',
        'educacao',
        'servicos',
        'lazer',
        'outros',
      ];

      if (allCats) {
        for (const cat of allCats) {
          // Remove as categorias que vieram pré-instaladas de fábrica
          if (cat.isDefault === true || legacyCategoryIds.includes(cat.id)) {
            catStore.delete(cat.id);
          }
        }
      }
    };

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

/* ==========================================================================
   GERENCIAMENTO DE CATEGORIAS (MELHORIA 2 & 3)
   ========================================================================== */

/**
 * Retorna todas as categorias cadastradas (inicia vazia [])
 */
export async function getAllCategories(): Promise<CategoryInfo[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_CATEGORIES, 'readonly');
    const store = transaction.objectStore(STORE_CATEGORIES);
    const request = store.getAll();

    request.onsuccess = () => {
      const categories = request.result as CategoryInfo[];
      resolve(categories || []);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Salva ou atualiza uma categoria criada pelo usuário
 */
export async function saveCategory(category: CategoryInfo): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_CATEGORIES, 'readwrite');
    const store = transaction.objectStore(STORE_CATEGORIES);
    const request = store.put(category);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Verifica quantas despesas utilizam uma determinada categoria
 */
export async function checkCategoryUsage(categoryId: string): Promise<number> {
  const expenses = await getAllExpenses();
  return expenses.filter((exp) => exp.category === categoryId).length;
}

/**
 * Exclui uma categoria. Se houver despesas associadas, reclassifica para replacementCategoryId
 */
export async function deleteCategory(
  categoryId: string,
  replacementCategoryId?: string
): Promise<{ success: boolean; updatedExpensesCount: number }> {
  const db = await openDatabase();
  const allExpenses = await getAllExpenses();
  const affectedExpenses = allExpenses.filter((e) => e.category === categoryId);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_CATEGORIES, STORE_EXPENSES], 'readwrite');
    const catStore = transaction.objectStore(STORE_CATEGORIES);
    const expStore = transaction.objectStore(STORE_EXPENSES);

    // Se houver despesas vinculadas e categoria substituta fornecida, reclassifica
    if (affectedExpenses.length > 0 && replacementCategoryId) {
      for (const exp of affectedExpenses) {
        exp.category = replacementCategoryId;
        exp.updatedAt = new Date().toISOString();
        expStore.put(exp);
      }
    } else if (affectedExpenses.length > 0 && !replacementCategoryId) {
      // Se não houver substituta, deixa temporariamente sem categoria
      for (const exp of affectedExpenses) {
        exp.category = undefined;
        exp.updatedAt = new Date().toISOString();
        expStore.put(exp);
      }
    }

    catStore.delete(categoryId);

    transaction.oncomplete = () => {
      resolve({ success: true, updatedExpensesCount: affectedExpenses.length });
    };

    transaction.onerror = () => reject(transaction.error);
  });
}

/* ==========================================================================
   GERENCIAMENTO DE DESPESAS
   ========================================================================== */

/**
 * Retorna todas as despesas cadastradas
 */
export async function getAllExpenses(): Promise<Expense[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_EXPENSES, 'readonly');
    const store = transaction.objectStore(STORE_EXPENSES);
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
    const transaction = db.transaction(STORE_EXPENSES, 'readwrite');
    const store = transaction.objectStore(STORE_EXPENSES);
    const request = store.put(expense);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Remove uma despesa por ID
 */
export async function deleteExpense(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_EXPENSES, 'readwrite');
    const store = transaction.objectStore(STORE_EXPENSES);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Limpa todas as despesas cadastradas
 */
export async function clearAllExpenses(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_EXPENSES, 'readwrite');
    const store = transaction.objectStore(STORE_EXPENSES);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/* ==========================================================================
   DESPESAS RECORRENTES (MELHORIA 1)
   ========================================================================== */

/**
 * Sincroniza e gera os lançamentos futuros de despesas recorrentes
 * Garante que:
 * 1. Não gera despesas duplicadas (checa groupId + dueDate)
 * 2. Não altera despesas de meses anteriores ou já pagas
 * 3. Trata corretamente meses menores como fevereiro
 * 4. Gera lançamentos até o horizonte definido (12 meses para frente ou endDate)
 */
export async function syncRecurringExpenses(): Promise<number> {
  const allExpenses = await getAllExpenses();
  const recurringTemplates = allExpenses.filter(
    (exp) => exp.type === 'recorrente' && exp.recurrence && !exp.recurrence.isInterrupted
  );

  if (recurringTemplates.length === 0) {
    return 0;
  }

  // Agrupa por recurrence.groupId para pegar o template mais atualizado
  const seriesMap = new Map<string, Expense>();
  for (const exp of recurringTemplates) {
    const gId = exp.recurrence!.groupId;
    const existing = seriesMap.get(gId);
    if (!existing || new Date(exp.updatedAt) > new Date(existing.updatedAt)) {
      seriesMap.set(gId, exp);
    }
  }

  const today = getTodayString();
  const horizonDate = addMonthsPreservingDay(today, 12);
  let newGeneratedCount = 0;

  for (const [groupId, template] of seriesMap.entries()) {
    const recurrence = template.recurrence!;
    const frequency = recurrence.frequency;
    if (frequency === 'nenhuma') continue;

    // Busca todas as ocorrências existentes deste groupId
    const occurrences = allExpenses.filter(
      (e) => e.type === 'recorrente' && e.recurrence?.groupId === groupId
    );
    const existingDueDates = new Set(occurrences.map((o) => o.dueDate));

    const dueDay = recurrence.dueDay || template.dueDay || parseInt(template.dueDate.split('-')[2] || '1', 10);
    let iterDate = recurrence.startDate;

    let loopSafety = 0;
    const maxIterations = frequency === 'semanal' ? 60 : 24;

    while (iterDate <= horizonDate && loopSafety < maxIterations) {
      loopSafety++;

      if (recurrence.endDate && iterDate > recurrence.endDate) {
        break;
      }

      if (!existingDueDates.has(iterDate)) {
        const newOccurrence: Expense = {
          id: `rec_${groupId}_${iterDate.replace(/-/g, '')}`,
          name: template.name,
          category: template.category,
          type: 'recorrente',
          totalAmount: template.totalAmount,
          installmentAmount: template.totalAmount,
          totalInstallments: 1,
          paidInstallments: 0,
          dueDate: iterDate,
          dueDay: dueDay,
          notes: template.notes,
          installments: [
            {
              number: 1,
              dueDate: iterDate,
              amount: template.totalAmount,
              isPaid: false,
            },
          ],
          recurrence: {
            ...recurrence,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await saveExpense(newOccurrence);
        existingDueDates.add(iterDate);
        newGeneratedCount++;
      }

      const nextDate = getNextRecurrenceDate(iterDate, frequency, dueDay);
      if (nextDate <= iterDate) break;
      iterDate = nextDate;
    }
  }

  return newGeneratedCount;
}

/**
 * Atualiza um lançamento recorrente
 */
export async function updateRecurringExpense(
  expense: Expense,
  scope: 'single' | 'future_all'
): Promise<void> {
  if (scope === 'single' || !expense.recurrence?.groupId) {
    await saveExpense(expense);
    return;
  }

  const groupId = expense.recurrence.groupId;
  const allExpenses = await getAllExpenses();
  const futureOccurrences = allExpenses.filter(
    (e) =>
      e.type === 'recorrente' &&
      e.recurrence?.groupId === groupId &&
      e.dueDate >= expense.dueDate &&
      e.paidInstallments === 0
  );

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_EXPENSES, 'readwrite');
    const store = transaction.objectStore(STORE_EXPENSES);

    store.put(expense);

    for (const item of futureOccurrences) {
      if (item.id === expense.id) continue;
      const updated: Expense = {
        ...item,
        name: expense.name,
        category: expense.category,
        totalAmount: expense.totalAmount,
        installmentAmount: expense.totalAmount,
        notes: expense.notes,
        installments: [
          {
            number: 1,
            dueDate: item.dueDate,
            amount: expense.totalAmount,
            isPaid: false,
          },
        ],
        recurrence: {
          ...item.recurrence!,
          frequency: expense.recurrence!.frequency,
          endDate: expense.recurrence!.endDate,
          dueDay: expense.recurrence!.dueDay,
        },
        updatedAt: new Date().toISOString(),
      };
      store.put(updated);
    }

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Interrompe uma recorrência preservando os lançamentos anteriores e pagamentos
 */
export async function interruptRecurrence(
  groupId: string,
  interruptionDate: string = getTodayString()
): Promise<{ preservedCount: number; removedCount: number }> {
  const allExpenses = await getAllExpenses();
  const seriesExpenses = allExpenses.filter(
    (e) => e.type === 'recorrente' && e.recurrence?.groupId === groupId
  );

  const db = await openDatabase();
  let preservedCount = 0;
  let removedCount = 0;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_EXPENSES, 'readwrite');
    const store = transaction.objectStore(STORE_EXPENSES);

    for (const exp of seriesExpenses) {
      const isPaid = exp.paidInstallments > 0 || exp.installments?.[0]?.isPaid;
      if (exp.dueDate <= interruptionDate || isPaid) {
        exp.recurrence = {
          ...exp.recurrence!,
          isInterrupted: true,
          interruptedAt: interruptionDate,
        };
        exp.updatedAt = new Date().toISOString();
        store.put(exp);
        preservedCount++;
      } else {
        store.delete(exp.id);
        removedCount++;
      }
    }

    transaction.oncomplete = () => {
      resolve({ preservedCount, removedCount });
    };

    transaction.onerror = () => reject(transaction.error);
  });
}

/* ==========================================================================
   BACKUP & RESTORE COM SUPORTE A CATEGORIAS
   ========================================================================== */

/**
 * Exporta todos os dados (despesas e categorias) para JSON
 */
export async function exportBackupJSON(): Promise<string> {
  const expenses = await getAllExpenses();
  const categories = await getAllCategories();
  const backupData = {
    app: 'Minhas Contas',
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    totalRecords: expenses.length,
    expenses,
    categories,
  };
  return JSON.stringify(backupData, null, 2);
}

/**
 * Importa dados a partir de JSON
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

    const categories: CategoryInfo[] = Array.isArray(parsed.categories) ? parsed.categories : [];

    if (!expenses || expenses.length === 0) {
      return { success: false, count: 0, error: 'Nenhuma despesa válida encontrada no arquivo.' };
    }

    const validExpenses: Expense[] = expenses.filter(
      (item) => item && typeof item.name === 'string' && typeof item.totalAmount === 'number'
    );

    if (validExpenses.length === 0) {
      return { success: false, count: 0, error: 'O formato do arquivo de backup não é compatível.' };
    }

    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_EXPENSES, STORE_CATEGORIES], 'readwrite');
      const expStore = transaction.objectStore(STORE_EXPENSES);
      const catStore = transaction.objectStore(STORE_CATEGORIES);

      if (mode === 'replace') {
        expStore.clear();
      }

      if (categories.length > 0) {
        if (mode === 'replace') {
          catStore.clear();
        }
        for (const cat of categories) {
          if (cat && cat.id && cat.label) {
            catStore.put(cat);
          }
        }
      }

      for (const exp of validExpenses) {
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
        expStore.put(exp);
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
