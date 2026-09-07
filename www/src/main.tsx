import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ui } from 'beercss/dist/cdn/beer.min.js';
import 'material-dynamic-colors';
import App from './App.tsx';
import './index.css';

(window as any).ui = ui;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
