import React from 'react';
import { Search, LayoutGrid, List, X, Tag } from 'lucide-react';
import { CategoryInfo, ExpenseFiltersState } from '../types/expense';

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
  const hasActiveFilters = filters.search !== '' || filters.category !== 'todas';

  const clearFilters = () => {
    onFilterChange({ search: '', category: 'todas' });
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6 space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
        <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => onViewModeChange('cards')}
            title="Visualização em Cartões"
            className={`p-1.5 rounded-lg transition ${viewMode === 'cards' ? 'bg-white text-emerald-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            title="Visualização em Tabela"
            className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-white text-zinc-950 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
              className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="todas">Todas as Categorias</option>
              <option value="sem_categoria">Sem categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
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
