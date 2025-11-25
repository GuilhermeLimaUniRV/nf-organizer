// src/App.jsx
import React, { useEffect, useState } from 'react';
import InvoiceProcessor from './features/invoiceProcessor/InvoiceProcessor';
import RAGConsultation from './features/ragConsultation/RAGConsultation.jsx';
import Pessoas from './features/management/Pessoas.jsx';
import Classificacao from './features/management/Classificacao.jsx';
import NotasFiscais from './features/management/NotasFiscais.jsx';
import Home from './features/home/Home.jsx';
import './App.css';

const TABS = { HOME: 'INÍCIO', NOTAS: 'NOTAS/CONTAS', EXTRACAO: 'EXTRAÇÃO', CONSULTAS: 'CONSULTAS', GESTAO_PESSOAS: 'PESSOAS', GESTAO_CLASSIF: 'CLASSIFICAÇÃO' };

function App() {
  const [activeTab, setActiveTab] = useState(TABS.HOME);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('nf-theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('nf-theme', theme); } catch (e) { void e }
  }, [theme]);

  return (
    <div className="App">
      <div className="topbar">
        <div className="topbar-left">
          <button className="menu-button" onClick={() => setSidebarOpen(!sidebarOpen)}>Menu</button>
          <div style={{ fontWeight: 600 }}>NF Organizer</div>
        </div>
        <button className="nav-button theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Tema: {theme === 'light' ? 'Claro' : 'Escuro'}</button>
      </div>
      <div className={`app-layout ${sidebarOpen ? '' : 'no-sidebar'}`}>
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div style={{ display: 'grid', gap: 6 }}>
            <button className={`nav-button ${activeTab === TABS.HOME ? 'active' : ''}`} onClick={() => { setActiveTab(TABS.HOME); setSidebarOpen(false); }}>Início</button>
            <button className={`nav-button ${activeTab === TABS.NOTAS ? 'active' : ''}`} onClick={() => { setActiveTab(TABS.NOTAS); setSidebarOpen(false); }}>Notas Fiscais</button>
            <button className={`nav-button ${activeTab === TABS.GESTAO_PESSOAS ? 'active' : ''}`} onClick={() => { setActiveTab(TABS.GESTAO_PESSOAS); setSidebarOpen(false); }}>Pessoas</button>
            <button className={`nav-button ${activeTab === TABS.GESTAO_CLASSIF ? 'active' : ''}`} onClick={() => { setActiveTab(TABS.GESTAO_CLASSIF); setSidebarOpen(false); }}>Classificação</button>
            
            <button className={`nav-button ${activeTab === TABS.EXTRACAO ? 'active' : ''}`} onClick={() => { setActiveTab(TABS.EXTRACAO); setSidebarOpen(false); }}>Extração</button>
            <button className={`nav-button ${activeTab === TABS.CONSULTAS ? 'active' : ''}`} onClick={() => { setActiveTab(TABS.CONSULTAS); setSidebarOpen(false); }}>Consultas</button>
          </div>
        </aside>
        <main className="main-card">
          {activeTab === TABS.HOME && <Home onNavigate={(key) => setActiveTab(TABS[key])} />}
          {activeTab === TABS.NOTAS && <NotasFiscais />}
          {activeTab === TABS.EXTRACAO && <InvoiceProcessor />}
          {activeTab === TABS.CONSULTAS && <RAGConsultation />}
          {activeTab === TABS.GESTAO_PESSOAS && <Pessoas />}
          {activeTab === TABS.GESTAO_CLASSIF && <Classificacao />}
          
        </main>
      </div>

    </div>
  );
}

export default App;
