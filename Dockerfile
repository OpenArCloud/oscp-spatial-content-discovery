FROM node:24.14.0 AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build && cp src/swagger.json dist/swagger.json

FROM node:24.14.0-slim AS runtime

ARG APP_PORT=8032

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

ENV PORT=${APP_PORT}

EXPOSE ${APP_PORT}

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||'8032')+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
