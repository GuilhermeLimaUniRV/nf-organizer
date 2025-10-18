NF Organizer Full Stack
Este projeto é uma aplicação Full Stack conteinerizada que utiliza Node.js (Express) para o Backend e React (Vite) para o Frontend, orquestrados pelo Docker Compose.

O objetivo principal é a extração automática de dados de Notas Fiscais (PDFs) utilizando a API Gemini do Google, classificando as despesas e retornando um JSON estruturado.

Arquitetura
O ambiente de desenvolvimento é composto por:

nf-organizer-backend: API RESTful em Node.js/Express. Inclui a lógica do Agente Gemini para processamento de PDFs (com multer para upload).

nf-organizer-frontend: Aplicação SPA em React/Vite. Interface para upload de arquivos e visualização do JSON extraído.

docker-compose.yml: Orquestra e interliga os serviços na mesma rede.

Pré-requisitos
Para rodar este projeto, você precisa ter:

Git: Para clonar o repositório.

Node.js e NPM: (Instalados no host).

Docker Desktop: Instalado e rodando (essencial para o Docker Compose).

Chave de API do Gemini: (Necessário criar uma chave no Google AI Studio).

1. Guia de Inicialização
Siga estes passos exatos para subir a aplicação completa:

Passo 1: Clonar e Navegar
Bash

git clone https://github.com/GuilhermeLimaUniRV/nf-organizer.git
cd nf-organizer-fullstack
Passo 2: Configurar Variáveis de Ambiente
Crie um arquivo chamado .env na raiz do repositório (no mesmo nível do docker-compose.yml).

Este arquivo é obrigatório e suas variáveis serão injetadas em todos os contêineres:

# .env (CRIE ESTE ARQUIVO NA RAIZ)

# --- Configuração da API Gemini ---
GEMINI_API_KEY="SUA_CHAVE_AQUI"

# --- Configuração Geral ---
PORT=3000
(Substitua "SUA_CHAVE_AQUI" pela sua chave real).

Passo 3: Subir a Aplicação (Build & Run)
Este comando constrói as imagens (Backend e Frontend) e inicia os dois contêineres, criando a rede interna entre eles.

Bash

docker compose up -d --build
Passo 4: Acessar e Testar
Aguarde cerca de 30 segundos para a inicialização completa.

Serviço	Porta	Finalidade
Frontend (Interface)	http://localhost:5173	Acessar no navegador
Backend (API)	http://localhost:8080	Testar o endpoint /processar-nf (ex: via Postman)

Exportar para as Planilhas

2. Gerenciamento do Ambiente
Use os seguintes comandos do docker compose para controlar os serviços:

Ação	Comando
Verificar logs (erros/status)	docker compose logs -f
Parar os serviços (mantém arquivos)	docker compose stop
Iniciar os serviços parados	docker compose start
Limpeza Total (Parar e Remover tudo)	docker compose down
