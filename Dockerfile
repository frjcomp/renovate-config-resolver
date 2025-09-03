FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY app.js ./
COPY server.js ./

EXPOSE 3000

CMD ["node", "api/index.js"]