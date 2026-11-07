import React from 'react';
import { Search, Filter, LayoutGrid, List, ArrowDownUp, X, Tag } from 'lucide-react';
import { CategoryInfo, ExpenseFiltersState, ExpenseType } from '../types/expense';

interface ExpenseFiltersProps {
  filters: ExpenseFiltersState;
  onFilterChange: (newFilters: Partial<ExpenseFiltersState>) => void;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
  totalFilteredCount: number;
  categories: CategoryInfo[];
  onOpenCategoryManager?: () => void;
}

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
  categories,
  onOpenCategoryManager,
}) => {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== 'todas' ||
    filters.status !== 'todas' ||
    (filters.typeFilter && filters.typeFilter !== 'todos');

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: 'todas',
      status: 'todas',
      typeFilter: 'todos',
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6 space-y-3">
      {/* Linha Superior: Busca + Ordenação + Toggle Tabela/Cards */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Barra de Pesquisa */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Pesquisar conta por nome ou observação..."
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Ordenação e Modo de Visualização */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Seletor de Ordenação */}
          <div className="relative flex items-center">
            <ArrowDownUp className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="pl-8 pr-7 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 appearance-none cursor-pointer"
            >
              <option value="dueDate_asc">Vencimento (Mais próximo)</option>
              <option value="dueDate_desc">Vencimento (Mais distante)</option>
              <option value="amount_desc">Maior Valor</option>
              <option value="amount_asc">Menor Valor</option>
              <option value="name_asc">Nome (A - Z)</option>
            </select>
          </div>

          {/* Toggle Cards / Tabela */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => onViewModeChange('cards')}
              title="Visualização em Cartões"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'cards'
                  ? 'bg-white text-emerald-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              title="Visualização em Tabela"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-white text-emerald-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Linha Inferior: Filtros de Categoria, Tipo e Situação */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        
        {/* Filtro de Situação (Status) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Situação:
          </span>

          <button
            type="button"
            onClick={() => onFilterChange({ status: 'todas' })}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
              filters.status === 'todas'
                ? 'bg-emerald-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ status: 'pendente' })}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
              filters.status === 'pendente'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Pendentes
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ status: 'paga' })}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
              filters.status === 'paga'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Pagas
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ status: 'atrasada' })}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
              filters.status === 'atrasada'
                ? 'bg-rose-700 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Atrasadas
          </button>
        </div>

        {/* Filtro de Tipo e Categoria */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Filtro de Tipo de Conta */}
          <select
            value={filters.typeFilter || 'todos'}
            onChange={(e) => onFilterChange({ typeFilter: e.target.value as any })}
            className="text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="recorrente">Recorrentes</option>
            <option value="parcelado">Parceladas</option>
            <option value="a_vista">À Vista</option>
          </select>

          {/* Filtro de Categoria Dinâmica */}
          <div className="flex items-center gap-1">
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
              className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="todas">Todas as Categorias</option>
              <option value="sem_categoria">Sem categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            {onOpenCategoryManager && (
              <button
                type="button"
                onClick={onOpenCategoryManager}
                title="Gerenciar Categorias"
                className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition"
              >
                <Tag className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline underline-offset-2 px-1"
            >
              Limpar
            </button>
          )}

          <span className="text-xs font-medium text-slate-400">
            ({totalFilteredCount} {totalFilteredCount === 1 ? 'conta' : 'contas'})
          </span>
        </div>

      </div>
    </div>
  );
};
