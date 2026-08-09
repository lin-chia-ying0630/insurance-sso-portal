FROM node:22.22.2-alpine
WORKDIR /app
COPY server.mjs ./server.mjs
EXPOSE 8080
USER node
HEALTHCHECK --interval=5s --timeout=3s --retries=5 CMD wget -q -O - http://127.0.0.1:8080/health || exit 1
CMD ["node", "server.mjs"]
