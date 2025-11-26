const API_BASE_URL = (import.meta?.env?.VITE_API_URL) || 'http://localhost:3000/api/gestao'

export const listarPessoas = async (params = {}) => {
  const url = new URL(`${API_BASE_URL}/pessoas`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v)
  })
  const res = await fetch(url)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Falha ao listar pessoas')
  return data
}

export const criarPessoa = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/pessoas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Falha ao criar pessoa')
  return data
}

export const atualizarPessoa = async (id, payload) => {
  const res = await fetch(`${API_BASE_URL}/pessoas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Falha ao atualizar pessoa')
  return data
}

export const excluirPessoa = async (id) => {
  const res = await fetch(`${API_BASE_URL}/pessoas/${id}`, { method: 'DELETE' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Falha ao excluir pessoa')
  return data
}

export const listarClassificacao = async (params = {}) => {
  const url = new URL(`${API_BASE_URL}/classificacao`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v)
  })
  const res = await fetch(url)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Falha ao listar classificação')
  return data
}

export const criarClassificacao = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/classificacao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Falha ao criar classificação')
  return data
}

export const atualizarClassificacao = async (id, payload) => {
  const res = await fetch(`${API_BASE_URL}/classificacao/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Falha ao atualizar classificação')
  return data
}

export const excluirClassificacao = async (id) => {
  const res = await fetch(`${API_BASE_URL}/classificacao/${id}`, { method: 'DELETE' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Falha ao excluir classificação')
  return data
}

export const listarContas = async (params = {}) => {
  const url = new URL(`${API_BASE_URL}/contas`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v)
  })
  const res = await fetch(url)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Falha ao listar contas')
  return data
}

export const atualizarConta = async (id, payload) => {
  const res = await fetch(`${API_BASE_URL}/contas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Falha ao atualizar conta')
  return data
}

export const excluirConta = async (id) => {
  const res = await fetch(`${API_BASE_URL}/contas/${id}`, { method: 'DELETE' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Falha ao excluir conta')
  return data
}
