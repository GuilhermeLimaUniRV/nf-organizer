NF Organizer Full Stack (Etapa N2 - Persistência)
Este projeto é uma aplicação Full Stack conteinerizada focada na extração e persistência de dados de Notas Fiscais.

Ele implementa os requisitos da Atividade N2, incluindo consultas de existência no Banco de Dados (DB) antes do lançamento financeiro.

⚙️ Arquitetura de Serviços
O ambiente é orquestrado pelo Docker Compose e consiste em três serviços interligados:

backend (Node.js/Express): API RESTful que orquestra o fluxo de 3 passos: Extração (IA), Verificação (DB) e Persistência.

ORM: Prisma (PostgreSQL Client).

Agente IA: Google Gemini API (para análise de PDFs).

database (PostgreSQL 16): Banco de dados relacional para persistir os movimentos financeiros.

frontend (React/Vite): Interface de usuário para upload de PDFs e visualização do status de existência no DB.

📋 Pré-requisitos
Para rodar este projeto, você precisa ter:

Git: Para clonar o repositório.

Docker Desktop: Instalado e rodando (essencial para o Docker Compose).

Chave de API do Gemini: (Necessário criar uma chave válida no Google AI Studio).

1. Guia de Inicialização
Siga estes passos exatos para subir a aplicação completa:

Passo 1: Clonar e Navegar
Bash

git clone https://www.youtube.com/watch?v=xtwls2XmJUI
cd nf-organizer-fullstack
Passo 2: Configurar Variáveis de Ambiente (Segredos)
Crie um arquivo chamado .env na raiz do repositório (no mesmo nível do docker-compose.yml).

Este arquivo é obrigatório e define as credenciais do DB e a chave da IA:

# .env (CRIE ESTE ARQUIVO NA RAIZ)

# --- Configuração da API Gemini ---
GEMINI_API_KEY="SUA_CHAVE_AQUI" 
PORT=3000

# --- Credenciais do PostgreSQL (VOCÊ PODE ESCOLHER OS VALORES) ---
POSTGRES_USER=postgres_nf_user
POSTGRES_PASSWORD=nf_dev_2025
POSTGRES_DB=nf_db
(Substitua "SUA_CHAVE_AQUI" pela sua chave real).

Passo 3: Subir a Aplicação (Build & Run Automático)
Este é o comando único que constrói as imagens, inicia todos os serviços e aplica as migrações do banco de dados automaticamente:

Bash

docker compose up -d --build
2. Acesso e Fluxo de Trabalho (N2)
Após a migração, o sistema está pronto para ser testado através do fluxo de 3 passos no Frontend:

Acesso ao Frontend: http://localhost:5173

Acesso ao Backend (API): http://localhost:3000

Fluxo de Uso:
Extração (Botão 1): O frontend envia o PDF para o Backend (/processar-nf) e recebe o JSON da IA.

Verificação (Automático): O frontend envia o JSON para /verificar-existencia. O sistema exibe o status EXISTE ou NÃO EXISTE na tela (Requisito N2).

Persistência (Botão 2): Ao clicar em "Salvar Movimento", o frontend envia os dados para /persistir-movimento, lançando os registros no PostgreSQL.

3. Gerenciamento do Ambiente
Verificar logs: docker compose logs -f

Parar os serviços: docker compose stop

Iniciar os serviços parados: docker compose start

Limpeza Total (Parar e Remover tudo): docker compose down -v

Acessar o DB (pgAdmin): Host: localhost, Porta: 5432, Usuário: postgres
