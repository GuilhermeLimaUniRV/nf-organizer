// src/features/InvoiceProcessor/InvoiceProcessor.jsx
import React, { useState } from 'react';
import ExtractorForm from '../../components/ExtractorForm/ExtractorForm.jsx';
import ResponseDisplay from '../../components/ResponseDisplay/ResponseDisplay.jsx'; 
import { processarNotaFiscal, verificarExistencia, persistirMovimento } from '../../api/extraxtorApi.js'; 
import './InvoiceProcessor.css'; 

const TABS = {
    FORMATTED: 'Visualização Formatada',
    JSON: 'JSON'
};

const InvoiceProcessor = () => {
    // 1. Estados da Aplicação
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);               // JSON bruto da IA (Rota 1)
    const [verificationResult, setVerificationResult] = useState(null); // Resultado EXISTE/NÃO EXISTE (Rota 2)
    const [dbStatus, setDbStatus] = useState(null);           // Status da Persistência (Rota 3)
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(TABS.JSON); 


    // Função auxiliar para exibir a mensagem de verificação (Requisito N2)
    const formatVerificationMessage = (pessoaType) => {
        if (!verificationResult || !result) return null;

        const data = verificationResult[pessoaType]; // fornecedor ou faturado
        
        const nome = pessoaType === 'fornecedor' ? result.fornecedor.razao_social : result.faturado.nome_completo;
        const documento = pessoaType === 'fornecedor' ? result.fornecedor.cnpj : result.faturado.cpf;

        if (data.existe) {
            return `✅ ${pessoaType.toUpperCase()}: ${nome} (${documento}) | EXISTE - ID: ${data.id}`;
        } else {
            return `❌ ${pessoaType.toUpperCase()}: ${nome} (${documento}) | NÃO EXISTE (Será criado)`;
        }
    };

    // -----------------------------------------------------------------
    // HANDLER AUXILIAR: VERIFICAÇÃO DO DB (ROTA 2)
    // -----------------------------------------------------------------
    const handleVerification = async (dadosIA) => {
        setLoading(true);
        setError(null);
        
        // Chama a Rota 2: /verificar-existencia
        const verification = await verificarExistencia(dadosIA);

        if (verification.error) {
            setError(verification.error);
            setLoading(false);
            return false;
        } else {
            setVerificationResult(verification); // Salva o resultado EXISTE/NÃO EXISTE
            setLoading(false);
            return true;
        }
    }


    // -----------------------------------------------------------------
    // HANDLER 1: EXTRAÇÃO (Chama a IA e, se sucesso, a Verificação)
    // -----------------------------------------------------------------
    const handleExtraction = async (e) => {
        e.preventDefault();
        
        if (!file) {
            setError('Por favor, selecione um arquivo PDF.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null); 
        setVerificationResult(null); 
        setDbStatus(null);

        // Rota 1: /processar-nf (IA)
        const data = await processarNotaFiscal(file);

        if (data.error) {
            setError(data.error);
            setLoading(false);
        } else {
            setResult(data); 
            // Se a IA retornar sucesso, AUTOMATICAMENTE chama a Verificação (Rota 2)
            await handleVerification(data); 
            setActiveTab(TABS.JSON); 
        }
        setLoading(false);
    };

    // -----------------------------------------------------------------
    // HANDLER 2: PERSISTÊNCIA (Chama a Rota 3)
    // -----------------------------------------------------------------
    const handlePersistence = async () => {
        if (!result || !verificationResult) return; 

        setLoading(true);
        setError(null);
        setDbStatus('Lançando movimento no banco de dados...');

        // Rota 3: /persistir-movimento, enviando DADOS da IA e o STATUS DE VERIFICAÇÃO
        const status = await persistirMovimento(result, verificationResult);

        if (status.error) {
            setError(status.error);
            setDbStatus(`FALHA no Lançamento: ${status.error}`);
        } else {
            setDbStatus('✅ SUCESSO! Movimento e parcelas lançados no DB.');
            // Opcional: Aqui você pode limpar os resultados após o sucesso, se necessário
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
                    onSubmit={handleExtraction} // Botão "EXTRAIR DADOS"
                    isLoading={loading}
                />
                
                {loading && <div className="loader-text">Processando...</div>}
                {error && <div className="error-message">❌ Erro: {error}</div>}
            </section>
            
            {/* EXIBIÇÃO DO STATUS DE VERIFICAÇÃO (Requisito N2) */}
            {verificationResult && (
                <div className="verification-status-section">
                    <h3>Status da Análise</h3>
                    <p className="status-message">{formatVerificationMessage('fornecedor')}</p>
                    <p className="status-message">{formatVerificationMessage('faturado')}</p>
                    <p className="status-message">CLASSIFICAÇÃO: {verificationResult.classificacao.existe ? 
                        `✅ EXISTE - ID: ${verificationResult.classificacao.id}` : 
                        `❌ NÃO EXISTE (Será criado)`
                    }</p>
                    
                    {/* Botão de Persistência - SÓ APARECE APÓS A VERIFICAÇÃO SER CONCLUÍDA */}
                    <div className="persistence-actions">
                        <button 
                            className="save-button" 
                            onClick={handlePersistence} // Botão "SALVAR MOVIMENTO"
                            disabled={loading}
                        >
                            SALVAR MOVIMENTO NO BANCO
                        </button>
                        
                        {dbStatus && <div className="db-status">{dbStatus}</div>}
                    </div>
                </div>
            )}
            
            {/* Área de Visualização do Resultado */}
            {result && (
                <section className="result-section">
                    <h3>Dados Extraídos</h3>
                    
                    {/* Abas de Visualização (Como na imagem do Figma/requisito) */}
                    <div className="tabs-container">
                        <button 
                            className={`tab-button ${activeTab === TABS.JSON ? 'active' : ''}`}
                            onClick={() => setActiveTab(TABS.JSON)}
                        >
                            {TABS.JSON}
                        </button>
                    </div>
                    
                    {/* Conteúdo JSON */}
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