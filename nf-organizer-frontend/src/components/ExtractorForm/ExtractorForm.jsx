import React, { useRef } from 'react';
import './ExtractorForm.css'; 

const ExtractorForm = ({ file, onFileChange, onSubmit, isLoading }) => {
    
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        onFileChange(selectedFile || null);
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    return (
        <form onSubmit={onSubmit} className="upload-form">
            
            <div className="file-input-group">
                <input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={handleFileChange} 
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    required 
                />

                <div className="custom-select-file" onClick={handleButtonClick}>
                    Selecione o arquivo PDF da nota fiscal
                </div>
            </div>
            
            {file && (
                <div className="file-info-bar">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{ (file.size / 1024 / 1024).toFixed(2) } MB</span>
                </div>
            )}

            <button 
                type="submit" 
                className="extract-button"
                disabled={isLoading || !file} 
            >
                {isLoading ? 'PROCESSANDO...' : 'EXTRAIR DADOS'}
            </button>
        </form>
    );
};

export default ExtractorForm;