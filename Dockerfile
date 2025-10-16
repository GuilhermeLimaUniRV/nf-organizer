# 1. IMAGEM BASE: Trava na versão 22 (sua versão de desenvolvimento)
# e usa o minimalista Alpine.
FROM node:22-alpine

# 2. DIRETÓRIO DE TRABALHO: Define o diretório de trabalho dentro do contêiner.
# Todos os comandos subsequentes (COPY, RUN, etc.) serão executados a partir daqui.
WORKDIR /usr/src/app

# 3. COPIA ARQUIVOS DE DEPENDÊNCIA: Copia apenas o package.json e package-lock.json.
# Isso permite que o Docker use o cache para a camada RUN npm install,
# ou seja, se o código mudar, mas as dependências não, o build é mais rápido.
COPY package*.json ./

# 4. INSTALA DEPENDÊNCIAS: Executa o comando de instalação.
RUN npm install

# 5. COPIA O CÓDIGO FONTE: Copia o restante do seu código para o contêiner.
# O .dockerignore garantirá que arquivos desnecessários fiquem de fora.
COPY . .

# 6. PORTA: Informa ao Docker que o contêiner escutará nesta porta.
# Deve corresponder à porta que você definiu no seu server.js (geralmente 3000).
EXPOSE 3000

# 7. COMANDO DE INICIALIZAÇÃO: Define como a aplicação será iniciada.
# Usa o script "start" definido no seu package.json (se você o tiver configurado).
CMD [ "npm", "run","dev" ]
# Se você usou "node server.js" como comando inicial, use:
# CMD [ "node", "server.js" ]