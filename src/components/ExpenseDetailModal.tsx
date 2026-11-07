import React, { useState } from 'react';
import {
  X,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Pencil,
  Undo2,
  DollarSign,
  Layers,
  FileText,
  Check,
  Repeat,
  Slash,
} from 'lucide-react';
import { Expense, CategoryInfo, RECURRENCE_LABELS } from '../types/expense';
import { CategoryBadge, CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { getExpenseCalculatedStatus, getTodayString } from '../utils/dateUtils';

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  categories?: CategoryInfo[];
  onEdit: (expense: Expense) => void;
  onToggleInstallment: (expense: Expense, installmentNumber: number, isPaid: boolean) => Promise<void>;
  onInterruptRecurrence?: (groupId: string) => Promise<void>;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  isOpen,
  onClose,
  expense,
  categories,
  onEdit,
  onToggleInstallment,
  onInterruptRecurrence,
}) => {
  const [showInterruptConfirm, setShowInterruptConfirm] = useState(false);
  const [isInterrupting, setIsInterrupting] = useState(false);

  if (!isOpen || !expense) return null;

  const { status, isDueToday, daysDifference } = getExpenseCalculatedStatus(expense);
  const isRecurring = expense.type === 'recorrente';
  const catObj = categories?.find((c) => c.id === expense.category);

  const remainingInstallments = isRecurring
    ? (expense.paidInstallments > 0 ? 0 : 1)
    : Math.max(0, expense.totalInstallments - expense.paidInstallments);
  const paidAmount = isRecurring
    ? (expense.paidInstallments > 0 ? expense.totalAmount : 0)
    : expense.paidInstallments * expense.installmentAmount;
  const remainingAmount = isRecurring
    ? (expense.paidInstallments > 0 ? 0 : expense.totalAmount)
    : remainingInstallments * expense.installmentAmount;
  const progressPercent = isRecurring
    ? (expense.paidInstallments > 0 ? 100 : 0)
    : Math.round((expense.paidInstallments / expense.totalInstallments) * 100);

  const handleInterrupt = async () => {
    if (!expense.recurrence?.groupId || !onInterruptRecurrence) return;
    setIsInterrupting(true);
    try {
      await onInterruptRecurrence(expense.recurrence.groupId);
      setShowInterruptConfirm(false);
      onClose();
    } catch (err) {
      console.error('Erro ao interromper recorrência:', err);
    } finally {
      setIsInterrupting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: catObj?.bgColor || '#ecfdf5',
                color: catObj?.color || '#065f46',
                borderColor: catObj?.borderColor || '#a7f3d0',
              }}
            >
              <CategoryIcon iconName={catObj?.iconName} category={expense.category} className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {expense.name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <CategoryBadge category={expense.category} categoryObj={catObj} />
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {isRecurring
                    ? `Recorrente (${expense.recurrence?.frequency ? RECURRENCE_LABELS[expense.recurrence.frequency] : 'Mensal'})`
                    : expense.type === 'parcelado'
                    ? 'Compra Parcelada'
                    : 'À Vista'}
                </span>
                {isRecurring && expense.recurrence?.isInterrupted && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                    Série Interrompida
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detalhes de Recorrência (se aplicável) */}
        {isRecurring && expense.recurrence && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                <Repeat className="w-4 h-4 text-emerald-700" />
                <span>Configuração de Recorrência</span>
              </span>
              {!expense.recurrence.isInterrupted && onInterruptRecurrence && (
                <button
                  type="button"
                  onClick={() => setShowInterruptConfirm(true)}
                  className="text-xs font-bold text-rose-700 hover:text-rose-900 underline flex items-center gap-1"
                >
                  <Slash className="w-3.5 h-3.5" />
                  <span>Interromper repetição</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700 pt-1">
              <div>
                <span className="text-[11px] text-slate-500 block">Frequência</span>
                <span className="font-bold text-slate-900">
                  {RECURRENCE_LABELS[expense.recurrence.frequency]}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Vencimento</span>
                <span className="font-bold text-slate-900">
                  Todo dia {expense.recurrence.dueDay || expense.dueDay}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Início / Término</span>
                <span className="font-bold text-slate-900">
                  {formatDateBR(expense.recurrence.startDate)}{' '}
                  {expense.recurrence.endDate ? `até ${formatDateBR(expense.recurrence.endDate)}` : '(contínuo)'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação para Interromper Recorrência */}
        {showInterruptConfirm && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-950 text-xs sm:text-sm">
                  Deseja interromper esta despesa recorrente?
                </h4>
                <p className="text-[11px] text-rose-800 mt-1 leading-relaxed">
                  Os lançamentos dos meses anteriores e os pagamentos já registrados serão <strong>totalmente preservados</strong>.
                  Os lançamentos futuros em aberto a partir de hoje não serão mais gerados.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowInterruptConfirm(false)}
                disabled={isInterrupting}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleInterrupt}
                disabled={isInterrupting}
                className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                {isInterrupting ? 'Interrompendo...' : 'Sim, Interromper'}
              </button>
            </div>
          </div>
        )}

        {/* Resumo Financeiro da Despesa */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              {isRecurring ? 'Valor Deste Lançamento' : 'Valor Total'}
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              {formatCurrency(expense.totalAmount)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
              Total Pago
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-800">
              {formatCurrency(paidAmount)}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
              Restante a Pagar
            </span>
            <span className="text-base sm:text-lg font-black text-amber-800">
              {formatCurrency(remainingAmount)}
            </span>
          </div>
        </div>

        {/* Barra de Progresso */}
        {!isRecurring && (
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
              <span>
                Progresso de Pagamento ({expense.paidInstallments} de {expense.totalInstallments} parcelas)
              </span>
              <span className="text-emerald-800 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-emerald-700 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Observações */}
        {expense.notes && (
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-600">
            <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-700 block mb-0.5">Observações:</span>
              <p className="whitespace-pre-wrap">{expense.notes}</p>
            </div>
          </div>
        )}

        {/* Cronograma de Parcelas (se parcelado) ou Pagamento da Conta (se recorrente/à vista) */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>{isRecurring ? 'Status do Lançamento' : 'Cronograma de Parcelas'}</span>
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {isRecurring ? 'Conta mensal' : `${expense.totalInstallments} parcelas no total`}
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {expense.installments.map((inst) => {
              const today = getTodayString();
              const isOverdue = !inst.isPaid && inst.dueDate < today;
              const isDueToday = !inst.isPaid && inst.dueDate === today;

              return (
                <div
                  key={inst.number}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
                    inst.isPaid
                      ? 'bg-emerald-50/50 border-emerald-200 text-slate-700'
                      : isOverdue
                      ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                      : isDueToday
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                        inst.isPaid
                          ? 'bg-emerald-600 text-white'
                          : isOverdue
                          ? 'bg-rose-200 text-rose-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {inst.isPaid ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : inst.number}
                    </div>

                    <div>
                      <div className="font-bold">
                        {isRecurring
                          ? `Lançamento de ${formatDateBR(inst.dueDate)} — ${formatCurrency(inst.amount)}`
                          : `Parcela ${inst.number} de ${expense.totalInstallments} — ${formatCurrency(inst.amount)}`}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Vencimento: {formatDateBR(inst.dueDate)}</span>
                        {inst.paidDate && (
                          <span className="text-emerald-700 font-semibold ml-1">
                            (Paga em {formatDateBR(inst.paidDate)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ação individual de Quitação ou Estorno */}
                  <div>
                    {inst.isPaid ? (
                      <button
                        type="button"
                        onClick={() => onToggleInstallment(expense, inst.number, false)}
                        title="Desfazer/Estornar pagamento"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition"
                      >
                        <Undo2 className="w-3 h-3" />
                        <span>Desfazer</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleInstallment(expense, inst.number, true)}
                        className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg shadow-xs transition"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Pagar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé com botões */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(expense);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 px-3 py-2 rounded-xl hover:bg-slate-100 transition"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Editar Despesa</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
