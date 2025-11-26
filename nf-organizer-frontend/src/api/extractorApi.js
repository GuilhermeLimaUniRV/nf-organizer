// src/api/extractorApi.js

const GESTAO_BASE = (import.meta?.env?.VITE_API_URL) || 'http://localhost:3000/api/gestao';
const API_ROOT = (() => { try { const u = new URL(GESTAO_BASE); return `${u.origin}/api`; } catch { return GESTAO_BASE.replace(/\/gestao$/, '').replace(/\/$/, ''); } })();
const API_BASE_URL = `${API_ROOT}/notaFiscal`;

const EXTRACTION_API_URL = `${API_BASE_URL}/processar-nf`; 
const VERIFICATION_API_URL = `${API_BASE_URL}/verificar-existencia`; 
const PERSISTENCE_API_URL = `${API_BASE_URL}/persistir-movimento`; 

export const processarNotaFiscal = async (file) => {
    const formData = new FormData();
    formData.append('pdf_file', file); 

    try {
        const response = await fetch(EXTRACTION_API_URL, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Erro HTTP: ${response.status} - Falha na extração da IA`);
        }
        return data;
    } catch (error) {
        return { error: error.message || 'Falha na comunicação com o servidor.' };
    }
};

export const verificarExistencia = async (jsonData) => {
    try {
        const response = await fetch(VERIFICATION_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dados: jsonData }),
        });

        const data = await response.json();

        if (!response.ok) {
             throw new Error(data.error || `Erro HTTP: ${response.status} - Falha na verificação.`);
        }
        return data;
    } catch (error) {
        return { error: error.message || 'Falha ao consultar o banco de dados.' };
    }
};

export const persistirMovimento = async (dadosIA, verificacaoDB) => {
    try {
        const response = await fetch(PERSISTENCE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dadosIA, verificacaoDB }), 
        });

        const data = await response.json();

        if (!response.ok) {
             throw new Error(data.error || `Erro HTTP: ${response.status} - Falha na persistência.`);
        }
        return data;
    } catch (error) {
        console.error('Erro na persistência do DB:', error);
        return { error: error.message || 'Falha ao salvar no banco de dados.' };
    }
};
