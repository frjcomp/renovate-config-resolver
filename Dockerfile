FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY scripts ./scripts

RUN npm ci --only=production

COPY app.js ./
COPY server.js ./

RUN test -f renovate-schema.json || (echo "renovate-schema.json missing" && exit 1)

EXPOSE 3000

CMD ["node", "--max-old-space-size=128", "server.js"]