import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@m3e/web/all';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
