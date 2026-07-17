# Backend (NestJS)

Backend на NestJS + Prisma: API, классы, генерация через GigaChat, логи, статистика и WebSocket.

В production backend запускается внутри Docker. Снаружи к нему обращается Nginx.

## Что есть внутри

- `src/main.ts` / `src/createApp.ts` — bootstrap NestJS (helmet, cors, swagger, cookies)
- `src/app.module.ts` — корневой модуль, guards и filters
- `src/modules` — feature-модули (classroom, generate, logs, …)
- `src/controllers` — HTTP-контроллеры
- `src/services` — бизнес-логика
- `src/repositories` — доступ к PostgreSQL через Prisma
- `prisma/schema.prisma` — схема БД

Swagger UI: `/api-docs`  
OpenAPI JSON: `/api-docs.json`

## Локальный запуск

```powershell
cd backend-nest
copy .env.example .env
npm install
npx prisma generate
npm run start:dev
```

## Docker

См. [docs/DOCKER.md](docs/DOCKER.md).

```powershell
cd backend-nest
copy .env.docker.example .env.docker
docker compose --env-file .env.docker -f compose.dev.yml up --build -d
```

## Тесты

```powershell
npm run test:utils
npm run test:api
npm run test:all
```

Load (k6):

```powershell
npm run load:health
npm run load:csrf
npm run load:generate
```
