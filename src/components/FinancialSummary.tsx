import React from 'react';
import {
  Wallet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarClock,
  Layers,
  TrendingDown,
} from 'lucide-react';
import { FinancialSummaryData } from '../types/expense';
import { formatCurrency } from '../utils/formatters';

interface FinancialSummaryProps {
  summary: FinancialSummaryData;
  isAllMonths: boolean;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  summary,
  isAllMonths,
}) => {
  const percentagePaid =
    summary.totalExpensesAmount > 0
      ? Math.round((summary.totalPaidAmount / summary.totalExpensesAmount) * 100)
      : 0;

  return (
    <section className="mb-6 space-y-4">
      {/* Cartões Principais do Painel Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Total de Despesas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isAllMonths ? 'Total Geral Cadastrado' : 'Despesas do Período'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-zinc-50 text-zinc-900 flex items-center justify-center border border-zinc-200">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatCurrency(summary.totalExpensesAmount)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>
              <strong>{summary.totalExpensesCount}</strong> {summary.totalExpensesCount === 1 ? 'conta cadastrada' : 'contas cadastradas'}
            </span>
          </div>
        </div>

        {/* Card 2: Total Já Pago */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Total Já Pago
            </span>
            <div className="w-9 h-9 rounded-xl bg-zinc-200/70 text-black flex items-center justify-center border border-zinc-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            {formatCurrency(summary.totalPaidAmount)}
          </div>
          
          {/* Barra de Progresso % Pago */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Progresso de quitação</span>
              <span className="text-zinc-900 font-bold">{percentagePaid}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-zinc-500 to-black rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, percentagePaid))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Total Ainda Pendente */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Total Ainda a Pagar
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/70">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-800 tracking-tight">
            {formatCurrency(summary.totalPendingAmount)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 font-medium">
            <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
            <span>Compromisso em aberto</span>
          </div>
        </div>



      </div>
    </section>
  );
};
