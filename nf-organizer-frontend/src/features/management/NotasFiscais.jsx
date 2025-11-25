import React, { useState } from 'react'
import { listarContas, atualizarConta, excluirConta } from '../../api/managementApi.js'

const NotasFiscais = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState({ field: null, dir: 'asc' })
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ numeronotafiscal: '', dataemissao: '', descricao: '', valortotal: '' })

  const buscar = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listarContas({ q })
      setItems(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const todos = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listarContas({})
      setItems(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (it) => {
    setEditId(it.idMovimentoContas)
    setForm({ numeronotafiscal: it.numeronotafiscal || '', dataemissao: it.dataemissao?.slice(0,10) || '', descricao: it.descricao || '', valortotal: it.valortotal || '' })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!editId) return
    setLoading(true)
    setError(null)
    try {
      await atualizarConta(editId, { ...form })
      setEditId(null)
      setForm({ numeronotafiscal: '', dataemissao: '', descricao: '', valortotal: '' })
      await buscar()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    setLoading(true)
    setError(null)
    try {
      await excluirConta(id)
      await buscar()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const applySort = (field) => {
    const dir = sort.field === field && sort.dir === 'asc' ? 'desc' : 'asc'
    setSort({ field, dir })
    const sorted = [...items].sort((a, b) => {
      const va = a[field] || ''
      const vb = b[field] || ''
      if (va < vb) return dir === 'asc' ? -1 : 1
      if (va > vb) return dir === 'asc' ? 1 : -1
      return 0
    })
    setItems(sorted)
  }

  return (
    <div>
      <h2>Notas Fiscais</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, marginBottom: 12 }}>
        <input placeholder="Buscar por número, descrição ou valor" value={q} onChange={(e) => setQ(e.target.value)} />
        <button onClick={buscar} disabled={loading}>Buscar</button>
        <button onClick={todos} disabled={loading}>Todos</button>
      </div>

      {editId && (
        <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr auto', gap: 8, marginBottom: 12 }}>
          <input placeholder="Nota Fiscal" value={form.numeronotafiscal} onChange={(e) => setForm({ ...form, numeronotafiscal: e.target.value })} />
          <input type="date" placeholder="Emissão" value={form.dataemissao} onChange={(e) => setForm({ ...form, dataemissao: e.target.value })} />
          <input placeholder="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          <input placeholder="Valor Total" value={form.valortotal} onChange={(e) => setForm({ ...form, valortotal: e.target.value })} />
          <button type="submit" disabled={loading}>Salvar</button>
        </form>
      )}

      {error && <div style={{ color: '#cf1322', marginBottom: 8 }}>{error}</div>}
      <div style={{ border: '1px solid var(--border)', borderRadius: 6 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th onClick={() => applySort('idMovimentoContas')}>ID</th>
              <th onClick={() => applySort('numeronotafiscal')}>Nota Fiscal</th>
              <th onClick={() => applySort('dataemissao')}>Emissão</th>
              <th onClick={() => applySort('descricao')}>Descrição</th>
              <th onClick={() => applySort('valortotal')}>Valor</th>
              <th onClick={() => applySort('status')}>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 12 }}>Nenhuma nota encontrada.</td></tr>
            ) : items.map(it => (
              <tr key={it.idMovimentoContas}>
                <td>{it.idMovimentoContas}</td>
                <td>{it.numeronotafiscal}</td>
                <td>{new Date(it.dataemissao).toLocaleDateString('pt-BR')}</td>
                <td>{it.descricao}</td>
                <td>{it.valortotal}</td>
                <td>{it.status}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(it)} disabled={loading}>Editar</button>
                  <button onClick={() => remove(it.idMovimentoContas)} disabled={loading}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default NotasFiscais

