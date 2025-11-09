// src/App.jsx
import React, { useEffect, useState } from 'react';
import InvoiceProcessor from './features/invoiceProcessor/InvoiceProcessor';
import RAGConsultation from './features/ragConsultation/RAGConsultation.jsx';
import './App.css';

const TABS = { EXTRACAO: 'EXTRAÇÃO', CONSULTAS: 'CONSULTAS' };

function App() {
  const [activeTab, setActiveTab] = useState(TABS.EXTRACAO);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('nf-theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('nf-theme', theme); } catch {}
  }, [theme]);

  return (
    <div className="App">
      <nav className="app-nav">
        <button
          className={`nav-button ${activeTab === TABS.EXTRACAO ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.EXTRACAO)}
        >
          Extração
        </button>
        <button
          className={`nav-button ${activeTab === TABS.CONSULTAS ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.CONSULTAS)}
        >
          Consultas
        </button>
        <button
          className="nav-button theme-toggle"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          Tema: {theme === 'light' ? 'Claro' : 'Escuro'}
        </button>
      </nav>

      <main>
        {activeTab === TABS.EXTRACAO ? <InvoiceProcessor /> : <RAGConsultation />}
      </main>
    </div>
  );
}

export default App;