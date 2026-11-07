import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileJson,
  ShieldCheck,
} from 'lucide-react';
import { exportBackupJSON, importBackupJSON, clearAllExpenses } from '../services/db';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReload: () => Promise<void>;
  totalExpensesCount: number;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataReload,
  totalExpensesCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  // Exportar JSON
  const handleExport = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const jsonStr = await exportBackupJSON();
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `backup-minhas-contas-${dateStr}.json`;

      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: `Arquivo "${filename}" baixado com sucesso! Seus dados estão seguros.`,
      });
    } catch (err: any) {
      console.error('Erro ao exportar:', err);
      setStatusMessage({
        type: 'error',
        text: 'Falha ao gerar o arquivo de backup. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Importar JSON
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const res = await importBackupJSON(content, importMode);
        if (res.success) {
          await onDataReload();
          setStatusMessage({
            type: 'success',
            text: `Backup restaurado com sucesso! ${res.count} despesas carregadas.`,
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: res.error || 'Erro ao importar backup.',
          });
        }
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: 'Arquivo JSON inválido ou incompatível.',
        });
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setIsLoading(false);
      setStatusMessage({
        type: 'error',
        text: 'Não foi possível ler o arquivo selecionado.',
      });
    };

    reader.readAsText(file);
  };

  // Limpar Tudo
  const handleClearAll = async () => {
    setIsLoading(true);
    try {
      await clearAllExpenses();
      await onDataReload();
      setShowClearConfirm(false);
      setStatusMessage({
        type: 'success',
        text: 'Todas as despesas foram removidas do banco de dados local.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Erro ao limpar banco de dados.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-200 text-black flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Gerenciar Dados & Backup</h2>
              <p className="text-xs text-slate-500 font-medium">Armazenamento 100% local no seu navegador</p>
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

        {/* Mensagem de Feedback */}
        {statusMessage && (
          <div
            className={`mt-4 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-semibold ${
              statusMessage.type === 'success'
                ? 'bg-zinc-50 text-zinc-950 border border-zinc-300'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>{statusMessage.text}</div>
          </div>
        )}

        <div className="mt-4 space-y-4">
          
          {/* Seção 1: Exportar Backup */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-black text-white shrink-0 mt-0.5">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Exportar Backup em JSON
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Baixe um arquivo seguro com todas as suas contas e categorias personalizadas ({totalExpensesCount} no total).
                </p>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isLoading}
                  className="mt-3 inline-flex items-center gap-1.5 bg-black hover:bg-zinc-950 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  <FileJson className="w-4 h-4" />
                  <span>Baixar Arquivo JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* Seção 2: Restaurar Backup */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
                <Upload className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Restaurar Backup em JSON
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Carregue um arquivo JSON gerado anteriormente para restaurar suas contas.
                </p>

                {/* Opção de Modo de Importação */}
                <div className="mt-2.5 flex items-center gap-4 text-xs font-semibold text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-zinc-900 focus:ring-black"
                    />
                    <span>Substituir tudo</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="text-zinc-900 focus:ring-black"
                    />
                    <span>Mesclar contas</span>
                  </label>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="mt-3 inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>Selecionar Arquivo JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* Seção 3: Informações de Privacidade do IndexedDB */}
          <div className="p-3.5 rounded-2xl bg-zinc-50/60 border border-zinc-200 flex items-start gap-2.5 text-xs text-black font-medium">
            <ShieldCheck className="w-5 h-5 text-zinc-900 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Privacidade Total:</strong> Os seus dados financeiros nunca saem do seu navegador. Não há servidores remotos coletando suas informações.
            </p>
          </div>

          {/* Seção 4: Limpar Dados (Zona de Perigo) */}
          <div className="pt-2 border-t border-slate-100">
            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Apagar todas as despesas e reiniciar banco</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs">
                <p className="font-bold text-rose-800">
                  Tem certeza? Todas as contas serão apagadas permanentemente.
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition"
                  >
                    Sim, apagar tudo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

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
