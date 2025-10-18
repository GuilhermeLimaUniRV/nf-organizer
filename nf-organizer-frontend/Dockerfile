# /nf-organizer-frontend/Dockerfile (Versão de Desenvolvimento)

# Usa o Node, que contém o NPM e o VITE
FROM node:22-alpine 

WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./
RUN npm install

# Copia o código-fonte
COPY . .

# Expõe a porta do Vite
EXPOSE 5173

# O comando de desenvolvimento será executado pelo Docker Compose (veja o próximo passo)
CMD [ "npm", "run", "dev" ]