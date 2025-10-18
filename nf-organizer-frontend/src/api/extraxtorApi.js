// src/api/extractorApi.js

// URL da sua API Node.js (conforme mapeado no Docker Compose/Run)
const API_URL = 'http://localhost:3000/processar-nf';

export const processarNotaFiscal = async (file) => {
    const formData = new FormData();
    
    // O nome do campo deve ser EXATAMENTE 'pdf_file' 
    // (como definido no Multer no seu backend Node.js)
    formData.append('pdf_file', file); 

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData,
            // Não defina Content-Type; o navegador faz isso automaticamente
        });

        const data = await response.json();

        if (!response.ok) {
            // Lançar erro para ser capturado pelo componente
            throw new Error(data.error || `Erro HTTP: ${response.status} - Falha ao processar`);
        }

        return data; // O JSON estruturado do Gemini

    } catch (error) {
        console.error('Erro na requisição da API:', error);
        return { error: error.message || 'Falha na comunicação com o servidor.' };
    }
};