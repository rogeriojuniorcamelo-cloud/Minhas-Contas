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
  Repeat,
} from 'lucide-react';
import { Expense, CategoryInfo, RECURRENCE_LABELS } from '../types/expense';
import { CategoryBadge, CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { getDueDateBadgeInfo, getExpenseCalculatedStatus } from '../utils/dateUtils';

interface ExpenseCardProps {
  expense: Expense;
  categoryObj?: CategoryInfo;
  onView: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onPay: (expense: Expense) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  categoryObj,
  onView,
  onEdit,
  onDelete,
  onPay,
}) => {
  const { status, isDueToday, daysDifference, nextDueDate, nextInstallmentNumber } =
    getExpenseCalculatedStatus(expense);

  const isRecurring = expense.type === 'recorrente';
  const remainingInstallments = isRecurring
    ? (expense.paidInstallments > 0 ? 0 : 1)
    : Math.max(0, expense.totalInstallments - expense.paidInstallments);
  const isFullyPaid = isRecurring
    ? (expense.paidInstallments > 0 || expense.installments?.[0]?.isPaid === true)
    : remainingInstallments === 0;

  const dueBadge = getDueDateBadgeInfo(daysDifference, isDueToday, isFullyPaid);

  // Status visual styles
  const getStatusBadge = () => {
    if (isFullyPaid) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-200 text-black border border-zinc-400">
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

  const getTypeNameBadge = () => {
    if (expense.type === 'recorrente') {
      const freqLabel = expense.recurrence?.frequency
        ? RECURRENCE_LABELS[expense.recurrence.frequency]
        : 'Recorrente';
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-black bg-zinc-200/80 px-2 py-0.5 rounded-md border border-zinc-300">
          <Repeat className="w-3 h-3" />
          <span>{freqLabel}</span>
        </span>
      );
    }
    if (expense.type === 'parcelado') {
      return (
        <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
          Parcelada ({expense.paidInstallments}/{expense.totalInstallments})
        </span>
      );
    }
    return (
      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
        À Vista
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
          ? 'border-zinc-300/80'
          : 'border-slate-200/80 shadow-xs'
      }`}
    >
      {/* Cabeçalho do Card */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-start gap-2.5 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5"
              style={{
                backgroundColor: categoryObj?.bgColor || '#ecfdf5',
                color: categoryObj?.color || '#065f46',
                borderColor: categoryObj?.borderColor || '#a7f3d0',
              }}
            >
              <CategoryIcon
                iconName={categoryObj?.iconName}
                category={expense.category}
                className="w-5 h-5"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-base leading-snug truncate" title={expense.name}>
                {expense.name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <CategoryBadge
                  category={expense.category}
                  categoryObj={categoryObj}
                  showIcon={false}
                />
                {getTypeNameBadge()}
              </div>
            </div>
          </div>

          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Informações de Valores e Parcelas */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50/80 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">
              {isRecurring ? 'Valor do Período' : 'Valor Total'}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900">
              {formatCurrency(expense.totalAmount)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">
              {expense.type === 'parcelado' ? 'Valor da Parcela' : 'Valor a Pagar'}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-black">
              {formatCurrency(expense.installmentAmount)}
            </span>
          </div>

          <div className="col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-slate-600">
            {isRecurring ? (
              <span className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                <Repeat className="w-3 h-3 text-zinc-900" />
                <span>
                  Recorrência {expense.recurrence?.frequency ? RECURRENCE_LABELS[expense.recurrence.frequency].toLowerCase() : ''}
                  {expense.recurrence?.dueDay ? ` (dia ${expense.recurrence.dueDay})` : ''}
                </span>
              </span>
            ) : (
              <>
                <span>
                  Parcelas:{' '}
                  <strong className="text-zinc-900">{expense.paidInstallments}</strong> pagas /{' '}
                  <strong className="text-slate-800">{remainingInstallments}</strong> restantes
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  ({expense.paidInstallments}/{expense.totalInstallments})
                </span>
              </>
            )}
          </div>
        </div>

        {/* Indicador de Vencimento */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Calendar className="w-3.5 h-3.5 text-zinc-900" />
            <span>
              {isFullyPaid
                ? 'Concluída / Paga'
                : `Vencimento: ${formatDateBR(isRecurring ? expense.dueDate : nextDueDate)}`}
            </span>
          </div>

          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              dueBadge.variant === 'overdue'
                ? 'bg-rose-100 text-rose-800 font-bold'
                : dueBadge.variant === 'dueToday'
                ? 'bg-amber-100 text-amber-900 font-bold'
                : dueBadge.variant === 'paid'
                ? 'bg-zinc-200 text-black'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {dueBadge.text}
          </span>
        </div>

        {/* Observações */}
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
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-black active:bg-zinc-950 text-white font-bold text-xs py-2 px-3 rounded-xl transition shadow-xs active:scale-98"
          >
            <DollarSign className="w-4 h-4" />
            <span>
              {expense.type === 'parcelado'
                ? `Pagar Parc. ${nextInstallmentNumber}`
                : 'Registrar Pagamento'}
            </span>
          </button>
        ) : (
          <div className="flex-1 inline-flex items-center justify-center gap-1.5 bg-zinc-50 text-black font-semibold text-xs py-2 px-3 rounded-xl border border-zinc-300/60">
            <CheckCircle className="w-4 h-4 text-black" />
            <span>{isRecurring ? 'Conta Paga' : 'Totalmente Paga'}</span>
          </div>
        )}

        {/* Botões Secundários: Visualizar, Editar, Excluir */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onView(expense)}
            title="Visualizar detalhes"
            className="p-2 text-slate-600 hover:text-black hover:bg-slate-200/70 rounded-xl transition"
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
