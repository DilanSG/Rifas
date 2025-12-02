import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { EjemploResultadosPage } from './pages/EjemploResultadosPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/:secretKey" element={<AdminPage />} />
        <Route path="/ejemplo-resultados" element={<EjemploResultadosPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
