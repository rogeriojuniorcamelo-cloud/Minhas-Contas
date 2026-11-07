import React from 'react';
import {
  Calendar,
  CheckCircle,
  Eye,
  Pencil,
  Trash2,
  DollarSign,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';
import { Expense } from '../types/expense';
import { CategoryBadge, CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { getDueDateBadgeInfo, getExpenseCalculatedStatus } from '../utils/dateUtils';

interface ExpenseCardProps {
  expense: Expense;
  onView: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onPay: (expense: Expense) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onView,
  onEdit,
  onDelete,
  onPay,
}) => {
  const { status, isDueToday, daysDifference, nextDueDate, nextInstallmentNumber } =
    getExpenseCalculatedStatus(expense);

  const remainingInstallments = Math.max(0, expense.totalInstallments - expense.paidInstallments);
  const isFullyPaid = remainingInstallments === 0;

  const dueBadge = getDueDateBadgeInfo(daysDifference, isDueToday, isFullyPaid);

  // Status visual styles
  const getStatusBadge = () => {
    if (isFullyPaid) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          Paga
        </span>
      );
    }
    if (status === 'atrasada') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
          Atrasada
        </span>
      );
    }
    if (isDueToday) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
          <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
          Vence Hoje
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
        <Clock className="w-3.5 h-3.5" />
        Pendente
      </span>
    );
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden ${
        status === 'atrasada'
          ? 'border-rose-200 shadow-xs ring-1 ring-rose-100'
          : isDueToday
          ? 'border-amber-300 shadow-xs ring-1 ring-amber-100'
          : isFullyPaid
          ? 'border-emerald-200/80'
          : 'border-slate-200/80 shadow-xs'
      }`}
    >
      {/* Cabeçalho do Card */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100 mt-0.5">
              <CategoryIcon category={expense.category} className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-base leading-snug truncate" title={expense.name}>
                {expense.name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <CategoryBadge category={expense.category} showIcon={false} />
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {expense.type === 'parcelado' ? 'Parcelada' : 'À Vista'}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Informações de Valores e Parcelas */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50/80 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Valor Total</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900">
              {formatCurrency(expense.totalAmount)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">
              {expense.type === 'parcelado' ? 'Valor da Parcela' : 'Valor a Pagar'}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-800">
              {formatCurrency(expense.installmentAmount)}
            </span>
          </div>

          <div className="col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-slate-600">
            <span>
              Parcelas:{' '}
              <strong className="text-emerald-700">{expense.paidInstallments}</strong> pagas /{' '}
              <strong className="text-slate-800">{remainingInstallments}</strong> restantes
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              ({expense.paidInstallments}/{expense.totalInstallments})
            </span>
          </div>
        </div>

        {/* Indicador de Vencimento */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>
              {isFullyPaid ? 'Concluída' : `Próx. Vencimento: ${formatDateBR(nextDueDate)}`}
            </span>
          </div>

          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              dueBadge.variant === 'overdue'
                ? 'bg-rose-100 text-rose-800 font-bold'
                : dueBadge.variant === 'dueToday'
                ? 'bg-amber-100 text-amber-900 font-bold'
                : dueBadge.variant === 'paid'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {dueBadge.text}
          </span>
        </div>

        {/* Observações Opcionais */}
        {expense.notes && (
          <p className="mt-2 text-xs text-slate-500 italic line-clamp-1" title={expense.notes}>
            &ldquo;{expense.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Barra de Ações (Rodapé do Card) */}
      <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-1">
        
        {/* Botão Registrar Pagamento */}
        {!isFullyPaid ? (
          <button
            type="button"
            onClick={() => onPay(expense)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs py-2 px-3 rounded-xl transition shadow-xs active:scale-98"
          >
            <DollarSign className="w-4 h-4" />
            <span>
              {expense.type === 'parcelado'
                ? `Pagar Parc. ${nextInstallmentNumber}`
                : 'Registrar Pagamento'}
            </span>
          </button>
        ) : (
          <div className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-800 font-semibold text-xs py-2 px-3 rounded-xl border border-emerald-200/60">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Totalmente Paga</span>
          </div>
        )}

        {/* Botões Secundários: Visualizar, Editar, Excluir */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onView(expense)}
            title="Visualizar detalhes e parcelas"
            className="p-2 text-slate-600 hover:text-emerald-800 hover:bg-slate-200/70 rounded-xl transition"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onEdit(expense)}
            title="Editar despesa"
            className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-200/70 rounded-xl transition"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(expense)}
            title="Excluir despesa"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
