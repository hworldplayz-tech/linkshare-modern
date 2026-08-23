import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Handle and suppress cross-origin third-party script errors (e.g. ad networks) from breaking app runtime
window.onerror = function(msg) {
  if (!msg || msg === 'Script error.' || String(msg).includes('Script error')) {
    return true;
  }
};

window.addEventListener('error', (event) => {
  if (
    !event.message ||
    event.message === 'Script error.' ||
    event.message?.includes('Script error') ||
    event.filename?.includes('verticallysaturate.com') ||
    event.filename?.includes('invoke.js')
  ) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);

