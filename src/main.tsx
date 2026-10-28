import {StrictMode, Suspense, lazy} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { lockViewport } from './utils/lockViewport';
import './index.css';

const PromptBuilderPage = lazy(() => import('./prompt-builder/PromptBuilderPage.tsx'));
const isPromptBuilder = window.location.pathname.replace(/\/+$/, '') === '/prompt-builder';

lockViewport();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isPromptBuilder ? (
      <Suspense fallback={null}>
        <PromptBuilderPage />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
