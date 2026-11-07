import React from 'react';
import {
  Eye,
  Pencil,
  Trash2,
  DollarSign,
  AlertCircle,
  Clock,
  Check,
  CheckCircle,
  Repeat,
} from 'lucide-react';
import { Expense, CategoryInfo, RECURRENCE_LABELS } from '../types/expense';
import { CategoryBadge, CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { getDueDateBadgeInfo, getExpenseCalculatedStatus } from '../utils/dateUtils';

interface ExpenseTableProps {
  expenses: Expense[];
  categories?: CategoryInfo[];
  onView: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onPay: (expense: Expense) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  categories,
  onView,
  onEdit,
  onDelete,
  onPay,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Despesa / Categoria</th>
              <th className="py-3 px-4">Valor Parcela / Total</th>
              <th className="py-3 px-4">Vencimento</th>
              <th className="py-3 px-4 text-center">Tipo / Parcelas</th>
              <th className="py-3 px-4 text-center">Situação</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense) => {
              const { status, isDueToday, daysDifference, nextDueDate, nextInstallmentNumber } =
                getExpenseCalculatedStatus(expense);

              const isRecurring = expense.type === 'recorrente';
              const remaining = isRecurring
                ? (expense.paidInstallments > 0 ? 0 : 1)
                : Math.max(0, expense.totalInstallments - expense.paidInstallments);
              const isFullyPaid = isRecurring
                ? (expense.paidInstallments > 0 || expense.installments?.[0]?.isPaid === true)
                : remaining === 0;

              const dueBadge = getDueDateBadgeInfo(daysDifference, isDueToday, isFullyPaid);
              const catObj = categories?.find((c) => c.id === expense.category);

              return (
                <tr key={expense.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Despesa e Categoria */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: catObj?.bgColor || '#ecfdf5',
                          color: catObj?.color || '#065f46',
                          borderColor: catObj?.borderColor || '#a7f3d0',
                        }}
                      >
                        <CategoryIcon iconName={catObj?.iconName} category={expense.category} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                        <span className="font-bold text-slate-900 block truncate" title={expense.name}>
                          {expense.name}
                        </span>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <CategoryBadge
                            category={expense.category}
                            categoryObj={catObj}
                            showIcon={false}
                          />
                          <span className="text-[10px] text-slate-400 font-medium">
                            {isRecurring
                              ? `Recorrente (${expense.recurrence?.frequency ? RECURRENCE_LABELS[expense.recurrence.frequency] : 'Mensal'})`
                              : expense.type === 'parcelado'
                              ? 'Parcelada'
                              : 'À Vista'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Valor */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-extrabold text-slate-900">
                      {formatCurrency(expense.installmentAmount)}
                    </div>
                    {expense.type === 'parcelado' && (
                      <div className="text-[11px] text-slate-500 font-medium">
                        Total: {formatCurrency(expense.totalAmount)}
                      </div>
                    )}
                  </td>

                  {/* Vencimento */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">
                      {isFullyPaid ? 'Concluída' : formatDateBR(isRecurring ? expense.dueDate : nextDueDate)}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        dueBadge.variant === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : dueBadge.variant === 'dueToday'
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : dueBadge.variant === 'paid'
                          ? 'bg-zinc-200 text-black'
                          : 'text-slate-400'
                      }`}
                    >
                      {dueBadge.text}
                    </span>
                  </td>

                  {/* Tipo / Parcelas */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {isRecurring ? (
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-black bg-zinc-50 px-2 py-0.5 rounded-md border border-zinc-300">
                        <Repeat className="w-3 h-3 text-black" />
                        <span>Recorrente (dia {expense.recurrence?.dueDay || expense.dueDay})</span>
                      </div>
                    ) : (
                      <>
                        <div className="inline-flex items-center gap-1 font-semibold text-xs">
                          <span className="text-zinc-900 font-bold">{expense.paidInstallments} pagas</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-slate-700 font-bold">{remaining} rest.</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          de {expense.totalInstallments} {expense.totalInstallments === 1 ? 'vez' : 'parcelas'}
                        </div>
                      </>
                    )}
                  </td>

                  {/* Situação */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {isFullyPaid ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-200 text-black border border-zinc-400">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        Paga
                      </span>
                    ) : status === 'atrasada' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                        Atrasada
                      </span>
                    ) : isDueToday ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                        <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                        Vence Hoje
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                        <Clock className="w-3.5 h-3.5" />
                        Pendente
                      </span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {!isFullyPaid ? (
                        <button
                          type="button"
                          onClick={() => onPay(expense)}
                          title="Registrar pagamento"
                          className="inline-flex items-center gap-1 bg-zinc-900 hover:bg-black text-white font-bold text-xs py-1.5 px-2.5 rounded-lg transition"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Pagar</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-zinc-900 px-2 py-1 bg-zinc-50 rounded-lg flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-black" /> Liquidada
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => onView(expense)}
                        title="Ver detalhes"
                        className="p-1.5 text-slate-500 hover:text-black hover:bg-slate-100 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(expense)}
                        title="Editar"
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(expense)}
                        title="Excluir"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
