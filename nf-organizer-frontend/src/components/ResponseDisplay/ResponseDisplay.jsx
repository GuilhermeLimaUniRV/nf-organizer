// src/components/ResponseDisplay/ResponseDisplay.jsx
import React from 'react';
import './ResponseDisplay.css';

const ResponseDisplay = ({ data, viewMode }) => {
    
    // Apenas a visualização JSON está implementada para ser igual à imagem
    const formattedJson = JSON.stringify(data, null, 2);

    return (
        <div className="response-display">
            {viewMode === 'JSON' ? (
                <>
                    <div className="json-header">
                        <p>Dados em JSON</p>
                        <button 
                            className="copy-button"
                            onClick={() => navigator.clipboard.writeText(formattedJson)}
                        >
                            Copiar JSON
                        </button>
                    </div>
                    <pre className="json-code-block">
                        {formattedJson}
                    </pre>
                    <p className="json-footer">
                        Este JSON contém todos os dados extraídos da nota fiscal e pode ser usado para integração com outros sistemas.
                    </p>
                </>
            ) : (
                <div className="placeholder-formatted">
                    {/* Conteúdo da Aba Formatada (Visualização de Cards/Tabela) */}
                    Visualização Formatada em Desenvolvimento...
                </div>
            )}
        </div>
    );
};

export default ResponseDisplay;