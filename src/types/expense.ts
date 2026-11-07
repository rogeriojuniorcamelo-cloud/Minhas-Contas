/**
 * Tipos e Interfaces para o Aplicativo Minhas Contas
 */

export type ExpenseType = 'a_vista' | 'parcelado' | 'recorrente';

export type ExpenseStatus = 'paga' | 'pendente' | 'atrasada';

export type RecurrenceFrequency =
  | 'nenhuma'
  | 'semanal'
  | 'mensal'
  | 'bimestral'
  | 'trimestral'
  | 'semestral'
  | 'anual';

export const RECURRENCE_LABELS: Record<RecurrenceFrequency, string> = {
  nenhuma: 'Não repetir',
  semanal: 'Semanalmente',
  mensal: 'Mensalmente',
  bimestral: 'A cada 2 meses',
  trimestral: 'A cada 3 meses',
  semestral: 'A cada 6 meses',
  anual: 'Anualmente',
};

export interface RecurrenceDetails {
  frequency: RecurrenceFrequency;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (opcional)
  dueDay: number; // 1-31
  groupId: string; // Identificador da série recorrente
  isInterrupted?: boolean;
  interruptedAt?: string; // YYYY-MM-DD
}

export interface InstallmentRecord {
  number: number;
  dueDate: string; // YYYY-MM-DD
  amount: number;
  isPaid: boolean;
  paidDate?: string; // YYYY-MM-DD
}

export interface Expense {
  id: string;
  name: string;
  category?: string; // ID da categoria personalizada (opcional, pode ser vazio ou indefinido)
  type: ExpenseType;
  totalAmount: number;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  dueDate: string; // YYYY-MM-DD (data de vencimento deste lançamento)
  dueDay: number; // dia do mês (1-31)
  notes?: string;
  installments: InstallmentRecord[];
  createdAt: string;
  updatedAt: string;
  // Detalhes de recorrência
  recurrence?: RecurrenceDetails;
}

export interface CategoryInfo {
  id: string;
  label: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  isDefault?: boolean;
  createdAt?: string;
}

// Lista de categorias predefinidas removida conforme Melhoria 3 (começa vazia)
export const DEFAULT_CATEGORIES: CategoryInfo[] = [];

export const CATEGORIES: Record<string, CategoryInfo> = {};

export interface ExpenseFiltersState {
  search: string;
  category: string | 'todas';
  status: ExpenseStatus | 'todas' | 'vence_hoje';
  monthYear: string; // YYYY-MM ou 'todos'
  sortBy: 'dueDate_asc' | 'dueDate_desc' | 'amount_desc' | 'amount_asc' | 'name_asc';
  typeFilter?: ExpenseType | 'todos';
}

export interface FinancialSummaryData {
  totalExpensesCount: number;
  totalExpensesAmount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
  totalRemainingInstallments: number;
  overdueCount: number;
  overdueAmount: number;
  dueSoonCount: number; // Próximos 7 dias
  dueSoonAmount: number;
  dueTodayCount: number;
  dueTodayAmount: number;
}
