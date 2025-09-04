FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY app.js server.js renovate-schema.json logger.js ./
COPY scripts ./scripts

RUN [ -f "renovate-schema.json" ] || (echo "renovate-schema.json missing" && exit 1)

EXPOSE 3000

CMD ["node", "server.js"]