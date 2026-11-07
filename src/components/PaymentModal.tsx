import React, { useState } from 'react';
import { X, CheckCircle, Calendar, DollarSign, Repeat } from 'lucide-react';
import { Expense, RECURRENCE_LABELS } from '../types/expense';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { getExpenseCalculatedStatus, getTodayString } from '../utils/dateUtils';
import { CategoryIcon } from './CategoryIcon';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onConfirmPayment: (expense: Expense, options: { payAllRemaining: boolean; paymentDate: string }) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  expense,
  onConfirmPayment,
}) => {
  const [paymentDate, setPaymentDate] = useState(getTodayString());
  const [payAllRemaining, setPayAllRemaining] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !expense) return null;

  const isRecurring = expense.type === 'recorrente';
  const { nextDueDate, nextInstallmentNumber } = getExpenseCalculatedStatus(expense);
  const remainingCount = isRecurring
    ? (expense.paidInstallments > 0 ? 0 : 1)
    : Math.max(0, expense.totalInstallments - expense.paidInstallments);
  const remainingAmount = isRecurring
    ? expense.totalAmount
    : remainingCount * expense.installmentAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingCount <= 0 && !isRecurring) return;

    setIsSubmitting(true);
    try {
      await onConfirmPayment(expense, {
        payAllRemaining,
        paymentDate: paymentDate || getTodayString(),
      });
      onClose();
    } catch (err) {
      console.error('Erro ao registrar pagamento:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-200 text-black flex items-center justify-center font-bold">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Registrar Pagamento</h2>
              <p className="text-xs text-slate-500 font-medium">Confirme a quitação da despesa</p>
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

        {/* Informações da Despesa */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-200 text-black">
              <CategoryIcon category={expense.category} className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm truncate">{expense.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">
                {isRecurring ? (
                  <span className="inline-flex items-center gap-1 text-zinc-900 font-bold">
                    <Repeat className="w-3 h-3" />
                    <span>Lançamento Recorrente</span>
                  </span>
                ) : expense.type === 'parcelado' ? (
                  `Parcela ${nextInstallmentNumber} de ${expense.totalInstallments}`
                ) : (
                  'Pagamento à Vista'
                )}
              </span>
              <span className="text-base font-extrabold text-black">
                {formatCurrency(payAllRemaining ? remainingAmount : expense.installmentAmount)}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Vencimento Previsto</span>
              <span className="text-sm font-bold text-slate-800">
                {formatDateBR(isRecurring ? expense.dueDate : nextDueDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Opção de Liquidar Tudo se for parcelada e tiver mais de 1 parcela restante */}
          {!isRecurring && expense.type === 'parcelado' && remainingCount > 1 && (
            <div className="p-3 rounded-2xl bg-zinc-50/70 border border-zinc-300 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={payAllRemaining}
                  onChange={(e) => setPayAllRemaining(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-black focus:ring-zinc-500 border-slate-300 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-black block">
                    Liquidar todas as {remainingCount} parcelas restantes de uma vez
                  </span>
                  <span className="text-[11px] text-black/80 font-medium">
                    Valor total da quitação: <strong>{formatCurrency(remainingAmount)}</strong>
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* Data do Pagamento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-900" />
              <span>Data Efetiva do Pagamento</span>
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>

          {/* Resumo do que vai acontecer */}
          <div className="p-3 rounded-xl bg-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span>Status após confirmação:</span>
            <span className="font-bold text-black">
              {isRecurring
                ? 'Lançamento Quitado'
                : payAllRemaining || remainingCount <= 1
                ? 'Totalmente Quitada'
                : `${expense.paidInstallments + 1} de ${expense.totalInstallments} pagas`}
            </span>
          </div>

          {/* Botões */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-black hover:bg-zinc-950 text-white shadow-md shadow-zinc-950/20 transition active:scale-95 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Gravando...' : 'Confirmar Pagamento'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
