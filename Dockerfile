FROM node:22

WORKDIR /app

COPY package*.json ./
COPY scripts ./scripts

RUN npm ci

COPY app.js ./
COPY server.js ./

RUN test -f renovate-schema.json || (echo "renovate-schema.json missing" && exit 1)

EXPOSE 3000

CMD ["node", "server.js"]