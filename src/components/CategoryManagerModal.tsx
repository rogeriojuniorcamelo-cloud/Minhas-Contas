import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Tag,
  AlertTriangle,
  Check,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { CategoryInfo, Expense } from '../types/expense';
import {
  CategoryIcon,
  AVAILABLE_CATEGORY_ICONS,
  AVAILABLE_CATEGORY_COLORS,
} from './CategoryIcon';
import {
  saveCategory,
  deleteCategory,
  checkCategoryUsage,
} from '../services/db';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryInfo[];
  expenses: Expense[];
  onCategoriesUpdated: () => Promise<void>;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  expenses,
  onCategoriesUpdated,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Campos do formulário
  const [label, setLabel] = useState('');
  const [iconName, setIconName] = useState('Tag');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para exclusão com substituição obrigatória
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryInfo | null>(null);
  const [replacementCategoryId, setReplacementCategoryId] = useState<string>('');
  const [usedCount, setUsedCount] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setCategoryToDelete(null);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Declaração como função para estar disponível antes do useEffect.
  function resetForm() {
    setEditingId(null);
    setIsCreatingNew(false);
    setLabel('');
    setIconName('Tag');
    setSelectedColorIndex(0);
    setErrorMessage(null);
  }

  const handleStartCreate = () => {
    resetForm();
    setIsCreatingNew(true);
  };

  const handleStartEdit = (cat: CategoryInfo) => {
    setIsCreatingNew(false);
    setEditingId(cat.id);
    setLabel(cat.label);
    setIconName(cat.iconName || 'Tag');

    const colorIdx = AVAILABLE_CATEGORY_COLORS.findIndex(
      (c) => c.color.toLowerCase() === cat.color.toLowerCase()
    );
    setSelectedColorIndex(colorIdx >= 0 ? colorIdx : 0);
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = label.trim();
    if (!trimmed) {
      setErrorMessage('O nome da categoria não pode ficar em branco.');
      return;
    }

    // Regra 5: Impedir categorias duplicadas com o mesmo nome (case-insensitive)
    const isDuplicate = categories.some(
      (c) => c.id !== editingId && c.label.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMessage(`Já existe uma categoria cadastrada com o nome "${trimmed}".`);
      return;
    }

    setIsSubmitting(true);
    try {
      const colorScheme = AVAILABLE_CATEGORY_COLORS[selectedColorIndex] || AVAILABLE_CATEGORY_COLORS[0];
      const categoryId = editingId || 'cat_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

      const newCategory: CategoryInfo = {
        id: categoryId,
        label: trimmed,
        iconName,
        color: colorScheme.color,
        bgColor: colorScheme.bgColor,
        borderColor: colorScheme.borderColor,
        isDefault: editingId ? categories.find((c) => c.id === editingId)?.isDefault : false,
        createdAt: new Date().toISOString(),
      };

      await saveCategory(newCategory);
      await onCategoriesUpdated();

      setSuccessMessage(
        editingId
          ? `Categoria "${trimmed}" atualizada com sucesso!`
          : `Nova categoria "${trimmed}" adicionada!`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
      resetForm();
    } catch (err: any) {
      console.error('Erro ao salvar categoria:', err);
      setErrorMessage('Erro ao gravar no IndexedDB. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitiateDelete = async (cat: CategoryInfo) => {
    const usage = await checkCategoryUsage(cat.id);
    setUsedCount(usage);
    setCategoryToDelete(cat);

    // Seleciona uma categoria substituta padrão que não seja a mesma
    const other = categories.find((c) => c.id !== cat.id);
    setReplacementCategoryId(other ? other.id : '');
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);

    try {
      await deleteCategory(categoryToDelete.id, replacementCategoryId ? replacementCategoryId : undefined);
      await onCategoriesUpdated();

      setSuccessMessage(
        usedCount > 0
          ? `Categoria "${categoryToDelete.label}" excluída e ${usedCount} conta(s) reclassificada(s)!`
          : `Categoria "${categoryToDelete.label}" excluída com sucesso!`
      );
      setTimeout(() => setSuccessMessage(null), 3500);

      setCategoryToDelete(null);
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
      setErrorMessage('Falha ao excluir categoria.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-200 text-black flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Gerenciar Categorias</h2>
              <p className="text-xs text-slate-500 font-medium">Personalize categorias, ícones e cores</p>
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

        {/* Mensagens de Feedback */}
        {successMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-zinc-50 border border-zinc-300 text-zinc-950 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal interno para confirmação de exclusão com reclassificação */}
        {categoryToDelete ? (
          <div className="mt-5 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Excluir Categoria: {categoryToDelete.label}
                </h3>
                {usedCount > 0 ? (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Esta categoria está associada a{' '}
                    <strong className="text-slate-900 font-bold">{usedCount} despesa(s)</strong> cadastradas.
                    Para não perder seus lançamentos, selecione uma nova categoria para substituí-la:
                  </p>
                ) : (
                  <p className="text-xs text-slate-600 mt-1">
                    Nenhuma despesa utiliza esta categoria. Tem certeza de que deseja excluí-la?
                  </p>
                )}
              </div>
            </div>

            {/* Seletor de Categoria Substituta */}
            {usedCount > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nova Categoria para as Contas Vinculadas:
                </label>
                <select
                  value={replacementCategoryId}
                  onChange={(e) => setReplacementCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-black"
                >
                  <option value="">Deixar temporariamente sem categoria</option>
                  {categories
                    .filter((c) => c.id !== categoryToDelete.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                {isDeleting ? 'Excluindo...' : usedCount > 0 ? 'Reclassificar e Excluir' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        ) : isCreatingNew || editingId ? (
          /* Formulário de Adicionar / Editar */
          <form onSubmit={handleSave} className="mt-5 space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingId ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Cancelar
              </button>
            </div>

            {/* Nome */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Nome da Categoria <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: Assinaturas Digitais, Pets, Farmácia..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Seletor de Ícone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Ícone Representativo
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                {AVAILABLE_CATEGORY_ICONS.map((item) => {
                  const isSelected = iconName.toLowerCase() === item.id.toLowerCase();
                  const IconComp = item.component;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIconName(item.id)}
                      title={item.label}
                      className={`p-2 rounded-xl flex items-center justify-center transition ${
                        isSelected
                          ? 'bg-black text-white shadow-xs ring-2 ring-zinc-500'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seletor de Cor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Cor de Destaque
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_CATEGORY_COLORS.map((col, idx) => {
                  const isSelected = selectedColorIndex === idx;
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => setSelectedColorIndex(idx)}
                      title={col.name}
                      style={{ backgroundColor: col.color }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isSelected ? 'ring-3 ring-offset-2 ring-slate-900 scale-110' : 'opacity-85 hover:opacity-100'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pré-visualização da Badge */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Pré-visualização:</span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: AVAILABLE_CATEGORY_COLORS[selectedColorIndex]?.bgColor,
                  color: AVAILABLE_CATEGORY_COLORS[selectedColorIndex]?.color,
                  border: `1px solid ${AVAILABLE_CATEGORY_COLORS[selectedColorIndex]?.borderColor}`,
                }}
              >
                <CategoryIcon iconName={iconName} className="w-3.5 h-3.5" />
                <span>{label.trim() || 'Nova Categoria'}</span>
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-black hover:bg-zinc-950 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                {isSubmitting ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </div>
          </form>
        ) : (
          /* Lista de Categorias */
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {categories.length} {categories.length === 1 ? 'categoria cadastrada' : 'categorias cadastradas'}
              </span>
              <button
                type="button"
                onClick={handleStartCreate}
                className="inline-flex items-center gap-1.5 bg-black hover:bg-zinc-950 text-white font-bold text-xs py-1.5 px-3 rounded-xl shadow-xs transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Categoria</span>
              </button>
            </div>

            {categories.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-zinc-50 text-zinc-900 flex items-center justify-center mx-auto mb-2.5">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Nenhuma categoria cadastrada</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4 leading-relaxed">
                  A lista de categorias começa vazia. Você pode cadastrar manualmente suas próprias categorias para organizar suas despesas como preferir.
                </p>
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="inline-flex items-center gap-1.5 bg-black hover:bg-zinc-950 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Primeira Categoria</span>
                </button>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {categories.map((cat) => {
                  const count = expenses.filter((e) => e.category === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/80 flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: cat.bgColor,
                            color: cat.color,
                            border: `1px solid ${cat.borderColor}`,
                          }}
                        >
                          <CategoryIcon iconName={cat.iconName} category={cat.id} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm block truncate">
                            {cat.label}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {count} {count === 1 ? 'despesa vinculada' : 'despesas vinculadas'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          title="Editar categoria"
                          className="p-2 text-slate-500 hover:text-black hover:bg-slate-100 rounded-lg transition"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInitiateDelete(cat)}
                          title="Excluir categoria"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Rodapé */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
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
