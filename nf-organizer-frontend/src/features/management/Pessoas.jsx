import React, { useState } from 'react'
import { listarPessoas, criarPessoa, atualizarPessoa, excluirPessoa } from '../../api/managementApi.js'

const Pessoas = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ tipo: 'FORNECEDOR', razaosocial: '', fantasia: '', documento: '' })
  const [editId, setEditId] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [filters, setFilters] = useState({ tipo: '', status: '', q: '' })
  const [sort, setSort] = useState({ field: null, dir: 'asc' })

  const loadTodos = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listarPessoas({ status: 'ATIVO' })
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
      const data = await listarPessoas(filters)
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
      await criarPessoa({ tipo: form.tipo, razaosocial: form.razaosocial, fantasia: form.fantasia, documento: form.documento })
      setForm({ tipo: 'FORNECEDOR', razaosocial: '', fantasia: '', documento: '' })
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
      await atualizarPessoa(editId, { tipo: form.tipo, razaosocial: form.razaosocial, fantasia: form.fantasia, documento: form.documento })
      setForm({ tipo: 'FORNECEDOR', razaosocial: '', fantasia: '', documento: '' })
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
    setEditId(item.idPessoas)
    setForm({ tipo: item.tipo, razaosocial: item.razaosocial, fantasia: item.fantasia || '', documento: item.documento })
    setIsEditOpen(true)
  }

  const remove = async (id) => {
    setLoading(true)
    setError(null)
    try {
      await excluirPessoa(id)
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
      <h2>Manter Pessoas</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={() => { setForm({ tipo: 'FORNECEDOR', razaosocial: '', fantasia: '', documento: '' }); setIsCreateOpen(true) }} disabled={loading}>Novo</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
        <select value={filters.tipo} onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}>
          <option value="">Tipo</option>
          <option value="FORNECEDOR">Fornecedor</option>
          <option value="CLIENTE">Cliente</option>
          <option value="FATURADO">Faturado</option>
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
              <th onClick={() => applySort('idPessoas')}>ID</th>
              <th onClick={() => applySort('tipo')}>Tipo</th>
              <th onClick={() => applySort('razaosocial')}>Razão Social</th>
              <th onClick={() => applySort('fantasia')}>Fantasia</th>
              <th onClick={() => applySort('documento')}>Documento</th>
              <th onClick={() => applySort('status')}>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 12 }}>Nenhum registro</td></tr>
            ) : items.map(it => (
              <tr key={it.idPessoas}>
                <td>{it.idPessoas}</td>
                <td>{it.tipo}</td>
                <td>{it.razaosocial}</td>
                <td>{it.fantasia || ''}</td>
                <td>{it.documento}</td>
                <td>{it.status}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(it)} disabled={loading}>Editar</button>
                  <button onClick={() => remove(it.idPessoas)} disabled={loading}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Novo Cadastro</h3>
            <form onSubmit={submitCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="FORNECEDOR">Fornecedor</option>
                <option value="CLIENTE">Cliente</option>
                <option value="FATURADO">Faturado</option>
              </select>
              <input placeholder="Razão Social/Nome" value={form.razaosocial} onChange={(e) => setForm({ ...form, razaosocial: e.target.value })} />
              <input placeholder="Fantasia" value={form.fantasia} onChange={(e) => setForm({ ...form, fantasia: e.target.value })} />
              <input placeholder="Documento" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
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
            <h3>Editar Pessoa</h3>
            <form onSubmit={submitEdit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="FORNECEDOR">Fornecedor</option>
                <option value="CLIENTE">Cliente</option>
                <option value="FATURADO">Faturado</option>
              </select>
              <input placeholder="Razão Social/Nome" value={form.razaosocial} onChange={(e) => setForm({ ...form, razaosocial: e.target.value })} />
              <input placeholder="Fantasia" value={form.fantasia} onChange={(e) => setForm({ ...form, fantasia: e.target.value })} />
              <input placeholder="Documento" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
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

export default Pessoas
