import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  DollarSign,
  Layers,
  Tag,
  FileText,
  CheckCircle2,
  Repeat,
  PlusCircle,
  Clock,
  HelpCircle,
} from 'lucide-react';
import {
  Expense,
  ExpenseType,
  CategoryInfo,
  RecurrenceFrequency,
  RECURRENCE_LABELS,
} from '../types/expense';
import { CategoryIcon } from './CategoryIcon';
import { generateInstallments, getTodayString } from '../utils/dateUtils';
import { parseCurrencyInput } from '../utils/formatters';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    expense: Expense,
    options?: { recurrenceScope?: 'single' | 'future_all' }
  ) => Promise<void>;
  editingExpense?: Expense | null;
  categories: CategoryInfo[];
  onOpenCategoryManager?: () => void;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExpense,
  categories,
  onOpenCategoryManager,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('');
  const [type, setType] = useState<ExpenseType>('parcelado');
  const [totalAmountStr, setTotalAmountStr] = useState('');
  const [installmentAmountStr, setInstallmentAmountStr] = useState('');
  const [totalInstallments, setTotalInstallments] = useState(1);
  const [paidInstallments, setPaidInstallments] = useState(0);
  const [dueDate, setDueDate] = useState(getTodayString());
  const [notes, setNotes] = useState('');

  // Estados de Recorrência (Melhoria 1)
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>('nenhuma');
  const [recurrenceStartDate, setRecurrenceStartDate] = useState(getTodayString());
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [dueDay, setDueDay] = useState<number>(10);
  const [recurrenceScope, setRecurrenceScope] = useState<'single' | 'future_all'>('future_all');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializa formulário ao abrir ou alterar despesa para edição
  useEffect(() => {
    if (editingExpense) {
      setName(editingExpense.name);
      setCategory(editingExpense.category || '');
      setType(editingExpense.type);
      setTotalAmountStr(editingExpense.totalAmount.toFixed(2));
      setInstallmentAmountStr(editingExpense.installmentAmount.toFixed(2));
      setTotalInstallments(editingExpense.totalInstallments || 1);
      setPaidInstallments(editingExpense.paidInstallments || 0);
      setDueDate(editingExpense.dueDate || getTodayString());
      setNotes(editingExpense.notes || '');

      if (editingExpense.recurrence && editingExpense.recurrence.frequency !== 'nenhuma') {
        setRecurrenceFrequency(editingExpense.recurrence.frequency);
        setRecurrenceStartDate(editingExpense.recurrence.startDate || editingExpense.dueDate);
        setRecurrenceEndDate(editingExpense.recurrence.endDate || '');
        setDueDay(editingExpense.recurrence.dueDay || editingExpense.dueDay || 10);
      } else {
        setRecurrenceFrequency('nenhuma');
        setRecurrenceStartDate(editingExpense.dueDate || getTodayString());
        setRecurrenceEndDate('');
        setDueDay(editingExpense.dueDay || 10);
      }
      setRecurrenceScope('future_all');
    } else {
      setName('');
      setCategory(categories[0]?.id || '');
      setType('recorrente');
      setTotalAmountStr('');
      setInstallmentAmountStr('');
      setTotalInstallments(1);
      setPaidInstallments(0);
      const today = getTodayString();
      setDueDate(today);
      setNotes('');
      setRecurrenceFrequency('mensal');
      setRecurrenceStartDate(today);
      setRecurrenceEndDate('');
      const defaultDay = parseInt(today.split('-')[2] || '10', 10);
      setDueDay(defaultDay);
      setRecurrenceScope('future_all');
    }
    setErrors({});
  }, [editingExpense, isOpen, categories]);

  if (!isOpen) return null;

  // Cálculo automático de parcelas restantes (para parceladas)
  const remainingInstallments = Math.max(0, totalInstallments - paidInstallments);

  // Mudança do tipo de despesa (Parcelada, À Vista ou Recorrente)
  const handleTypeChange = (newType: ExpenseType) => {
    setType(newType);
    if (newType === 'a_vista') {
      setTotalInstallments(1);
      if (paidInstallments > 1) setPaidInstallments(0);
      setInstallmentAmountStr(totalAmountStr);
      setRecurrenceFrequency('nenhuma');
    } else if (newType === 'parcelado') {
      if (totalInstallments <= 1) setTotalInstallments(2);
      setRecurrenceFrequency('nenhuma');
      const total = parseCurrencyInput(totalAmountStr);
      if (total > 0) {
        const calculatedInstallment = (total / Math.max(2, totalInstallments)).toFixed(2);
        setInstallmentAmountStr(calculatedInstallment);
      }
    } else if (newType === 'recorrente') {
      setTotalInstallments(1);
      setPaidInstallments(0);
      if (recurrenceFrequency === 'nenhuma') {
        setRecurrenceFrequency('mensal');
      }
      setInstallmentAmountStr(totalAmountStr);
    }
  };

  // Quando a frequência de repetição é alterada
  const handleRecurrenceChange = (freq: RecurrenceFrequency) => {
    setRecurrenceFrequency(freq);
    if (freq === 'nenhuma') {
      if (type === 'recorrente') {
        setType('a_vista');
      }
    } else {
      setType('recorrente');
      setTotalInstallments(1);
      setPaidInstallments(0);
      setInstallmentAmountStr(totalAmountStr);
    }
  };

  // Quando o valor total é modificado
  const handleTotalAmountChange = (valStr: string) => {
    setTotalAmountStr(valStr);
    const total = parseCurrencyInput(valStr);
    if (total > 0 && totalInstallments > 0) {
      if (type === 'a_vista' || type === 'recorrente') {
        setInstallmentAmountStr(valStr);
      } else {
        const calculated = (total / totalInstallments).toFixed(2);
        setInstallmentAmountStr(calculated);
      }
    }
  };

  // Quando a quantidade de parcelas é modificada (apenas parceladas)
  const handleTotalInstallmentsChange = (count: number) => {
    const validCount = Math.max(1, count);
    setTotalInstallments(validCount);
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

    if (type === 'parcelado') {
      const instVal = parseCurrencyInput(installmentAmountStr);
      if (instVal <= 0) {
        newErrors.installmentAmount = 'Informe um valor de parcela válido.';
      }
      if (totalInstallments < 1) {
        newErrors.totalInstallments = 'A quantidade de parcelas deve ser de pelo menos 1.';
      }
      if (paidInstallments < 0 || paidInstallments > totalInstallments) {
        newErrors.paidInstallments = 'Parcelas pagas não podem ultrapassar o total de parcelas.';
      }
    }

    if (!dueDate) {
      newErrors.dueDate = 'A data de vencimento é obrigatória.';
    }

    if (type === 'recorrente' && recurrenceFrequency !== 'nenhuma') {
      if (dueDay < 1 || dueDay > 31) {
        newErrors.dueDay = 'O dia de vencimento deve estar entre 1 e 31.';
      }
      if (recurrenceEndDate && recurrenceEndDate < recurrenceStartDate) {
        newErrors.recurrenceEndDate = 'A data de término não pode ser anterior à data de início.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const finalDueDay =
        type === 'recorrente'
          ? dueDay
          : parseInt(dueDate.split('-')[2] || '1', 10);

      const isEditing = !!editingExpense;
      const instVal = type === 'parcelado' ? parseCurrencyInput(installmentAmountStr) : totalVal;

      let installments = editingExpense?.installments || [];
      if (type === 'parcelado') {
        installments = generateInstallments(totalInstallments, instVal, dueDate, paidInstallments);
      } else {
        // Para à vista ou recorrente: parcela única para a ocorrência
        installments = [
          {
            number: 1,
            dueDate,
            amount: totalVal,
            isPaid: editingExpense ? editingExpense.paidInstallments >= 1 : false,
            paidDate: editingExpense?.installments?.[0]?.paidDate,
          },
        ];
      }

      // Configuração de grupo de recorrência
      const recurrenceGroupId =
        editingExpense?.recurrence?.groupId ||
        'grp_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

      const expenseData: Expense = {
        id: editingExpense?.id || 'exp_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        name: name.trim(),
        category: category.trim() ? category : undefined,
        type,
        totalAmount: totalVal,
        installmentAmount: instVal,
        totalInstallments: type === 'parcelado' ? totalInstallments : 1,
        paidInstallments: type === 'parcelado' ? paidInstallments : (editingExpense?.paidInstallments || 0),
        dueDate,
        dueDay: finalDueDay,
        notes: notes.trim() || undefined,
        installments,
        createdAt: editingExpense?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (type === 'recorrente' && recurrenceFrequency !== 'nenhuma') {
        expenseData.recurrence = {
          frequency: recurrenceFrequency,
          startDate: recurrenceStartDate || dueDate,
          endDate: recurrenceEndDate || undefined,
          dueDay: finalDueDay,
          groupId: recurrenceGroupId,
          isInterrupted: editingExpense?.recurrence?.isInterrupted || false,
        };
      }

      await onSave(expenseData, { recurrenceScope });
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
                  ? 'Atualize as informações da conta cadastrada.'
                  : 'Cadastre contas recorrentes, parceladas ou à vista.'}
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

          {/* Seletor de Tipo de Despesa */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Tipo de Despesa
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs sm:text-sm font-bold">
              <button
                type="button"
                onClick={() => handleTypeChange('recorrente')}
                className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  type === 'recorrente'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Recorrente</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('parcelado')}
                className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  type === 'parcelado'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Parcelada</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('a_vista')}
                className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  type === 'a_vista'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>À Vista</span>
              </button>
            </div>
          </div>

          {/* Opção "Repetir despesa" (Melhoria 1) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-emerald-700" />
                <span>Repetir Despesa</span>
              </label>
              {type === 'parcelado' && (
                <span className="text-[10px] text-slate-400">
                  (Despesas parceladas têm prazo fixo de quitação)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Frequência */}
              <div>
                <select
                  value={recurrenceFrequency}
                  onChange={(e) => handleRecurrenceChange(e.target.value as RecurrenceFrequency)}
                  disabled={type === 'parcelado'}
                  className={`w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer ${
                    type === 'parcelado' ? 'opacity-60 bg-slate-100 cursor-not-allowed' : ''
                  }`}
                >
                  {Object.entries(RECURRENCE_LABELS).map(([freqKey, freqLabel]) => (
                    <option key={freqKey} value={freqKey}>
                      {freqLabel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dia do Vencimento para Recorrência */}
              {recurrenceFrequency !== 'nenhuma' && type === 'recorrente' && (
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">
                      Todo dia:
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={dueDay}
                      onChange={(e) => {
                        const d = parseInt(e.target.value || '1', 10);
                        setDueDay(Math.min(31, Math.max(1, d)));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-emerald-900 text-center focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  {errors.dueDay && <p className="text-rose-600 text-[11px] mt-0.5">{errors.dueDay}</p>}
                </div>
              )}
            </div>

            {/* Datas de Início e Término da Recorrência */}
            {recurrenceFrequency !== 'nenhuma' && type === 'recorrente' && (
              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={recurrenceStartDate}
                    onChange={(e) => {
                      setRecurrenceStartDate(e.target.value);
                      setDueDate(e.target.value);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Data de Término (Opcional)
                  </label>
                  <input
                    type="date"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    placeholder="Sem término"
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600"
                  />
                  {errors.recurrenceEndDate && (
                    <p className="text-rose-600 text-[11px] mt-0.5">{errors.recurrenceEndDate}</p>
                  )}
                </div>

                <div className="col-span-full text-[11px] text-emerald-800/80 font-medium">
                  💡 Os lançamentos futuros serão gerados automaticamente para cada mês/período. Meses menores como fevereiro (28/29 dias) são ajustados sem duplicidade.
                </div>
              </div>
            )}
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
              placeholder="Ex: Aluguel do Apartamento, Internet, Plano de Saúde..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition ${
                errors.name ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Categoria Dinâmica (Melhoria 2 & 3) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-700" />
                <span>Categoria (Opcional)</span>
              </label>
              {onOpenCategoryManager && (
                <button
                  type="button"
                  onClick={onOpenCategoryManager}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Gerenciar categorias</span>
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 appearance-none cursor-pointer"
              >
                <option value="">(Sem categoria)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <CategoryIcon category={category} className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
            {categories.length === 0 && (
              <p className="text-[11px] text-slate-400 mt-1">
                Nenhuma categoria criada ainda. Você pode salvar a despesa sem categoria ou clicar em &quot;Gerenciar categorias&quot; acima para criar as suas.
              </p>
            )}
          </div>

          {/* Valores: Total e Parcela */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                {type === 'recorrente' ? 'Valor por Período (R$)' : 'Valor Total (R$)'}{' '}
                <span className="text-rose-500">*</span>
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

            {type === 'parcelado' && (
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
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-bold text-emerald-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition ${
                      errors.installmentAmount ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.installmentAmount && (
                  <p className="text-rose-600 text-xs mt-1">{errors.installmentAmount}</p>
                )}
              </div>
            )}
          </div>

          {/* Data de Vencimento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                {type === 'parcelado'
                  ? 'Data de Vencimento (1ª Parcela)'
                  : type === 'recorrente'
                  ? 'Primeiro Vencimento'
                  : 'Data de Vencimento'}
              </span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (type === 'recorrente') {
                  setRecurrenceStartDate(e.target.value);
                  const d = parseInt(e.target.value.split('-')[2] || '1', 10);
                  setDueDay(d);
                }
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition ${
                errors.dueDate ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {errors.dueDate && <p className="text-rose-600 text-xs mt-1">{errors.dueDate}</p>}
          </div>

          {/* Controle de Parcelas (somente se parcelado) */}
          {type === 'parcelado' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block">
                Controle de Parcelas
              </span>

              <div className="grid grid-cols-3 gap-2">
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
            </div>
          )}

          {/* Regra 4: Ao editar recorrência, perguntar o escopo da alteração */}
          {editingExpense && editingExpense.type === 'recorrente' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Escopo da Alteração</span>
              </span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Esta conta faz parte de uma série recorrente. Onde deseja aplicar as modificações?
              </p>
              <div className="space-y-1.5 pt-1 text-xs font-semibold text-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recurrenceScope"
                    value="single"
                    checked={recurrenceScope === 'single'}
                    onChange={() => setRecurrenceScope('single')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Somente este lançamento (ex: valor pontual deste mês)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recurrenceScope"
                    value="future_all"
                    checked={recurrenceScope === 'future_all'}
                    onChange={() => setRecurrenceScope('future_all')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Este e os próximos lançamentos (atualiza o valor e regra geral)</span>
                </label>
              </div>
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
              placeholder="Ex: Pix automático, código de barras, contrato de locação..."
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
              {isSubmitting
                ? 'Salvando...'
                : editingExpense
                ? 'Salvar Alterações'
                : 'Cadastrar Despesa'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
