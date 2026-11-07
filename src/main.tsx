import React from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Erro inesperado ao iniciar.' };
  }

  componentDidCatch(error: Error) {
    console.error('Erro fatal na interface Minhas Contas:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ fontFamily: 'Arial, sans-serif', padding: 24, color: '#1f2937' }}>
          <h1>Não foi possível abrir o painel</h1>
          <p>O aplicativo encontrou um erro ao iniciar. Seus dados locais não foram apagados.</p>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#991b1b' }}>{this.state.message}</pre>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '12px 18px', borderRadius: 8, background: '#065f46', color: '#fff' }}
          >
            Tentar novamente
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}

let updateServiceWorker: (reloadPage?: boolean) => Promise<void> = async () => {};
updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Ativa a versão nova e recarrega a página para evitar manter arquivos antigos em cache.
    void updateServiceWorker(true);
  },
  onOfflineReady() {
    console.log('Aplicativo pronto para funcionamento offline.');
  },
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </React.StrictMode>
  );
}
