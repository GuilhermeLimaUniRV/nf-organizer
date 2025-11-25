import React from 'react'

const Home = ({ onNavigate }) => {
  return (
    <div>
      <h2>NF Organizer</h2>
      <p>Escolha uma área para acessar:</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <button onClick={() => onNavigate('NOTAS')}>Notas/Contas</button>
        <button onClick={() => onNavigate('GESTAO_PESSOAS')}>Pessoas</button>
        <button onClick={() => onNavigate('GESTAO_CLASSIF')}>Classificação</button>
        <button onClick={() => onNavigate('EXTRACAO')}>Extração</button>
        <button onClick={() => onNavigate('CONSULTAS')}>Consultas</button>
      </div>
    </div>
  )
}

export default Home
