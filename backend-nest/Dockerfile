FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci


FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
COPY russian_trusted_root_ca.cer ./russian_trusted_root_ca.cer

RUN npx prisma generate
RUN npm run build


FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nodejs:nodejs /app/russian_trusted_root_ca.cer ./russian_trusted_root_ca.cer

USER nodejs

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
