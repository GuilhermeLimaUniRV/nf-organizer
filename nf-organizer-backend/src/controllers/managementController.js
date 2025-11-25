import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const listPessoas = async (req, res) => {
  try {
    const { tipo, status, q } = req.query
    const where = {}
    if (tipo) where.tipo = tipo
    if (status) where.status = status
    if (q) {
      where.OR = [
        { razaosocial: { contains: q, mode: 'insensitive' } },
        { fantasia: { contains: q, mode: 'insensitive' } },
        { documento: { contains: q, mode: 'insensitive' } },
      ]
    }
    const data = await prisma.pessoas.findMany({ where, orderBy: { idPessoas: 'desc' } })
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'Falha ao listar pessoas' })
  }
}

export const createPessoa = async (req, res) => {
  try {
    const { tipo, razaosocial, fantasia, documento } = req.body
    if (!tipo || !razaosocial || !documento) return res.status(400).json({ error: 'Campos obrigatórios ausentes' })
    const data = await prisma.pessoas.create({ data: { tipo, razaosocial, fantasia, documento, status: 'ATIVO' } })
    res.status(201).json(data)
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Documento já cadastrado' })
    res.status(500).json({ error: 'Falha ao criar pessoa' })
  }
}

export const updatePessoa = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { tipo, razaosocial, fantasia, documento } = req.body
    const data = await prisma.pessoas.update({ where: { idPessoas: id }, data: { tipo, razaosocial, fantasia, documento } })
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'Falha ao atualizar pessoa' })
  }
}

export const deletePessoa = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const data = await prisma.pessoas.update({ where: { idPessoas: id }, data: { status: 'INATIVO' } })
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'Falha ao excluir pessoa' })
  }
}

export const listClassificacao = async (req, res) => {
  try {
    const { tipo, status, q } = req.query
    const where = {}
    if (tipo) where.tipo = tipo
    if (status) where.status = status
    if (q) where.descricao = { contains: q, mode: 'insensitive' }
    const data = await prisma.classificacao.findMany({ where, orderBy: { idClassificacao: 'desc' } })
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'Falha ao listar classificação' })
  }
}

export const createClassificacao = async (req, res) => {
  try {
    const { tipo, descricao } = req.body
    if (!tipo || !descricao) return res.status(400).json({ error: 'Campos obrigatórios ausentes' })
    const data = await prisma.classificacao.create({ data: { tipo, descricao, status: 'ATIVO' } })
    res.status(201).json(data)
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Descrição já cadastrada' })
    res.status(500).json({ error: 'Falha ao criar classificação' })
  }
}

export const updateClassificacao = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { tipo, descricao } = req.body
    const data = await prisma.classificacao.update({ where: { idClassificacao: id }, data: { tipo, descricao } })
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'Falha ao atualizar classificação' })
  }
}

export const deleteClassificacao = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const data = await prisma.classificacao.update({ where: { idClassificacao: id }, data: { status: 'INATIVO' } })
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'Falha ao excluir classificação' })
  }
}

export const listContas = async (req, res) => {
  try {
    const { status, q } = req.query
    const where = {}
    if (status) where.status = status
    if (q) {
      where.OR = [
        { numeronotafiscal: { contains: q, mode: 'insensitive' } },
        { descricao: { contains: q, mode: 'insensitive' } },
      ]
    }
    const data = await prisma.movimentoContas.findMany({
      where,
      include: { FornecedorCliente: true, Faturado: true },
      orderBy: { idMovimentoContas: 'desc' }
    })
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'Falha ao listar contas' })
  }
}

export const updateConta = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { tipo, numeronotafiscal, dataemissao, descricao, valortotal, Pessoas_idFornecedorCliente, Pessoas_idFaturado } = req.body
    const data = await prisma.movimentoContas.update({
      where: { idMovimentoContas: id },
      data: {
        tipo,
        numeronotafiscal,
        dataemissao: dataemissao ? new Date(dataemissao) : undefined,
        descricao,
        valortotal,
        Pessoas_idFornecedorCliente,
        Pessoas_idFaturado,
      },
    })
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'Falha ao atualizar conta' })
  }
}

export const deleteConta = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const data = await prisma.movimentoContas.update({ where: { idMovimentoContas: id }, data: { status: 'INATIVO' } })
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'Falha ao excluir conta' })
  }
}

