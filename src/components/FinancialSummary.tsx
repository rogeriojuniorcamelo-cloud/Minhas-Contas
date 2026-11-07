import React from 'react';
import {
  Wallet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarClock,
  Layers,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';
import { FinancialSummaryData } from '../types/expense';
import { formatCurrency } from '../utils/formatters';

interface FinancialSummaryProps {
  summary: FinancialSummaryData;
  onFilterStatus?: (status: 'todas' | 'pendente' | 'paga' | 'atrasada' | 'vence_hoje') => void;
  activeStatusFilter?: string;
  isAllMonths: boolean;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  summary,
  onFilterStatus,
  activeStatusFilter,
  isAllMonths,
}) => {
  const percentagePaid =
    summary.totalExpensesAmount > 0
      ? Math.round((summary.totalPaidAmount / summary.totalExpensesAmount) * 100)
      : 0;

  return (
    <section className="mb-6 space-y-4">
      {/* Alertas Rápidos de Contas Atrasadas e Próximas */}
      {(summary.overdueCount > 0 || summary.dueTodayCount > 0 || summary.dueSoonCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Card Atrasadas */}
          {summary.overdueCount > 0 && (
            <button
              type="button"
              onClick={() => onFilterStatus && onFilterStatus('atrasada')}
              className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between shadow-xs ${
                activeStatusFilter === 'atrasada'
                  ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400'
                  : 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                    Contas Atrasadas
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-rose-950">
                      {summary.overdueCount} {summary.overdueCount === 1 ? 'conta' : 'contas'}
                    </span>
                    <span className="text-xs font-semibold text-rose-700">
                      ({formatCurrency(summary.overdueAmount)})
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-200/60 px-2 py-1 rounded-lg">
                Ver
              </span>
            </button>
          )}

          {/* Card Vence Hoje */}
          {summary.dueTodayCount > 0 && (
            <button
              type="button"
              onClick={() => onFilterStatus && onFilterStatus('vence_hoje')}
              className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between shadow-xs ${
                activeStatusFilter === 'vence_hoje'
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400'
                  : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                  <CalendarClock className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                    Vencem Hoje!
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-amber-950">
                      {summary.dueTodayCount} {summary.dueTodayCount === 1 ? 'conta' : 'contas'}
                    </span>
                    <span className="text-xs font-semibold text-amber-700">
                      ({formatCurrency(summary.dueTodayAmount)})
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2 py-1 rounded-lg">
                Pagar
              </span>
            </button>
          )}

          {/* Card Próximas do Vencimento (próximos 7 dias) */}
          {summary.dueSoonCount > 0 && (
            <button
              type="button"
              onClick={() => onFilterStatus && onFilterStatus('pendente')}
              className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between shadow-xs ${
                activeStatusFilter === 'pendente'
                  ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400'
                  : 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    Próximas (7 Dias)
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-emerald-950">
                      {summary.dueSoonCount} {summary.dueSoonCount === 1 ? 'conta' : 'contas'}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">
                      ({formatCurrency(summary.dueSoonAmount)})
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-200/60 px-2 py-1 rounded-lg">
                Ver
              </span>
            </button>
          )}
        </div>
      )}

      {/* Cartões Principais do Painel Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total de Despesas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isAllMonths ? 'Total Geral Cadastrado' : 'Despesas do Período'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
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
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Total Já Pago
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
            {formatCurrency(summary.totalPaidAmount)}
          </div>
          
          {/* Barra de Progresso % Pago */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Progresso de quitação</span>
              <span className="text-emerald-700 font-bold">{percentagePaid}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
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

        {/* Card 4: Parcelas Restantes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Parcelas Restantes
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {summary.totalRemainingInstallments}
            <span className="text-sm font-semibold text-slate-400 ml-1">parcelas</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Previsão para quitação gradual
          </div>
        </div>

      </div>
    </section>
  );
};
