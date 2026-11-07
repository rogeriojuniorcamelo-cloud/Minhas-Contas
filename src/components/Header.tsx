import React, { useState } from 'react';
import {
  Plus,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Globe,
  WifiOff,
  Tag,
} from 'lucide-react';
import { formatMonthYearBR } from '../utils/formatters';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  currentMonthYear: string;
  onMonthChange: (newMonthYear: string) => void;
  onOpenNewExpense: () => void;
  onOpenCategories: () => void;
  onOpenBackup: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonthYear,
  onMonthChange,
  onOpenNewExpense,
  onOpenCategories,
  onOpenBackup,
  onOpenGuide,
}) => {
  const { isInstallable, isInstalled, isIOS, isOnline, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Navegação entre meses (ex: "2026-11")
  const handlePrevMonth = () => {
    if (currentMonthYear === 'todos') {
      const now = new Date();
      onMonthChange(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
      return;
    }
    const [y, m] = currentMonthYear.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newY = prevDate.getFullYear();
    const newM = String(prevDate.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${newY}-${newM}`);
  };

  const handleNextMonth = () => {
    if (currentMonthYear === 'todos') {
      const now = new Date();
      onMonthChange(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
      return;
    }
    const [y, m] = currentMonthYear.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const newY = nextDate.getFullYear();
    const newM = String(nextDate.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${newY}-${newM}`);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    onMonthChange(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <header className="sticky top-0 z-30 bg-black text-white shadow-md border-b border-black">
      {/* Barra de Status Offline se desconectado */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>Modo Offline ativado — Dados salvos com segurança no seu dispositivo (IndexedDB).</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo e Título */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-black to-zinc-500 flex items-center justify-center shadow-lg shadow-black/40 border border-zinc-400/30">
                <span className="font-mono text-xl font-black text-black">R$</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 text-white">
                  MINHAS CONTAS
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-black text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-900">
                    Pro
                  </span>
                </h1>
                <p className="text-xs text-zinc-300/80 font-medium hidden sm:block">
                  Controle financeiro pessoal, parcelas e vencimentos
                </p>
              </div>
            </div>

            {/* Ações Mobile Topo */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={onOpenCategories}
                className="p-2 bg-zinc-950 text-zinc-300 rounded-xl border border-black"
                title="Categorias"
              >
                <Tag className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onOpenNewExpense}
                className="inline-flex items-center gap-1.5 bg-zinc-500 hover:bg-zinc-500 active:bg-black text-black font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Despesa</span>
              </button>
            </div>
          </div>

          {/* Navegador de Mês / Período */}
          <div className="flex items-center justify-between sm:justify-center gap-2 bg-zinc-950/80 p-1.5 rounded-2xl border border-black/80 shadow-inner">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Mês anterior"
              className="p-1.5 rounded-xl hover:bg-black text-zinc-300 hover:text-white transition active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1 px-2">
              <Calendar className="w-4 h-4 text-zinc-500 hidden sm:block" />
              <button
                type="button"
                onClick={() => onMonthChange(currentMonthYear === 'todos' ? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}` : 'todos')}
                className="text-xs sm:text-sm font-semibold tracking-wide text-zinc-50 hover:text-white underline-offset-4 hover:underline px-1 py-0.5 rounded"
                title="Clique para alternar entre mês específico e histórico total"
              >
                {formatMonthYearBR(currentMonthYear)}
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Próximo mês"
              className="p-1.5 rounded-xl hover:bg-black text-zinc-300 hover:text-white transition active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {currentMonthYear !== 'todos' && (
              <button
                type="button"
                onClick={handleCurrentMonth}
                className="text-[11px] font-semibold bg-black hover:bg-zinc-900 text-zinc-300 px-2.5 py-1 rounded-lg transition"
              >
                Mês Atual
              </button>
            )}

            <button
              type="button"
              onClick={() => onMonthChange(currentMonthYear === 'todos' ? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}` : 'todos')}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition ${
                currentMonthYear === 'todos'
                  ? 'bg-zinc-500 text-black font-bold'
                  : 'bg-black/60 hover:bg-black text-zinc-300'
              }`}
            >
              Ver Todas
            </button>
          </div>

          {/* Ações Rápidas (Desktop e Tablets) */}
          <div className="flex items-center gap-2 justify-end overflow-x-auto pb-1 sm:pb-0">
            {/* Botão de Instalação PWA Android */}
            {isInstallable && !isInstalled && (
              <button
                type="button"
                onClick={install}
                className="inline-flex items-center gap-1.5 bg-zinc-900/80 hover:bg-black text-white text-xs font-semibold px-3 py-2 rounded-xl border border-zinc-500/30 transition shadow-sm animate-pulse"
                title="Instalar aplicativo no Android / Computador"
              >
                <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Instalar App</span>
                <span className="sm:hidden">Instalar</span>
              </button>
            )}

            {/* Botão de Ajuda de Instalação iOS */}
            {isIOS && !isInstalled && (
              <button
                type="button"
                onClick={() => setShowIOSModal(true)}
                className="inline-flex items-center gap-1.5 bg-black/80 hover:bg-zinc-900 text-zinc-200 text-xs font-medium px-2.5 py-2 rounded-xl border border-zinc-900 transition"
                title="Instruções para iPhone/iPad"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Instalar no iOS</span>
              </button>
            )}

            {/* Botão Gerenciar Categorias (Melhoria 2) */}
            <button
              type="button"
              onClick={onOpenCategories}
              className="inline-flex items-center gap-1.5 bg-zinc-950 hover:bg-black text-zinc-200 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl border border-zinc-900/80 transition"
              title="Gerenciar categorias de despesas"
            >
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
              <span>Categorias</span>
            </button>

            {/* Botão de Backup e Restauração */}
            <button
              type="button"
              onClick={onOpenBackup}
              className="inline-flex items-center gap-1.5 bg-zinc-950 hover:bg-black text-zinc-200 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl border border-zinc-900/80 transition"
              title="Backup, exportar ou restaurar dados em JSON"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Backup</span>
            </button>

            {/* Botão Guia GitHub Pages */}
            <button
              type="button"
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 bg-zinc-950 hover:bg-black text-zinc-200 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl border border-zinc-900/80 transition"
              title="Como publicar gratuitamente no GitHub Pages"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden lg:inline">Publicar Grátis</span>
            </button>

            {/* Botão Nova Despesa (Desktop) */}
            <button
              type="button"
              onClick={onOpenNewExpense}
              className="hidden md:inline-flex items-center gap-2 bg-gradient-to-r from-zinc-500 to-zinc-500 hover:from-zinc-500 hover:to-zinc-400 text-black font-bold text-sm px-4 py-2 rounded-xl shadow-lg shadow-zinc-950/30 transition-all hover:shadow-zinc-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nova Despesa</span>
            </button>
          </div>

        </div>
      </div>

      {/* Modal Instruções iOS */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-slate-800 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-zinc-950 mb-3">
              <div className="p-2.5 rounded-xl bg-zinc-200 text-zinc-900">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base">Instalar no iPhone / iPad</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Para usar o Minhas Contas como um aplicativo nativo em tela cheia no iOS:
            </p>
            <ol className="text-xs text-slate-700 space-y-2.5 list-decimal pl-4 mb-5">
              <li>No navegador <strong>Safari</strong>, toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima).</li>
              <li>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</li>
              <li>Toque em <strong>Adicionar</strong> no canto superior direito.</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-black hover:bg-zinc-950 text-white rounded-xl text-xs font-bold transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
