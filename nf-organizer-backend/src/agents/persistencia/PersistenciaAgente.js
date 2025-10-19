// src/agents/persistencia/PersistenciaAgente.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class PersistenciaAgente {
    // ----------------------------------------------------
    // Lógica 1: Consultar Pessoas (Fornecedor ou Faturado)
    // ----------------------------------------------------
    async verificarPessoa(documento, tipoPessoa) {
        // Busca a pessoa pelo documento (CPF/CNPJ), que é único (Regra N2)
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
            // Regra N2: Deve consultar no Banco de Dados e informar se existe
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

    // ----------------------------------------------------
    // Lógica 2: Consultar Classificação (Despesa)
    // ----------------------------------------------------
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

    // ----------------------------------------------------
    // Lógica 3: Persistir Novo Registro Completo (Criação Condicional)
    // ----------------------------------------------------
    async persistirMovimentoCompleto(dadosIA, resultadosVerificacao) {
        
        // Regra N2: CRIAR NOVO FORNECEDOR/FATURADO/DESPESA (se for o caso)
        // Usaremos uma transação para garantir que tudo seja salvo ou nada seja salvo.
        
        // 1. Criar ou conectar Fornecedor (Pessoas)
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

        // 2. Criar ou conectar Faturado (Pessoas)
        let faturadoId;
        if (resultadosVerificacao.faturado.existe) {
            faturadoId = resultadosVerificacao.faturado.id;
        } else {
            const novoFaturado = await prisma.pessoas.create({
                data: {
                    tipo: 'FATURADO',
                    razaosocial: dadosIA.faturado.nome_completo,
                    // Assume que CNPJ e CPF são usados no campo 'documento'
                    documento: dadosIA.faturado.cpf, 
                    status: 'ATIVO'
                }
            });
            faturadoId = novoFaturado.idPessoas;
        }
        
        // 3. Criar Classificações (Despesas) - Lógica simplificada para a primeira despesa
        // Iremos pegar a primeira classificação sugerida pela IA
        const descricaoClassificacao = dadosIA.classificacao_despesa[0] || 'OUTROS';
        let classificacaoId;
        
        // Busca ou cria a classificação
        const classificacao = await prisma.classificacao.upsert({
            where: { descricao: descricaoClassificacao },
            update: {}, // Não faz nada se existir
            create: {
                tipo: 'DESPESA',
                descricao: descricaoClassificacao,
                status: 'ATIVO'
            }
        });
        classificacaoId = classificacao.idClassificacao;


        // 4. Cria o MovimentoContas e as Parcelas em uma única transação
        const movimento = await prisma.movimentoContas.create({
            data: {
                tipo: 'APAGAR', // Assumimos que é Contas a Pagar
                numeronotafiscal: dadosIA.numero_nota_fiscal,
                dataemissao: new Date(dadosIA.data_emissao),
                descricao: dadosIA.descricao_produtos,
                valortotal: dadosIA.valor_total,
                Pessoas_idFornecedorCliente: fornecedorId,
                Pessoas_idFaturado: faturadoId,
                
                // Relacionamento com Classificacao (Tabela N:N)
                classificacoes: {
                    create: [{
                        Classificacao: { connect: { idClassificacao: classificacaoId } }
                    }]
                },

                // 5. Cria as Parcelas (com base no JSON da IA)
                parcelas: {
                    create: dadosIA.parcelas.map((p, index) => {
                        const valorTotal = parseFloat(dadosIA.valor_total);
                        const numParcelas = dadosIA.parcelas.length;
                        // Calcula o valor da parcela (simplificado: divisão igual)
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

        // Retorna o movimento criado (Regra N2: INFORMAR AO USUÁRIO QUE REGISTRO FOI LANÇADO)
        return {
            mensagem: 'Registro de Contas a Pagar e parcelas lançados com sucesso!',
            movimentoId: movimento.idMovimentoContas,
            valorTotal: movimento.valortotal,
            parcelasCriadas: movimento.parcelas.length
        };
    }
}

export default PersistenciaAgente;