Com certeza. Vou gerar a versão final e clara do seu `README.md`, enfatizando a seção **`2. Configurar Variáveis de Ambiente`** para que quem clonar o projeto saiba exatamente o que colocar no arquivo `.env`.

-----

# NF Organizer Full Stack (Etapa N2 - Persistência)

Este projeto é uma aplicação Full Stack conteinerizada focada na **extração e persistência de dados de Notas Fiscais**.

Ele implementa os requisitos da **Atividade N2**, incluindo consultas de existência no Banco de Dados (DB) antes do lançamento financeiro.

## ⚙️ Arquitetura de Serviços

O ambiente é orquestrado pelo Docker Compose e consiste em três serviços interligados:

1.  **`backend` (Node.js/Express):** API RESTful, lógica do **Agente Gemini**, e camada de persistência (Prisma).
2.  **`database` (PostgreSQL 16):** Servidor de banco de dados para persistir os movimentos financeiros.
3.  **`frontend` (React/Vite):** Interface de usuário para upload de PDFs e fluxo de persistência de 3 etapas.

## 📋 Pré-requisitos

Para rodar este projeto, você precisa ter:

1.  **Git:** Para clonar o repositório.
2.  **Docker Desktop:** Instalado e rodando (essencial para o Docker Compose).
3.  **Chave de API do Gemini:** (Necessário criar uma chave válida no Google AI Studio).

## 1\. Guia de Inicialização

Siga estes passos exatos para subir a aplicação completa:

### Passo 1: Clonar e Navegar

```bash
git clone https://github.com/GuilhermeLimaUniRV/nf-organizer
cd nf-organizer-fullstack
```

### Passo 2: Configurar Variáveis de Ambiente (CRUCIAL)

Você deve **criar um arquivo chamado `.env`** na **raiz** do repositório, no mesmo nível do `docker-compose.yml`.

O conteúdo deve ser **exatamente** o seguinte (substituindo apenas a chave Gemini real):

```
# .env (CRIE ESTE ARQUIVO NA RAIZ)

# --- Variáveis de API e Configuração de Porta ---
GEMINI_API_KEY="SUA_CHAVE_DE_API_GEMINI_AQUI" 
PORT=3000

# --- Credenciais do PostgreSQL (Não altere os nomes) ---
POSTGRES_USER=postgres_nf_user
POSTGRES_PASSWORD=nf_dev_2025
POSTGRES_DB=nf_db
```

### Passo 3: Subir a Aplicação (Build & Run Automático)

Este é o **comando único** que constrói as imagens, inicia todos os serviços e **aplica as migrações** do banco de dados automaticamente:

```bash
docker compose up -d --build
```

## 2\. Acesso e Fluxo de Trabalho (N2)

Após a migração ser aplicada automaticamente, o sistema está pronto para ser testado:

  * **Frontend (Interface):** `http://localhost:5173`
  * **Backend (API):** `http://localhost:3000`

### Fluxo de Uso:

1.  **Extração (Botão 1):** O frontend envia o PDF para o Backend (`/processar-nf`) e recebe o JSON.
2.  **Verificação (Automático):** O sistema exibe o status de existência no DB (`EXISTE` ou `NÃO EXISTE`) para Fornecedor, Faturado e Despesa.
3.  **Persistência (Botão 2):** O botão "Salvar Movimento" envia os dados para `/persistir-movimento`, lançando os registros no PostgreSQL.

## 3\. Gerenciamento do Ambiente

  * **Verificar logs:** `docker compose logs -f`
  * **Parar os serviços:** `docker compose stop`
  * **Limpeza Total (Parar e Remover tudo):** `docker compose down -v`
  * **Acessar o DB (pgAdmin):** Host: `localhost`, Porta: `5445`, e com os dados que vc definiu no seu .env.
