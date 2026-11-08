# Multi-stage production Dockerfile for CRM Backend
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Final runtime image
FROM node:20-alpine AS runner

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Security: run as non-root node user
USER node

COPY --chown=node:node --from=builder /usr/src/app /usr/src/app

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
