import React, { useState } from 'react'
import { listarClassificacao, criarClassificacao, atualizarClassificacao, excluirClassificacao } from '../../api/managementApi.js'

const Classificacao = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ tipo: 'DESPESA', descricao: '' })
  const [editId, setEditId] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [filters, setFilters] = useState({ tipo: '', status: '', q: '' })
  const [sort, setSort] = useState({ field: null, dir: 'asc' })

  const loadTodos = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listarClassificacao({ status: 'ATIVO' })
      setItems(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const buscar = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listarClassificacao(filters)
      setItems(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const submitCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await criarClassificacao({ tipo: form.tipo, descricao: form.descricao })
      setForm({ tipo: 'DESPESA', descricao: '' })
      setIsCreateOpen(false)
      await buscar()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const submitEdit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await atualizarClassificacao(editId, { tipo: form.tipo, descricao: form.descricao })
      setForm({ tipo: 'DESPESA', descricao: '' })
      setEditId(null)
      setIsEditOpen(false)
      await buscar()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (item) => {
    setEditId(item.idClassificacao)
    setForm({ tipo: item.tipo, descricao: item.descricao })
    setIsEditOpen(true)
  }

  const remove = async (id) => {
    setLoading(true)
    setError(null)
    try {
      await excluirClassificacao(id)
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
      <h2>Manter Classificação</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={() => { setForm({ tipo: 'DESPESA', descricao: '' }); setIsCreateOpen(true) }} disabled={loading}>Novo</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
        <select value={filters.tipo} onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}>
          <option value="">Tipo</option>
          <option value="RECEITA">Receita</option>
          <option value="DESPESA">Despesa</option>
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">Status</option>
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
        </select>
        <input placeholder="Busca" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={buscar} disabled={loading}>Buscar</button>
        <button onClick={loadTodos} disabled={loading}>Todos</button>
      </div>

      {error && <div style={{ color: '#cf1322', marginBottom: 8 }}>{error}</div>}
      <div style={{ border: '1px solid var(--border)', borderRadius: 6 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th onClick={() => applySort('idClassificacao')}>ID</th>
              <th onClick={() => applySort('tipo')}>Tipo</th>
              <th onClick={() => applySort('descricao')}>Descrição</th>
              <th onClick={() => applySort('status')}>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 12 }}>Nenhum registro</td></tr>
            ) : items.map(it => (
              <tr key={it.idClassificacao}>
                <td>{it.idClassificacao}</td>
                <td>{it.tipo}</td>
                <td>{it.descricao}</td>
                <td>{it.status}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(it)} disabled={loading}>Editar</button>
                  <button onClick={() => remove(it.idClassificacao)} disabled={loading}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Nova Classificação</h3>
            <form onSubmit={submitCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="RECEITA">Receita</option>
                <option value="DESPESA">Despesa</option>
              </select>
              <input placeholder="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              <div className="modal-actions" style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)}>Cancelar</button>
                <button type="submit" disabled={loading}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditOpen && (
        <div className="modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Editar Classificação</h3>
            <form onSubmit={submitEdit} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="RECEITA">Receita</option>
                <option value="DESPESA">Despesa</option>
              </select>
              <input placeholder="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              <div className="modal-actions" style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsEditOpen(false)}>Cancelar</button>
                <button type="submit" disabled={loading}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Classificacao
