FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci


FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY russian_trusted_root_ca.cer ./russian_trusted_root_ca.cer

RUN npm run build
RUN cp -r src/db/migrations dist/db/migrations


FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/russian_trusted_root_ca.cer ./russian_trusted_root_ca.cer

USER nodejs

EXPOSE 3000

CMD ["node", "dist/server.js"]