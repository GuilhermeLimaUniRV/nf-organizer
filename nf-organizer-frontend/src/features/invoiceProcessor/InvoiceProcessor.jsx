import React, { useState } from 'react';
import ExtractorForm from '../../components/ExtractorForm/ExtractorForm.jsx';
import ResponseDisplay from '../../components/ResponseDisplay/ResponseDisplay.jsx';
import { processarNotaFiscal, verificarExistencia, persistirMovimento } from '../../api/extractorApi.js';
import './InvoiceProcessor.css';

const TABS = { JSON: 'JSON', FORMATTED: 'Visualização Formatada' };

const InvoiceProcessor = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [verification, setVerification] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.JSON);

  const formatVerificationMessage = (type) => {
    const entity = result?.[type];
    const data = verification?.[type];
    if (!entity || !data) return null;

    const nome = entity.razao_social || entity.nome_completo || '—';
    const documento = entity.cnpj || entity.cpf || '—';
    const existeMsg = data.existe
      ? `✅ ${type.toUpperCase()}: ${nome} (${documento}) | EXISTE - ID: ${data.id}`
      : `❌ ${type.toUpperCase()}: ${nome} (${documento}) | NÃO EXISTE (Será criado)`;
    return existeMsg;
  };

  const handleExtraction = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Por favor, selecione um arquivo PDF.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setVerification(null);
    setDbStatus(null);

    try {
      const data = await processarNotaFiscal(file);
      if (data.error) throw new Error(data.error);

      setResult(data);

      const verificationData = await verificarExistencia(data);
      if (verificationData.error) throw new Error(verificationData.error);

      setVerification(verificationData);
      setActiveTab(TABS.JSON);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro inesperado ao processar a nota fiscal.');
    } finally {
      setLoading(false);
    }
  };

  const handlePersistence = async () => {
    if (!result || !verification) return;
    setLoading(true);
    setError(null);
    setDbStatus('Lançando movimento no banco de dados...');

    try {
      const status = await persistirMovimento(result, verification);
      if (status.error) throw new Error(status.error);

      setDbStatus('✅ SUCESSO! Movimento e parcelas lançados no DB.');

      setTimeout(() => {
        setFile(null);
        setResult(null);
        setVerification(null);
        setDbStatus(null);
      }, 4000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Falha ao persistir os dados.');
      setDbStatus(`❌ Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
          onSubmit={handleExtraction}
          isLoading={loading}
        />

        {loading && <div className="loader-text">⏳ Processando...</div>}
        {error && <div className="error-message">❌ {error}</div>}
      </section>

      {verification && (
        <div className="verification-status-section">
          <h3>Status da Análise</h3>
          <p className="status-message">{formatVerificationMessage('fornecedor')}</p>
          <p className="status-message">{formatVerificationMessage('faturado')}</p>
          <p className="status-message">
            CLASSIFICAÇÃO:{' '}
            {verification?.classificacao?.existe
              ? `✅ EXISTE - ID: ${verification.classificacao.id}`
              : `❌ NÃO EXISTE (Será criado)`}
          </p>

          <div className="persistence-actions">
            <button
              className="save-button"
              onClick={handlePersistence}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'SALVAR MOVIMENTO NO BANCO'}
            </button>

            {dbStatus && <div className="db-status">{dbStatus}</div>}
          </div>
        </div>
      )}

      {result && (
        <section className="result-section">
          <h3>Dados Extraídos</h3>

          <div className="tabs-container">
            <button
              className={`tab-button ${activeTab === TABS.JSON ? 'active' : ''}`}
              onClick={() => setActiveTab(TABS.JSON)}
            >
              {TABS.JSON}
            </button>
          </div>

          <div className="json-container">
            <ResponseDisplay data={result} viewMode={activeTab} />
          </div>
        </section>
      )}
    </div>
  );
};

export default InvoiceProcessor;
