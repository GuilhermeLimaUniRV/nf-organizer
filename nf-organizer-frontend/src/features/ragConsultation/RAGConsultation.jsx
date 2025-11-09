import React, { useState, useMemo } from 'react';
import { consultarRAG } from '../../api/ragApi.js';
import './RAGConsultation.css';

const RAGConsultation = () => {
  const [type, setType] = useState('SIMPLES');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const prettyFacts = useMemo(() => {
    if (!result || !Array.isArray(result.fatos)) return '';
    try {
      return JSON.stringify(result.fatos, null, 2);
    } catch {
      return '';
    }
  }, [result]);

  const copyFacts = async () => {
    if (!prettyFacts) return;
    try {
      await navigator.clipboard.writeText(prettyFacts);
    } catch (e) {
      console.error('Falha ao copiar fatos:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await consultarRAG({ type, query });
      if (data.error) {
        const msg = data.stage ? `${data.error} (etapa: ${data.stage})` : data.error;
        setError(msg);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message || 'Falha na consulta RAG.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rag-consultation-container">
      <header className="section-header">
        <h2>Consulta RAG (Banco + IA)</h2>
        <p>Faça perguntas sobre os seus dados financeiros em linguagem natural.</p>
      </header>

      <form className="rag-form" onSubmit={handleSubmit}>
        <div className="mode-selector">
          <label>
            <input
              type="radio"
              name="rag-type"
              value="SIMPLES"
              checked={type === 'SIMPLES'}
              onChange={(e) => setType(e.target.value)}
            />
            RAG Simples (SQL direto)
          </label>
          <label>
            <input
              type="radio"
              name="rag-type"
              value="SEMANTICA"
              checked={type === 'SEMANTICA'}
              onChange={(e) => setType(e.target.value)}
            />
            RAG Semântico (Embeddings)
          </label>
        </div>

        <textarea
          className="query-input"
          placeholder="Ex: Qual o total de despesas a pagar? Ou: gastos com TI"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
        />

        <button className="submit-button" type="submit" disabled={loading || !query.trim()}>
          {loading ? 'Consultando...' : 'Consultar'}
        </button>
      </form>

      {error && <div className="error-message">❌ {error}</div>}

      {result && (
        <section className="result-section">
          <h3>Resposta do LLM</h3>
          <div className="llm-response">{result.resposta}</div>

          {Array.isArray(result.fatos) && result.fatos.length > 0 && (
            <div className="facts-container">
              <div className="facts-header">
                <h4>Fatos utilizados</h4>
                <button type="button" className="copy-button" onClick={copyFacts}>
                  Copiar JSON
                </button>
              </div>
              <pre className="json-pre">{prettyFacts}</pre>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default RAGConsultation;