-- CreateTable
CREATE TABLE "Pessoas" (
    "idPessoas" SERIAL NOT NULL,
    "tipo" VARCHAR(45) NOT NULL,
    "razaosocial" VARCHAR(150) NOT NULL,
    "fantasia" VARCHAR(150),
    "documento" VARCHAR(45) NOT NULL,
    "status" VARCHAR(45) NOT NULL DEFAULT 'ATIVO',

    CONSTRAINT "Pessoas_pkey" PRIMARY KEY ("idPessoas")
);

-- CreateTable
CREATE TABLE "Classificacao" (
    "idClassificacao" SERIAL NOT NULL,
    "tipo" VARCHAR(45) NOT NULL,
    "descricao" VARCHAR(150) NOT NULL,
    "status" VARCHAR(45) NOT NULL DEFAULT 'ATIVO',

    CONSTRAINT "Classificacao_pkey" PRIMARY KEY ("idClassificacao")
);

-- CreateTable
CREATE TABLE "MovimentoContas" (
    "idMovimentoContas" SERIAL NOT NULL,
    "tipo" VARCHAR(45) NOT NULL,
    "numeronotafiscal" VARCHAR(45) NOT NULL,
    "dataemissao" DATE NOT NULL,
    "descricao" VARCHAR(300) NOT NULL,
    "status" VARCHAR(45) NOT NULL DEFAULT 'PENDENTE',
    "valortotal" DECIMAL(10,2) NOT NULL,
    "Pessoas_idFornecedorCliente" INTEGER NOT NULL,
    "Pessoas_idFaturado" INTEGER NOT NULL,

    CONSTRAINT "MovimentoContas_pkey" PRIMARY KEY ("idMovimentoContas")
);

-- CreateTable
CREATE TABLE "MovimentoContas_has_Classificacao" (
    "MovimentoContas_idMovimentoContas" INTEGER NOT NULL,
    "Classificacao_idClassificacao" INTEGER NOT NULL,

    CONSTRAINT "MovimentoContas_has_Classificacao_pkey" PRIMARY KEY ("MovimentoContas_idMovimentoContas","Classificacao_idClassificacao")
);

-- CreateTable
CREATE TABLE "ParcelasContas" (
    "idParcelasContas" SERIAL NOT NULL,
    "Identificacao" VARCHAR(45) NOT NULL,
    "datavencimento" DATE NOT NULL,
    "valorparcela" DECIMAL(10,2) NOT NULL,
    "valorpago" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "valorsaldo" DECIMAL(10,2) NOT NULL,
    "statusparcela" VARCHAR(45) NOT NULL DEFAULT 'ABERTA',
    "MovimentoContas_idMovimentoContas" INTEGER NOT NULL,

    CONSTRAINT "ParcelasContas_pkey" PRIMARY KEY ("idParcelasContas")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pessoas_documento_key" ON "Pessoas"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Classificacao_descricao_key" ON "Classificacao"("descricao");

-- CreateIndex
CREATE UNIQUE INDEX "MovimentoContas_numeronotafiscal_Pessoas_idFornecedorClient_key" ON "MovimentoContas"("numeronotafiscal", "Pessoas_idFornecedorCliente");

-- CreateIndex
CREATE UNIQUE INDEX "ParcelasContas_Identificacao_MovimentoContas_idMovimentoCon_key" ON "ParcelasContas"("Identificacao", "MovimentoContas_idMovimentoContas");

-- AddForeignKey
ALTER TABLE "MovimentoContas" ADD CONSTRAINT "MovimentoContas_Pessoas_idFornecedorCliente_fkey" FOREIGN KEY ("Pessoas_idFornecedorCliente") REFERENCES "Pessoas"("idPessoas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoContas" ADD CONSTRAINT "MovimentoContas_Pessoas_idFaturado_fkey" FOREIGN KEY ("Pessoas_idFaturado") REFERENCES "Pessoas"("idPessoas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoContas_has_Classificacao" ADD CONSTRAINT "MovimentoContas_has_Classificacao_MovimentoContas_idMovime_fkey" FOREIGN KEY ("MovimentoContas_idMovimentoContas") REFERENCES "MovimentoContas"("idMovimentoContas") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoContas_has_Classificacao" ADD CONSTRAINT "MovimentoContas_has_Classificacao_Classificacao_idClassifi_fkey" FOREIGN KEY ("Classificacao_idClassificacao") REFERENCES "Classificacao"("idClassificacao") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelasContas" ADD CONSTRAINT "ParcelasContas_MovimentoContas_idMovimentoContas_fkey" FOREIGN KEY ("MovimentoContas_idMovimentoContas") REFERENCES "MovimentoContas"("idMovimentoContas") ON DELETE CASCADE ON UPDATE CASCADE;
