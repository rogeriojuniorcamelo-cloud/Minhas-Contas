import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Layers, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { Expense, ExpenseCategory, ExpenseType, CATEGORIES } from '../types/expense';
import { CategoryIcon } from './CategoryIcon';
import { generateInstallments, getTodayString } from '../utils/dateUtils';
import { formatCurrency, parseCurrencyInput } from '../utils/formatters';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => Promise<void>;
  editingExpense?: Expense | null;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExpense,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('moradia');
  const [type, setType] = useState<ExpenseType>('parcelado');
  const [totalAmountStr, setTotalAmountStr] = useState('');
  const [installmentAmountStr, setInstallmentAmountStr] = useState('');
  const [totalInstallments, setTotalInstallments] = useState(1);
  const [paidInstallments, setPaidInstallments] = useState(0);
  const [dueDate, setDueDate] = useState(getTodayString());
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializa ou limpa formulário ao abrir ou alterar despesa para edição
  useEffect(() => {
    if (editingExpense) {
      setName(editingExpense.name);
      setCategory(editingExpense.category);
      setType(editingExpense.type);
      setTotalAmountStr(editingExpense.totalAmount.toFixed(2));
      setInstallmentAmountStr(editingExpense.installmentAmount.toFixed(2));
      setTotalInstallments(editingExpense.totalInstallments);
      setPaidInstallments(editingExpense.paidInstallments);
      setDueDate(editingExpense.dueDate || getTodayString());
      setNotes(editingExpense.notes || '');
    } else {
      setName('');
      setCategory('moradia');
      setType('parcelado');
      setTotalAmountStr('');
      setInstallmentAmountStr('');
      setTotalInstallments(3);
      setPaidInstallments(0);
      setDueDate(getTodayString());
      setNotes('');
    }
    setErrors({});
  }, [editingExpense, isOpen]);

  if (!isOpen) return null;

  // Cálculo automático de parcelas restantes
  const remainingInstallments = Math.max(0, totalInstallments - paidInstallments);

  // Manipulação de mudança de tipo (À vista vs Parcelado)
  const handleTypeChange = (newType: ExpenseType) => {
    setType(newType);
    if (newType === 'a_vista') {
      setTotalInstallments(1);
      if (paidInstallments > 1) setPaidInstallments(0);
      setInstallmentAmountStr(totalAmountStr);
    } else {
      if (totalInstallments <= 1) setTotalInstallments(2);
      const total = parseCurrencyInput(totalAmountStr);
      if (total > 0) {
        const calculatedInstallment = (total / Math.max(2, totalInstallments)).toFixed(2);
        setInstallmentAmountStr(calculatedInstallment);
      }
    }
  };

  // Quando o valor total é modificado
  const handleTotalAmountChange = (valStr: string) => {
    setTotalAmountStr(valStr);
    const total = parseCurrencyInput(valStr);
    if (total > 0 && totalInstallments > 0) {
      if (type === 'a_vista') {
        setInstallmentAmountStr(valStr);
      } else {
        const calculated = (total / totalInstallments).toFixed(2);
        setInstallmentAmountStr(calculated);
      }
    }
  };

  // Quando a quantidade de parcelas é modificada
  const handleTotalInstallmentsChange = (count: number) => {
    const validCount = Math.max(1, count);
    setTotalInstallments(validCount);
    // Ajusta parcelas pagas se exceder
    if (paidInstallments > validCount) {
      setPaidInstallments(validCount);
    }
    const total = parseCurrencyInput(totalAmountStr);
    if (total > 0) {
      const calculated = (total / validCount).toFixed(2);
      setInstallmentAmountStr(calculated);
    }
  };

  // Quando o valor da parcela é ajustado manualmente
  const handleInstallmentAmountChange = (valStr: string) => {
    setInstallmentAmountStr(valStr);
    const inst = parseCurrencyInput(valStr);
    if (inst > 0 && totalInstallments > 0) {
      const newTotal = (inst * totalInstallments).toFixed(2);
      setTotalAmountStr(newTotal);
    }
  };

  // Validação e Salvamento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'O nome da despesa é obrigatório.';
    }

    const totalVal = parseCurrencyInput(totalAmountStr);
    if (totalVal <= 0) {
      newErrors.totalAmount = 'Informe um valor válido maior que zero.';
    }

    const instVal = parseCurrencyInput(installmentAmountStr);
    if (instVal <= 0) {
      newErrors.installmentAmount = 'Informe um valor de parcela válido.';
    }

    if (!dueDate) {
      newErrors.dueDate = 'A data de vencimento é obrigatória.';
    }

    if (totalInstallments < 1) {
      newErrors.totalInstallments = 'A quantidade de parcelas deve ser de pelo menos 1.';
    }

    if (paidInstallments < 0 || paidInstallments > totalInstallments) {
      newErrors.paidInstallments = 'Parcelas pagas não podem ultrapassar o total de parcelas.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const dueDay = parseInt(dueDate.split('-')[2] || '1', 10);
      const isEditing = !!editingExpense;

      // Preserva histórico existente se estiver editando e as parcelas não tiverem mudado drasticamente
      let installments = editingExpense?.installments || [];
      if (!isEditing || installments.length !== totalInstallments) {
        installments = generateInstallments(totalInstallments, instVal, dueDate, paidInstallments);
      } else {
        // Atualiza os valores e datas base das parcelas
        installments = generateInstallments(totalInstallments, instVal, dueDate, paidInstallments);
      }

      const expenseData: Expense = {
        id: editingExpense?.id || 'exp_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        name: name.trim(),
        category,
        type,
        totalAmount: totalVal,
        installmentAmount: instVal,
        totalInstallments,
        paidInstallments,
        dueDate,
        dueDay,
        notes: notes.trim() || undefined,
        installments,
        createdAt: editingExpense?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(expenseData);
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar despesa:', err);
      setErrors({ form: 'Erro ao gravar dados no IndexedDB. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {editingExpense
                  ? 'Atualize os dados e o controle de parcelas da sua despesa.'
                  : 'Cadastre uma conta à vista ou parcelada para acompanhamento.'}
              </p>
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

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {errors.form && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errors.form}
            </div>
          )}

          {/* Seletor de Tipo: À Vista ou Parcelada */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Tipo de Despesa
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => handleTypeChange('parcelado')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                  type === 'parcelado'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Parcelada</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('a_vista')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                  type === 'a_vista'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>À Vista</span>
              </button>
            </div>
          </div>

          {/* Nome da Despesa */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
              Nome da Despesa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Aluguel, Celular novo, Supermercado..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition ${
                errors.name ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-700" />
              <span>Categoria</span>
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 appearance-none cursor-pointer"
              >
                {Object.values(CATEGORIES).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <CategoryIcon category={category} className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
          </div>

          {/* Valores: Total e Parcela */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Valor Total (R$) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={totalAmountStr}
                  onChange={(e) => handleTotalAmountChange(e.target.value)}
                  placeholder="0,00"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition ${
                    errors.totalAmount ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.totalAmount && (
                <p className="text-rose-600 text-xs mt-1">{errors.totalAmount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Valor da Parcela (R$) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={installmentAmountStr}
                  onChange={(e) => handleInstallmentAmountChange(e.target.value)}
                  placeholder="0,00"
                  disabled={type === 'a_vista'}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-bold text-emerald-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition ${
                    errors.installmentAmount ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                  } ${type === 'a_vista' ? 'opacity-80 bg-slate-100 cursor-not-allowed' : ''}`}
                />
              </div>
              {errors.installmentAmount && (
                <p className="text-rose-600 text-xs mt-1">{errors.installmentAmount}</p>
              )}
            </div>
          </div>

          {/* Data de Vencimento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Data de Vencimento {type === 'parcelado' && '(1ª Parcela)'}</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition ${
                errors.dueDate ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {errors.dueDate && <p className="text-rose-600 text-xs mt-1">{errors.dueDate}</p>}
          </div>

          {/* Controle de Parcelas (visível se parcelado) */}
          {type === 'parcelado' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block">
                Controle de Parcelas
              </span>

              <div className="grid grid-cols-3 gap-2">
                {/* Total de Parcelas */}
                <div>
                  <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                    Total Parcelas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={totalInstallments}
                    onChange={(e) => handleTotalInstallmentsChange(parseInt(e.target.value || '1', 10))}
                    className="w-full px-2.5 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-bold text-slate-900 text-center focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Parcelas Pagas */}
                <div>
                  <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                    Pagas
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalInstallments}
                    value={paidInstallments}
                    onChange={(e) => {
                      const p = parseInt(e.target.value || '0', 10);
                      setPaidInstallments(Math.min(totalInstallments, Math.max(0, p)));
                    }}
                    className="w-full px-2.5 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-bold text-emerald-800 text-center focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Parcelas Restantes (Automático) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Restantes
                  </label>
                  <div className="w-full px-2.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-black text-slate-800 text-center">
                    {remainingInstallments}
                  </div>
                </div>
              </div>

              {errors.paidInstallments && (
                <p className="text-rose-600 text-xs">{errors.paidInstallments}</p>
              )}

              <p className="text-[11px] text-emerald-800/80 font-medium leading-relaxed">
                As parcelas restantes e as datas mensais de vencimento são geradas e calculadas automaticamente.
              </p>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Observações (Opcional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pagamento com cartão de crédito final 4421, chave Pix, código de barras..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
            />
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
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
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white shadow-md shadow-emerald-900/20 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : editingExpense ? 'Salvar Alterações' : 'Cadastrar Despesa'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
