// src/api/ragApi.js

const API_BASE_URL = 'http://localhost:3000/api/notaFiscal';
const RAG_API_URL = `${API_BASE_URL}/consultaRAG`;

export const consultarRAG = async ({ type, query }) => {
  try {
    const response = await fetch(RAG_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, query }),
    });
    const data = await response.json();
    // Retorna o corpo diretamente para preservar campos como 'stage' em erros
    if (!response.ok) {
      return { error: data.error || `Erro HTTP: ${response.status} - Falha na consulta RAG.`, stage: data.stage };
    }
    return data;
  } catch (error) {
    return { error: error.message || 'Falha na consulta RAG.' };
  }
};