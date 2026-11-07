import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Expense } from '../types/expense';
import { formatCurrency } from '../utils/formatters';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onConfirm: (expense: Expense) => Promise<void>;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  expense,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !expense) return null;

  const isRecurringSeries = expense.type === 'recorrente' && Boolean(expense.recurrence?.groupId);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(expense);
      onClose();
    } catch (err) {
      console.error('Erro ao excluir:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between pb-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-2">
          <h3 className="text-base font-bold text-slate-900">Excluir Despesa</h3>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            {isRecurringSeries ? (
              <>
                Tem certeza de que deseja excluir definitivamente toda a recorrência{' '}
                <strong className="text-slate-900 font-extrabold">{expense.name}</strong>?
                Todos os lançamentos anteriores, atuais e futuros desta série serão apagados.
              </>
            ) : (
              <>
                Tem certeza de que deseja excluir permanentemente a despesa{' '}
                <strong className="text-slate-900 font-extrabold">{expense.name}</strong> no valor de{' '}
                <strong className="text-black font-extrabold">{formatCurrency(expense.totalAmount)}</strong>?
              </>
            )}
          </p>
          <p className="mt-1.5 text-[11px] text-rose-600 font-medium">
            Esta ação não poderá ser desfeita.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-md shadow-rose-600/20 transition active:scale-95 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Excluindo...' : 'Sim, Excluir'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
