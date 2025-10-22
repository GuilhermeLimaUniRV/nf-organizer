import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class PersistenciaAgente {
    
    async verificarPessoa(documento, tipoPessoa) {
        const pessoa = await prisma.pessoas.findUnique({
            where: {
                documento: documento
            },
            select: {
                idPessoas: true,
                razaosocial: true,
                status: true
            }
        });

        if (pessoa) {
            return {
                existe: true,
                id: pessoa.idPessoas,
                nome: pessoa.razaosocial,
                status: pessoa.status
            };
        } else {
            return {
                existe: false,
                documento: documento,
                tipo: tipoPessoa
            };
        }
    }
    async verificarClassificacao(descricao) {
        const classificacao = await prisma.classificacao.findUnique({
            where: {
                descricao: descricao
            },
            select: {
                idClassificacao: true,
                status: true
            }
        });

        if (classificacao) {
            return {
                existe: true,
                id: classificacao.idClassificacao,
                status: classificacao.status
            };
        } else {
            return {
                existe: false,
                descricao: descricao
            };
        }
    }

    async persistirMovimentoCompleto(dadosIA, resultadosVerificacao) {

        let fornecedorId;
        if (resultadosVerificacao.fornecedor.existe) {
            fornecedorId = resultadosVerificacao.fornecedor.id;
        } else {
            const novoFornecedor = await prisma.pessoas.create({
                data: {
                    tipo: 'FORNECEDOR',
                    razaosocial: dadosIA.fornecedor.razao_social,
                    fantasia: dadosIA.fornecedor.nome_fantasia,
                    documento: dadosIA.fornecedor.cnpj,
                    status: 'ATIVO'
                }
            });
            fornecedorId = novoFornecedor.idPessoas;
        }

        let faturadoId;
        if (resultadosVerificacao.faturado.existe) {
            faturadoId = resultadosVerificacao.faturado.id;
        } else {
            const novoFaturado = await prisma.pessoas.create({
                data: {
                    tipo: 'FATURADO',
                    razaosocial: dadosIA.faturado.nome_completo,
                    documento: dadosIA.faturado.cpf, 
                    status: 'ATIVO'
                }
            });
            faturadoId = novoFaturado.idPessoas;
        }

        const descricaoClassificacao = dadosIA.classificacao_despesa[0] || 'OUTROS';
        let classificacaoId;
        
        const classificacao = await prisma.classificacao.upsert({
            where: { descricao: descricaoClassificacao },
            update: {}, 
            create: {
                tipo: 'DESPESA',
                descricao: descricaoClassificacao,
                status: 'ATIVO'
            }
        });
        classificacaoId = classificacao.idClassificacao;


        const movimento = await prisma.movimentoContas.create({
            data: {
                tipo: 'APAGAR', 
                numeronotafiscal: dadosIA.numero_nota_fiscal,
                dataemissao: new Date(dadosIA.data_emissao),
                descricao: dadosIA.descricao_produtos,
                valortotal: dadosIA.valor_total,
                Pessoas_idFornecedorCliente: fornecedorId,
                Pessoas_idFaturado: faturadoId,
                
                classificacoes: {
                    create: [{
                        Classificacao: { connect: { idClassificacao: classificacaoId } }
                    }]
                },

                parcelas: {
                    create: dadosIA.parcelas.map((p, index) => {
                        const valorTotal = parseFloat(dadosIA.valor_total);
                        const numParcelas = dadosIA.parcelas.length;
                        const valorParcela = parseFloat((valorTotal / numParcelas).toFixed(2));

                        return {
                            Identificacao: `${index + 1}/${numParcelas}`,
                            datavencimento: new Date(p.data_vencimento),
                            valorparcela: valorParcela,
                            valorsaldo: valorParcela,
                        };
                    })
                }
            },
            include: {
                parcelas: true,
                FornecedorCliente: true
            }
        });
        return {
            mensagem: 'Registro de Contas a Pagar e parcelas lançados com sucesso!',
            movimentoId: movimento.idMovimentoContas,
            valorTotal: movimento.valortotal,
            parcelasCriadas: movimento.parcelas.length
        };
    }
}

export default PersistenciaAgente;