import express from 'express'
import {
  listPessoas,
  createPessoa,
  updatePessoa,
  deletePessoa,
  listClassificacao,
  createClassificacao,
  updateClassificacao,
  deleteClassificacao,
  listContas,
  updateConta,
  deleteConta,
} from '../controllers/managementController.js'

const router = express.Router()

router.get('/pessoas', listPessoas)
router.post('/pessoas', createPessoa)
router.put('/pessoas/:id', updatePessoa)
router.delete('/pessoas/:id', deletePessoa)

router.get('/classificacao', listClassificacao)
router.post('/classificacao', createClassificacao)
router.put('/classificacao/:id', updateClassificacao)
router.delete('/classificacao/:id', deleteClassificacao)

router.get('/contas', listContas)
router.put('/contas/:id', updateConta)
router.delete('/contas/:id', deleteConta)

export default router

