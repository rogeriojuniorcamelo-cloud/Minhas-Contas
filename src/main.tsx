import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Registro unificado e automático do Service Worker via Vite PWA
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nova versão do aplicativo disponível.');
  },
  onOfflineReady() {
    console.log('Aplicativo pronto para funcionamento offline.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);

