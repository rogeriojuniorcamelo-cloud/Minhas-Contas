/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllExpenses,
  saveExpense,
  deleteExpense as dbDeleteExpense,
  cleanupLegacyDemoData,
  getAllCategories,
  syncRecurringExpenses,
  updateRecurringExpense,
  interruptRecurrence,
} from './services/db';
import {
  Expense,
  ExpenseFiltersState,
  FinancialSummaryData,
  CategoryInfo,
} from './types/expense';
import {
  getCurrentYearMonth,
  getExpenseCalculatedStatus,
  getTodayString,
} from './utils/dateUtils';
import { Header } from './components/Header';
import { FinancialSummary } from './components/FinancialSummary';
import { ExpenseFilters } from './components/ExpenseFilters';
import { ExpenseCard } from './components/ExpenseCard';
import { ExpenseTable } from './components/ExpenseTable';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { PaymentModal } from './components/PaymentModal';
import { ExpenseDetailModal } from './components/ExpenseDetailModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { BackupModal } from './components/BackupModal';
import { GitHubPagesGuideModal } from './components/GitHubPagesGuideModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { Plus, Wallet, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonthYear, setCurrentMonthYear] = useState<string>(getCurrentYearMonth());
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filtros
  const [filters, setFilters] = useState<ExpenseFiltersState>({
    search: '',
    category: 'todas',
    status: 'todas',
    monthYear: currentMonthYear,
    sortBy: 'dueDate_asc',
    typeFilter: 'todos',
  });

  // Modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentExpense, setPaymentExpense] = useState<Expense | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailExpense, setDetailExpense] = useState<Expense | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState<Expense | null>(null);

  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  // Notificação Toast rápida
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Carrega categorias e despesas do IndexedDB na inicialização
  const loadData = async () => {
    try {
      setIsLoading(true);
      // Limpeza e sincronização são auxiliares: uma falha nelas não pode impedir
      // a abertura do painel nem a leitura das despesas já armazenadas.
      try {
        await cleanupLegacyDemoData();
      } catch (cleanupError) {
        console.error('Aviso: não foi possível concluir a limpeza de dados antigos:', cleanupError);
      }

      try {
        await syncRecurringExpenses();
      } catch (recurrenceError) {
        console.error('Aviso: não foi possível sincronizar recorrências:', recurrenceError);
      }

      const [loadedExpenses, loadedCategories] = await Promise.all([
        getAllExpenses(),
        getAllCategories(),
      ]);

      setExpenses(loadedExpenses);
      setCategories(loadedCategories);
    } catch (err) {
      console.error('Erro ao carregar do IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recarrega apenas categorias
  const handleReloadCategories = async () => {
    const updatedCats = await getAllCategories();
    setCategories(updatedCats);
    const updatedExps = await getAllExpenses();
    setExpenses(updatedExps);
  };

  // Sincroniza mês selecionado
  const handleMonthChange = (newMonthYear: string) => {
    setCurrentMonthYear(newMonthYear);
  };

  // Cálculo de Resumo Financeiro
  const summaryData: FinancialSummaryData = useMemo(() => {
    let totalExpensesCount = 0;
    let totalExpensesAmount = 0;
    let totalPaidAmount = 0;
    let totalPendingAmount = 0;
    let totalRemainingInstallments = 0;

    let overdueCount = 0;
    let overdueAmount = 0;

    let dueSoonCount = 0;
    let dueSoonAmount = 0;

    let dueTodayCount = 0;
    let dueTodayAmount = 0;

    expenses.forEach((expense) => {
      // Se estamos filtrando por mês específico, verificamos a relevância desta despesa
      if (currentMonthYear !== 'todos') {
        const hasInstallmentInMonth = expense.installments?.some((inst) =>
          inst.dueDate.startsWith(currentMonthYear)
        );
        const matchesPrimaryDue = expense.dueDate.startsWith(currentMonthYear);
        if (!hasInstallmentInMonth && !matchesPrimaryDue) {
          return;
        }
      }

      totalExpensesCount += 1;
      totalExpensesAmount += expense.totalAmount;

      const isRecurring = expense.type === 'recorrente';
      const isPaid = isRecurring
        ? expense.paidInstallments > 0 || expense.installments?.[0]?.isPaid === true
        : expense.paidInstallments >= expense.totalInstallments;

      if (isRecurring) {
        if (isPaid) {
          totalPaidAmount += expense.totalAmount;
        } else {
          totalPendingAmount += expense.totalAmount;
          totalRemainingInstallments += 1;
        }
      } else {
        const remainingInstallments = Math.max(
          0,
          expense.totalInstallments - expense.paidInstallments
        );
        totalRemainingInstallments += remainingInstallments;

        const paidPart = expense.paidInstallments * expense.installmentAmount;
        const pendingPart = remainingInstallments * expense.installmentAmount;

        totalPaidAmount += paidPart;
        totalPendingAmount += pendingPart;
      }

      const { status, isDueToday, daysDifference } = getExpenseCalculatedStatus(expense);

      if (!isPaid) {
        if (status === 'atrasada') {
          overdueCount += 1;
          overdueAmount += expense.installmentAmount;
        } else if (isDueToday) {
          dueTodayCount += 1;
          dueTodayAmount += expense.installmentAmount;
        } else if (daysDifference > 0 && daysDifference <= 7) {
          dueSoonCount += 1;
          dueSoonAmount += expense.installmentAmount;
        }
      }
    });

    return {
      totalExpensesCount,
      totalExpensesAmount,
      totalPaidAmount,
      totalPendingAmount,
      totalRemainingInstallments,
      overdueCount,
      overdueAmount,
      dueSoonCount,
      dueSoonAmount,
      dueTodayCount,
      dueTodayAmount,
    };
  }, [expenses, currentMonthYear]);

  // Filtragem e Ordenação da Lista de Despesas
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        // Filtro por Mês/Ano
        if (currentMonthYear !== 'todos') {
          const hasInstallmentInMonth = expense.installments?.some((inst) =>
            inst.dueDate.startsWith(currentMonthYear)
          );
          const matchesPrimaryDue = expense.dueDate.startsWith(currentMonthYear);
          if (!hasInstallmentInMonth && !matchesPrimaryDue) {
            return false;
          }
        }

        // Filtro por Busca de Texto
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase();
          const nameMatch = expense.name.toLowerCase().includes(q);
          const notesMatch = expense.notes ? expense.notes.toLowerCase().includes(q) : false;
          if (!nameMatch && !notesMatch) return false;
        }

        // Filtro por Tipo de Despesa
        if (filters.typeFilter && filters.typeFilter !== 'todos') {
          if (expense.type !== filters.typeFilter) return false;
        }

        // Filtro por Categoria
        if (filters.category !== 'todas') {
          if (filters.category === 'sem_categoria') {
            if (expense.category) return false;
          } else if (expense.category !== filters.category) {
            return false;
          }
        }

        // Filtro por Situação
        if (filters.status !== 'todas') {
          const { status, isDueToday } = getExpenseCalculatedStatus(expense);
          if (filters.status === 'vence_hoje') {
            if (!isDueToday) return false;
          } else if (filters.status !== status) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const statusA = getExpenseCalculatedStatus(a);
        const statusB = getExpenseCalculatedStatus(b);

        switch (filters.sortBy) {
          case 'dueDate_asc':
            return (a.dueDate || statusA.nextDueDate).localeCompare(b.dueDate || statusB.nextDueDate);
          case 'dueDate_desc':
            return (b.dueDate || statusB.nextDueDate).localeCompare(a.dueDate || statusA.nextDueDate);
          case 'amount_desc':
            return b.totalAmount - a.totalAmount;
          case 'amount_asc':
            return a.totalAmount - b.totalAmount;
          case 'name_asc':
            return a.name.localeCompare(b.name, 'pt-BR');
          default:
            return 0;
        }
      });
  }, [expenses, currentMonthYear, filters]);

  // Ações de CRUD
  const handleSaveExpense = async (
    savedExpense: Expense,
    options?: { recurrenceScope?: 'single' | 'future_all' }
  ) => {
    if (savedExpense.type === 'recorrente' && editingExpense) {
      const scope = options?.recurrenceScope || 'future_all';
      await updateRecurringExpense(savedExpense, scope);
    } else {
      await saveExpense(savedExpense);
    }

    // Se for recorrente, sincroniza horizonte de lançamentos
    if (savedExpense.type === 'recorrente') {
      await syncRecurringExpenses();
    }

    const updated = await getAllExpenses();
    setExpenses(updated);

    showToast(
      editingExpense
        ? `Despesa "${savedExpense.name}" atualizada com sucesso!`
        : `Despesa "${savedExpense.name}" cadastrada!`
    );
  };

  const handleDeleteExpense = async (expenseToDelete: Expense) => {
    await dbDeleteExpense(expenseToDelete.id);
    const updated = await getAllExpenses();
    setExpenses(updated);
    showToast(`Despesa "${expenseToDelete.name}" excluída.`);
  };

  // Interromper uma série recorrente (Regra 3 & 5)
  const handleInterruptRecurrence = async (groupId: string) => {
    const today = getTodayString();
    const res = await interruptRecurrence(groupId, today);
    const updated = await getAllExpenses();
    setExpenses(updated);
    showToast(
      `Recorrência interrompida. ${res.preservedCount} lançamento(s) anteriores preservados.`
    );
  };

  // Registrar Pagamento (através do modal rápido)
  const handleConfirmPayment = async (
    expense: Expense,
    options: { payAllRemaining: boolean; paymentDate: string }
  ) => {
    const updatedInstallments = [...expense.installments];
    let newPaidCount = expense.paidInstallments;

    if (expense.type === 'recorrente') {
      // Para recorrente, marca o lançamento atual como pago
      newPaidCount = 1;
      if (updatedInstallments.length > 0) {
        updatedInstallments[0].isPaid = true;
        updatedInstallments[0].paidDate = options.paymentDate;
      } else {
        updatedInstallments.push({
          number: 1,
          dueDate: expense.dueDate,
          amount: expense.totalAmount,
          isPaid: true,
          paidDate: options.paymentDate,
        });
      }
    } else if (options.payAllRemaining) {
      newPaidCount = expense.totalInstallments;
      updatedInstallments.forEach((inst) => {
        if (!inst.isPaid) {
          inst.isPaid = true;
          inst.paidDate = options.paymentDate;
        }
      });
    } else {
      // Paga a próxima parcela não paga
      const nextPending = updatedInstallments.find((inst) => !inst.isPaid);
      if (nextPending) {
        nextPending.isPaid = true;
        nextPending.paidDate = options.paymentDate;
        newPaidCount = Math.min(expense.totalInstallments, expense.paidInstallments + 1);
      }
    }

    const updatedExpense: Expense = {
      ...expense,
      paidInstallments: newPaidCount,
      installments: updatedInstallments,
      updatedAt: new Date().toISOString(),
    };

    await saveExpense(updatedExpense);
    const refreshed = await getAllExpenses();
    setExpenses(refreshed);

    if (detailExpense && detailExpense.id === expense.id) {
      setDetailExpense(updatedExpense);
    }

    showToast(
      expense.type === 'recorrente'
        ? `Lançamento de "${expense.name}" marcado como pago!`
        : options.payAllRemaining
        ? `Todas as parcelas de "${expense.name}" foram liquidadas!`
        : `Pagamento da parcela registrado com sucesso!`
    );
  };

  // Alternar pagamento de uma parcela individual no modal de detalhes (pagar ou desfazer)
  const handleToggleInstallment = async (
    expense: Expense,
    installmentNumber: number,
    isPaid: boolean
  ) => {
    const updatedInstallments = expense.installments.map((inst) => {
      if (inst.number === installmentNumber) {
        return {
          ...inst,
          isPaid,
          paidDate: isPaid ? getTodayString() : undefined,
        };
      }
      return inst;
    });

    const newPaidCount = updatedInstallments.filter((inst) => inst.isPaid).length;

    const updatedExpense: Expense = {
      ...expense,
      paidInstallments: newPaidCount,
      installments: updatedInstallments,
      updatedAt: new Date().toISOString(),
    };

    await saveExpense(updatedExpense);
    const refreshed = await getAllExpenses();
    setExpenses(refreshed);
    setDetailExpense(updatedExpense);

    showToast(
      isPaid
        ? `Pagamento registrado com sucesso!`
        : `Pagamento desfeito.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Cabeçalho */}
      <Header
        currentMonthYear={currentMonthYear}
        onMonthChange={handleMonthChange}
        onOpenNewExpense={() => {
          setEditingExpense(null);
          setIsFormOpen(true);
        }}
        onOpenCategories={() => setIsCategoriesOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Resumo Financeiro / Painel de Indicadores */}
        <FinancialSummary
          summary={summaryData}
          onFilterStatus={(status) => setFilters((prev) => ({ ...prev, status }))}
          activeStatusFilter={filters.status}
          isAllMonths={currentMonthYear === 'todos'}
        />

        {/* Filtros, Busca, Categorias e Ordenação */}
        <ExpenseFilters
          filters={filters}
          onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFilteredCount={filteredExpenses.length}
          categories={categories}
          onOpenCategoryManager={() => setIsCategoriesOpen(true)}
        />

        {/* Lista de Contas ou Mensagem de Vazio */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">Carregando suas contas...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <Wallet className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Nenhuma conta encontrada
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6 leading-relaxed">
              {filters.search || filters.category !== 'todas' || filters.status !== 'todas' || (filters.typeFilter && filters.typeFilter !== 'todos')
                ? 'Nenhuma despesa corresponde aos filtros aplicados. Tente limpar os filtros para ver todas as contas.'
                : 'Você ainda não possui despesas cadastradas neste período. Comece adicionando sua primeira conta!'}
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingExpense(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Nova Despesa</span>
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExpenses.map((expense) => {
              const catObj = categories.find((c) => c.id === expense.category);
              return (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  categoryObj={catObj}
                  onView={(exp) => {
                    setDetailExpense(exp);
                    setIsDetailOpen(true);
                  }}
                  onEdit={(exp) => {
                    setEditingExpense(exp);
                    setIsFormOpen(true);
                  }}
                  onDelete={(exp) => {
                    setDeleteExpenseTarget(exp);
                    setIsDeleteOpen(true);
                  }}
                  onPay={(exp) => {
                    setPaymentExpense(exp);
                    setIsPaymentOpen(true);
                  }}
                />
              );
            })}
          </div>
        ) : (
          <ExpenseTable
            expenses={filteredExpenses}
            categories={categories}
            onView={(exp) => {
              setDetailExpense(exp);
              setIsDetailOpen(true);
            }}
            onEdit={(exp) => {
              setEditingExpense(exp);
              setIsFormOpen(true);
            }}
            onDelete={(exp) => {
              setDeleteExpenseTarget(exp);
              setIsDeleteOpen(true);
            }}
            onPay={(exp) => {
              setPaymentExpense(exp);
              setIsPaymentOpen(true);
            }}
          />
        )}

      </main>

      {/* Botão Flutuante (FAB) para Mobile */}
      <button
        type="button"
        onClick={() => {
          setEditingExpense(null);
          setIsFormOpen(true);
        }}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white shadow-2xl flex items-center justify-center border-2 border-emerald-500 z-40 active:scale-95 transition"
        title="Nova Despesa"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Rodapé */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-bold text-emerald-950">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            <span>MINHAS CONTAS</span>
            <span className="text-slate-400 font-normal">• Controle Financeiro Pessoal</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Armazenamento Seguro via IndexedDB • 100% Offline • Sem Custos
          </div>
        </div>
      </footer>

      {/* Modal de Cadastro / Edição */}
      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
        categories={categories}
        onOpenCategoryManager={() => {
          setIsFormOpen(false);
          setIsCategoriesOpen(true);
        }}
      />

      {/* Modal de Registro de Pagamento */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setPaymentExpense(null);
        }}
        expense={paymentExpense}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Modal de Detalhes da Despesa */}
      <ExpenseDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailExpense(null);
        }}
        expense={detailExpense}
        categories={categories}
        onEdit={(exp) => {
          setEditingExpense(exp);
          setIsFormOpen(true);
        }}
        onToggleInstallment={handleToggleInstallment}
        onInterruptRecurrence={handleInterruptRecurrence}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteExpenseTarget(null);
        }}
        expense={deleteExpenseTarget}
        onConfirm={handleDeleteExpense}
      />

      {/* Modal de Gerenciamento de Categorias (Melhoria 2) */}
      <CategoryManagerModal
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        categories={categories}
        expenses={expenses}
        onCategoriesUpdated={handleReloadCategories}
      />

      {/* Modal de Backup / Restauração JSON */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataReload={loadData}
        totalExpensesCount={expenses.length}
      />

      {/* Modal Guia de Publicação no GitHub Pages */}
      <GitHubPagesGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

    </div>
  );
}
