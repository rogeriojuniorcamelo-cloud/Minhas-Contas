/**
 * Utilitários de manipulação de datas e cálculo de vencimentos
 */

import { Expense, InstallmentRecord, RecurrenceFrequency } from '../types/expense';

/**
 * Retorna a data atual no formato YYYY-MM-DD considerando fuso local
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna o mês e ano atual no formato YYYY-MM
 */
export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Adiciona N dias a uma data YYYY-MM-DD
 */
export function addDaysToDate(baseDateStr: string, daysToAdd: number): string {
  if (!baseDateStr) return getTodayString();
  const [yearStr, monthStr, dayStr] = baseDateStr.split('-');
  const date = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
  date.setDate(date.getDate() + daysToAdd);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Adiciona N meses a uma data YYYY-MM-DD mantendo o dia de vencimento desejado (originalDueDay)
 * Trata meses menores (ex: dia 31 em fevereiro vira 28 ou 29, em abril vira 30)
 */
export function addMonthsPreservingDay(
  baseDateStr: string,
  monthsToAdd: number,
  desiredDay?: number
): string {
  if (!baseDateStr) return getTodayString();
  const [yearStr, monthStr, dayStr] = baseDateStr.split('-');
  const baseYear = parseInt(yearStr, 10);
  const baseMonth = parseInt(monthStr, 10) - 1; // 0-indexed
  const baseDay = desiredDay || parseInt(dayStr, 10);

  // Calcula novo ano e mês
  const targetDate = new Date(baseYear, baseMonth + monthsToAdd, 1);
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();

  // Quantidade de dias no mês de destino
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const clampedDay = Math.min(baseDay, daysInTargetMonth);

  const finalYear = targetYear;
  const finalMonth = String(targetMonth + 1).padStart(2, '0');
  const finalDay = String(clampedDay).padStart(2, '0');

  return `${finalYear}-${finalMonth}-${finalDay}`;
}

/**
 * Compatibilidade legada para addMonthsToDate
 */
export function addMonthsToDate(baseDateStr: string, monthsToAdd: number): string {
  return addMonthsPreservingDay(baseDateStr, monthsToAdd);
}

/**
 * Calcula a próxima data de recorrência de acordo com a frequência
 */
export function getNextRecurrenceDate(
  currentDateStr: string,
  frequency: RecurrenceFrequency,
  originalDueDay?: number
): string {
  switch (frequency) {
    case 'semanal':
      return addDaysToDate(currentDateStr, 7);
    case 'mensal':
      return addMonthsPreservingDay(currentDateStr, 1, originalDueDay);
    case 'bimestral':
      return addMonthsPreservingDay(currentDateStr, 2, originalDueDay);
    case 'trimestral':
      return addMonthsPreservingDay(currentDateStr, 3, originalDueDay);
    case 'semestral':
      return addMonthsPreservingDay(currentDateStr, 6, originalDueDay);
    case 'anual':
      return addMonthsPreservingDay(currentDateStr, 12, originalDueDay);
    case 'nenhuma':
    default:
      return currentDateStr;
  }
}

/**
 * Gera o array de parcelas com as datas de vencimento mensais
 */
export function generateInstallments(
  totalInstallments: number,
  installmentAmount: number,
  firstDueDate: string,
  paidCount: number = 0
): InstallmentRecord[] {
  const count = Math.max(1, totalInstallments);
  const installments: InstallmentRecord[] = [];
  const today = getTodayString();
  const [yearStr, monthStr, dayStr] = firstDueDate.split('-');
  const desiredDay = parseInt(dayStr, 10);

  for (let i = 1; i <= count; i++) {
    const dueDate = addMonthsPreservingDay(firstDueDate, i - 1, desiredDay);
    const isPaid = i <= paidCount;
    installments.push({
      number: i,
      dueDate,
      amount: installmentAmount,
      isPaid,
      paidDate: isPaid ? today : undefined,
    });
  }

  return installments;
}

/**
 * Calcula o status atual da despesa com base nas parcelas ou vencimento recorrente
 */
export function getExpenseCalculatedStatus(expense: Expense): {
  status: 'paga' | 'pendente' | 'atrasada';
  isDueToday: boolean;
  daysDifference: number; // Negativo se atrasada, 0 se hoje, positivo se futuro
  nextDueDate: string;
  nextInstallmentNumber: number;
} {
  const today = getTodayString();

  // Tratamento específico para despesa Recorrente (cada ocorrência é uma conta individual de período)
  if (expense.type === 'recorrente') {
    const isPaid = expense.paidInstallments >= 1 || (expense.installments?.[0]?.isPaid === true);
    if (isPaid) {
      return {
        status: 'paga',
        isDueToday: false,
        daysDifference: 0,
        nextDueDate: expense.dueDate,
        nextInstallmentNumber: 1,
      };
    }

    const todayDate = new Date(`${today}T00:00:00`);
    const targetDate = new Date(`${expense.dueDate}T00:00:00`);
    const diffTime = targetDate.getTime() - todayDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'atrasada',
        isDueToday: false,
        daysDifference: diffDays,
        nextDueDate: expense.dueDate,
        nextInstallmentNumber: 1,
      };
    }

    if (diffDays === 0) {
      return {
        status: 'pendente',
        isDueToday: true,
        daysDifference: 0,
        nextDueDate: expense.dueDate,
        nextInstallmentNumber: 1,
      };
    }

    return {
      status: 'pendente',
      isDueToday: false,
      daysDifference: diffDays,
      nextDueDate: expense.dueDate,
      nextInstallmentNumber: 1,
    };
  }

  // Despesas À Vista ou Parceladas
  if (expense.paidInstallments >= expense.totalInstallments) {
    return {
      status: 'paga',
      isDueToday: false,
      daysDifference: 0,
      nextDueDate: expense.dueDate,
      nextInstallmentNumber: expense.totalInstallments,
    };
  }

  // Encontra a próxima parcela não paga
  const nextInstallment = expense.installments?.find((inst) => !inst.isPaid);
  const dueDate = nextInstallment ? nextInstallment.dueDate : expense.dueDate;
  const nextNumber = nextInstallment ? nextInstallment.number : expense.paidInstallments + 1;

  const todayDate = new Date(`${today}T00:00:00`);
  const targetDate = new Date(`${dueDate}T00:00:00`);
  const diffTime = targetDate.getTime() - todayDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'atrasada',
      isDueToday: false,
      daysDifference: diffDays,
      nextDueDate: dueDate,
      nextInstallmentNumber: nextNumber,
    };
  }

  if (diffDays === 0) {
    return {
      status: 'pendente',
      isDueToday: true,
      daysDifference: 0,
      nextDueDate: dueDate,
      nextInstallmentNumber: nextNumber,
    };
  }

  return {
    status: 'pendente',
    isDueToday: false,
    daysDifference: diffDays,
    nextDueDate: dueDate,
    nextInstallmentNumber: nextNumber,
  };
}

/**
 * Retorna mensagem descritiva de dias restantes ou de atraso
 */
export function getDueDateBadgeInfo(daysDifference: number, isDueToday: boolean, isPaid: boolean): {
  text: string;
  variant: 'paid' | 'overdue' | 'dueToday' | 'dueSoon' | 'normal';
} {
  if (isPaid) {
    return { text: 'Conta Liquidada', variant: 'paid' };
  }
  if (isDueToday) {
    return { text: 'Vence Hoje!', variant: 'dueToday' };
  }
  if (daysDifference < 0) {
    const days = Math.abs(daysDifference);
    return {
      text: days === 1 ? 'Atrasada há 1 dia' : `Atrasada há ${days} dias`,
      variant: 'overdue',
    };
  }
  if (daysDifference === 1) {
    return { text: 'Vence amanhã', variant: 'dueSoon' };
  }
  if (daysDifference <= 7) {
    return { text: `Vence em ${daysDifference} dias`, variant: 'dueSoon' };
  }
  return { text: `Em ${daysDifference} dias`, variant: 'normal' };
}
