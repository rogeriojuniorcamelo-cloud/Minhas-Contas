import React from 'react';
import { X, Globe, GitBranch, CheckCircle, Terminal, ExternalLink, Zap } from 'lucide-react';

interface GitHubPagesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPagesGuideModal: React.FC<GitHubPagesGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-200 text-black flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Como Publicar Gratuitamente</h2>
              <p className="text-xs text-slate-500 font-medium">100% estático • GitHub Pages, Vercel ou Netlify</p>
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

        {/* Conteúdo */}
        <div className="mt-4 space-y-4 text-xs text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
          
          <div className="p-3.5 rounded-2xl bg-zinc-50/70 border border-zinc-300 text-black">
            <div className="flex items-center gap-2 font-bold mb-1 text-zinc-950">
              <Zap className="w-4 h-4 text-black" />
              <span>Pronto para Produção Estática</span>
            </div>
            O aplicativo <strong>MINHAS CONTAS</strong> foi desenvolvido com Vite, React e Tailwind CSS puro, utilizando <strong>IndexedDB local</strong>. Ele não requer nenhum servidor Node.js em produção e já está configurado com caminhos relativos (<code>base: './'</code>) para funcionar em qualquer subpasta do GitHub Pages.
          </div>

          {/* Passo a Passo GitHub Pages */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-zinc-900" />
              <span>Passo a Passo para GitHub Pages:</span>
            </h3>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="font-bold text-slate-800">1. Gerar o pacote estático de build:</div>
              <div className="bg-slate-900 text-zinc-500 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto">
                npm run build
              </div>
              <p className="text-slate-500 text-[11px]">
                Isso criará a pasta <code>dist/</code> com todos os arquivos estáticos otimizados (HTML, CSS, JS, manifesto PWA e ícones).
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="font-bold text-slate-800">2. Criar repositório e enviar para o GitHub:</div>
              <div className="bg-slate-900 text-zinc-500 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre">
{`git init
git add .
git commit -m "Publicação Minhas Contas"
git remote add origin https://github.com/SEU-USUARIO/minhas-contas.git
git push -u origin main`}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="font-bold text-slate-800">3. Ativar o GitHub Pages no seu repositório:</div>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 text-[11px]">
                <li>Acesse o seu repositório no <strong>GitHub</strong>.</li>
                <li>Clique em <strong>Settings</strong> (Configurações) &gt; <strong>Pages</strong>.</li>
                <li>Em <em>Build and deployment &gt; Source</em>, selecione <strong>Deploy from a branch</strong> ou <strong>GitHub Actions</strong>.</li>
                <li>Para deploy rápido com branch, selecione a branch e a pasta <code>/dist</code> (ou utilize o pacote gratuito <code>gh-pages</code> executando <code>npx gh-pages -d dist</code>).</li>
              </ol>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="font-bold text-slate-800">Opção Alternativa (Deploy em 1 Minuto):</div>
              <p className="text-slate-600 text-[11px]">
                Você também pode arrastar a pasta <code>dist/</code> gerada diretamente no <strong>Vercel</strong>, <strong>Netlify Drop</strong> ou <strong>Cloudflare Pages</strong>. Ambos oferecem HTTPS gratuito e compatibilidade total com PWA e IndexedDB!
              </p>
            </div>
          </div>

        </div>

        {/* Rodapé */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-black hover:bg-zinc-950 text-white rounded-xl text-xs font-bold transition"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
