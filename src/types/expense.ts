/**
 * Tipos e Interfaces para o Aplicativo Minhas Contas
 */

export type ExpenseCategory =
  | 'moradia'
  | 'alimentacao'
  | 'transporte'
  | 'saude'
  | 'educacao'
  | 'lazer'
  | 'cartao'
  | 'servicos'
  | 'outros';

export type ExpenseType = 'a_vista' | 'parcelado';

export type ExpenseStatus = 'paga' | 'pendente' | 'atrasada';

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
  category: ExpenseCategory;
  type: ExpenseType;
  totalAmount: number;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  dueDate: string; // YYYY-MM-DD (data base ou próximo vencimento)
  dueDay: number; // dia do mês (1-31)
  notes?: string;
  installments: InstallmentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInfo {
  id: ExpenseCategory;
  label: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const CATEGORIES: Record<ExpenseCategory, CategoryInfo> = {
  moradia: {
    id: 'moradia',
    label: 'Moradia (Aluguel, Luz, Água)',
    iconName: 'Home',
    color: '#065f46', // emerald-800
    bgColor: '#ecfdf5', // emerald-50
    borderColor: '#a7f3d0',
  },
  alimentacao: {
    id: 'alimentacao',
    label: 'Alimentação e Mercado',
    iconName: 'ShoppingCart',
    color: '#047857',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  transporte: {
    id: 'transporte',
    label: 'Transporte e Combustível',
    iconName: 'Car',
    color: '#0284c7',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  cartao: {
    id: 'cartao',
    label: 'Cartão de Crédito',
    iconName: 'CreditCard',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
  },
  saude: {
    id: 'saude',
    label: 'Saúde e Farmácia',
    iconName: 'HeartPulse',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  educacao: {
    id: 'educacao',
    label: 'Educação e Cursos',
    iconName: 'GraduationCap',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  servicos: {
    id: 'servicos',
    label: 'Serviços e Assinaturas',
    iconName: 'Wifi',
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  lazer: {
    id: 'lazer',
    label: 'Lazer e Viagens',
    iconName: 'Palmtree',
    color: '#0891b2',
    bgColor: '#ecfeff',
    borderColor: '#a5f3fc',
  },
  outros: {
    id: 'outros',
    label: 'Outras Despesas',
    iconName: 'Tag',
    color: '#475569',
    bgColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
};

export interface ExpenseFiltersState {
  search: string;
  category: ExpenseCategory | 'todas';
  status: ExpenseStatus | 'todas' | 'vence_hoje';
  monthYear: string; // YYYY-MM ou 'todos'
  sortBy: 'dueDate_asc' | 'dueDate_desc' | 'amount_desc' | 'amount_asc' | 'name_asc';
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
