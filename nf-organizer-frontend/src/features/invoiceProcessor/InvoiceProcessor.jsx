// src/features/InvoiceProcessor/InvoiceProcessor.jsx
import React, { useState } from 'react';
import ExtractorForm from '../../components/ExtractorForm/ExtractorForm.jsx';
import ResponseDisplay from '../../components/ResponseDisplay/ResponseDisplay.jsx'; 
import { processarNotaFiscal } from '../../api/extraxtorApi.js';
import './InvoiceProcessor.css'; 

const TABS = {
    FORMATTED: 'Visualização Formatada',
    JSON: 'JSON'
};

const InvoiceProcessor = () => {
    // 1. Estados da Aplicação
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(TABS.JSON); 

    // 2. Handler de Submissão
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file) {
            setError('Por favor, selecione um arquivo PDF.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        const data = await processarNotaFiscal(file);

        if (data.error) {
            setError(data.error);
            setResult(null);
        } else {
            setResult(data);
            setError(null);
            setActiveTab(TABS.JSON); 
        }
        
        setLoading(false);
    };

    return (
        <div className="invoice-processor-container">
            <header className="app-header">
                <h1>Extração de Dados de Nota Fiscal</h1>
                <p>Carregue um PDF de nota fiscal e extraia os dados automaticamente usando IA</p>
            </header>
            
            <section className="upload-section">
                <h3>Upload do PDF</h3>
                <ExtractorForm 
                    file={file} 
                    onFileChange={setFile} 
                    onSubmit={handleSubmit}
                    isLoading={loading}
                />
                
                {loading && <div className="loader-text">Processando... (Aguarde a resposta da API)</div>}
                {error && <div className="error-message">❌ Erro: {error}</div>}
            </section>
            
            {/* 3. Área de Visualização do Resultado (só aparece se houver resultado) */}
            {result && (
                <section className="result-section">
                    <h3>Dados Extraídos</h3>
                    
                    {/* Abas de Visualização */}
                    <div className="tabs-container">
                        <button 
                            className={`tab-button ${activeTab === TABS.FORMATTED ? 'active' : ''}`}
                            onClick={() => setActiveTab(TABS.FORMATTED)}
                            disabled // Desabilitado conforme a imagem (para implementação futura)
                        >
                            {TABS.FORMATTED}
                        </button>
                        <button 
                            className={`tab-button ${activeTab === TABS.JSON ? 'active' : ''}`}
                            onClick={() => setActiveTab(TABS.JSON)}
                        >
                            {TABS.JSON}
                        </button>
                    </div>
                    
                    {/* Conteúdo da Aba Ativa */}
                    <div className="json-container">
                        <ResponseDisplay 
                            data={result} 
                            viewMode={activeTab}
                        />
                    </div>
                </section>
            )}
        </div>
    );
};

export default InvoiceProcessor;