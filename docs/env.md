# Environment Variables

Этот документ описывает переменные окружения проекта Laboratory.

В проекте есть два приложения:

- `backend` — Express API;
- `client` — Next.js frontend.

Переменные backend и client задаются отдельно.

## Главное правило

Не храните реальные секреты в git.

Нельзя коммитить:

```text
.env
.env.local
.env.docker
.env.production
```

Можно коммитить только шаблоны:

```text
.env.example
.env.docker.example
```

Если секрет уже попал в публичный репозиторий, его нужно считать скомпрометированным и перевыпустить.

## Файлы окружения

Рекомендуемая схема:

```text
backend/
├── .env.example          # шаблон для локальной разработки
├── .env                  # локальная разработка, не коммитить
├── .env.docker.example   # шаблон для Docker
└── .env.docker           # Docker-запуск, не коммитить

client/
├── .env.example          # шаблон frontend
└── .env.local            # локальный frontend, не коммитить
```

Для production можно использовать:

```text
.env.production
```

Этот файл тоже нельзя хранить в git.

## Backend variables

### Server

| Variable | Required | Default | Description |
|---|---:|---|---|
| `PORT` | no | `3000` | порт backend внутри контейнера или локального процесса |
| `NODE_ENV` | no | `development` | режим запуска: `development`, `test`, `production` |
| `HTTPS` | no | `false` | включает secure-cookie логику, если backend видит HTTPS |
| `JSON_LIMIT` | no | `10mb` | максимальный размер JSON body |
| `LOG_LEVEL` | no | `debug`/`info` | уровень логирования |
| `LOG_FILE` | no | empty | файл логов, если используется файловое логирование |
| `INSTANCE_ID` | no | auto | id backend-инстанса для логов и Redis Pub/Sub |

### Database

| Variable | Required | Default | Description |
|---|---:|---|---|
| `DATABASE_URL` | yes | empty | строка подключения к PostgreSQL |
| `PGSSL` | no | `false` | использовать SSL для PostgreSQL |

Локально:

```env
DATABASE_URL=postgresql://ai_lab_user:admin@localhost:5432/ai_lab
PGSSL=false
```

В Docker:

```env
DATABASE_URL=postgresql://ai_lab_user:admin@db:5432/ai_lab
PGSSL=false
```

В production с managed PostgreSQL может понадобиться:

```env
PGSSL=true
```

### CORS

| Variable | Required | Default | Description |
|---|---:|---|---|
| `CORS_ORIGINS` | yes in production | dev localhost origins | список разрешённых origins через запятую |
| `CORS_METHODS` | no | `GET,POST,DELETE,OPTIONS` | разрешённые HTTP-методы |
| `CORS_ALLOWED_HEADERS` | no | project headers | разрешённые headers |
| `CORS_CREDENTIALS` | no | `true` | разрешить cookie/credentials |
| `CORS_MAX_AGE` | no | `86400` | cache preflight в секундах |

Локально:

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_METHODS=GET,POST,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,x-csrf-token,x-classroom-code,x-teacher-token
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400
```

Если frontend запущен на `http://localhost:3001`, этот origin обязательно должен быть в `CORS_ORIGINS`.

### CSP / security headers

| Variable | Required | Default | Description |
|---|---:|---|---|
| `CSP_ENABLED` | no | `false` in dev, `true` in production | включает Content Security Policy |
| `CSP_UPGRADE_INSECURE_REQUESTS` | no | production-dependent | добавляет upgrade insecure requests |

Development:

```env
CSP_ENABLED=false
CSP_UPGRADE_INSECURE_REQUESTS=false
```

Production:

```env
CSP_ENABLED=true
CSP_UPGRADE_INSECURE_REQUESTS=true
```

### CSRF / session

| Variable | Required | Default | Description |
|---|---:|---|---|
| `CSRF_SECRET` | yes in production | random/dev fallback | секрет для подписи session/CSRF tokens |

Требования:

- минимум 32 символа;
- в production обязательно задавать явно;
- не использовать `change_me`, `secret`, `default_secret`;
- не хранить в git.

Сгенерировать через OpenSSL:

```bash
openssl rand -hex 32
```

Сгенерировать через Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Пример:

```env
CSRF_SECRET=replace_this_with_64_hex_characters_generated_locally
```

### GigaChat / AI

| Variable | Required | Default | Description |
|---|---:|---|---|
| `AI_MOCK` | no | `true` in safe dev, `false` in production | использовать mock-ответы вместо реального AI |
| `GIGACHAT_CLIENT_ID` | yes when `AI_MOCK=false` | empty | client id GigaChat |
| `GIGACHAT_CLIENT_SECRET` | yes when `AI_MOCK=false` | empty | client secret GigaChat |
| `GIGACHAT_AUTH_URL` | no | official auth URL | URL получения OAuth token |
| `GIGACHAT_API_URL` | no | official API URL | базовый URL GigaChat API |

Development без реального AI:

```env
AI_MOCK=true
GIGACHAT_CLIENT_ID=
GIGACHAT_CLIENT_SECRET=
GIGACHAT_AUTH_URL=https://ngw.devices.sberbank.ru:9443/api/v2/oauth
GIGACHAT_API_URL=https://gigachat.devices.sberbank.ru/api/v1
```

Development с реальным AI:

```env
AI_MOCK=false
GIGACHAT_CLIENT_ID=your_client_id
GIGACHAT_CLIENT_SECRET=your_client_secret
GIGACHAT_AUTH_URL=https://ngw.devices.sberbank.ru:9443/api/v2/oauth
GIGACHAT_API_URL=https://gigachat.devices.sberbank.ru/api/v1
```

Production:

```env
AI_MOCK=false
GIGACHAT_CLIENT_ID=your_production_client_id
GIGACHAT_CLIENT_SECRET=your_production_client_secret
GIGACHAT_AUTH_URL=https://ngw.devices.sberbank.ru:9443/api/v2/oauth
GIGACHAT_API_URL=https://gigachat.devices.sberbank.ru/api/v1
```

### Redis / WebSocket

| Variable | Required | Default | Description |
|---|---:|---|---|
| `REDIS_URL` | no for single instance, yes for multi-instance | empty | Redis connection URL |
| `REDIS_WS_CHANNEL` | no | `lab:ws:broadcast` | канал Pub/Sub для WebSocket-событий |

Локально:

```env
REDIS_URL=redis://localhost:6379
REDIS_WS_CHANNEL=lab:ws:broadcast
```

В Docker:

```env
REDIS_URL=redis://redis:6379
REDIS_WS_CHANNEL=lab:ws:broadcast
```

Если `REDIS_URL` не задан, WebSocket-события будут работать только внутри одного backend-инстанса.

Для production и масштабирования Redis нужен обязательно.

## Client variables

Next.js frontend использует только переменные с префиксом `NEXT_PUBLIC_` на стороне браузера.

Важно: всё с `NEXT_PUBLIC_` попадает в client bundle. Не кладите туда секреты.

| Variable | Required | Default | Description |
|---|---:|---|---|
| `NEXT_PUBLIC_API_URL` | no | auto/project-dependent | базовый URL API для браузера |
| `NEXT_PUBLIC_BACKEND_URL` | no | `http://localhost:3000` or proxy URL | URL backend/Nginx для браузера |
| `NEXT_PUBLIC_WS_URL` | no | auto/project-dependent | WebSocket URL |
| `BACKEND_URL` | no | empty | server-side URL для Next.js, если нужен |

Локальный frontend + локальный backend без Nginx:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000/ws
BACKEND_URL=http://localhost:3000
```

Локальный frontend + backend через Docker Nginx:

```env
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_BACKEND_URL=http://localhost
NEXT_PUBLIC_WS_URL=ws://localhost/ws
BACKEND_URL=http://localhost
```

Frontend в Docker profile `full`:

```env
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_BACKEND_URL=http://localhost
NEXT_PUBLIC_WS_URL=ws://localhost/ws
BACKEND_URL=http://nginx:80
```

Production:

```env
NEXT_PUBLIC_API_URL=https://your-domain.example/api
NEXT_PUBLIC_BACKEND_URL=https://your-domain.example
NEXT_PUBLIC_WS_URL=wss://your-domain.example/ws
BACKEND_URL=http://nginx:80
```

## Пример `backend/.env` для локальной разработки

```env
PORT=3000
NODE_ENV=development
HTTPS=false
JSON_LIMIT=10mb

DATABASE_URL=postgresql://ai_lab_user:admin@localhost:5432/ai_lab
PGSSL=false

CORS_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_METHODS=GET,POST,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,x-csrf-token,x-classroom-code,x-teacher-token
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400

CSP_ENABLED=false
CSP_UPGRADE_INSECURE_REQUESTS=false

AI_MOCK=true
GIGACHAT_CLIENT_ID=
GIGACHAT_CLIENT_SECRET=
GIGACHAT_AUTH_URL=https://ngw.devices.sberbank.ru:9443/api/v2/oauth
GIGACHAT_API_URL=https://gigachat.devices.sberbank.ru/api/v1

CSRF_SECRET=replace_with_random_64_hex_characters

REDIS_URL=redis://localhost:6379
REDIS_WS_CHANNEL=lab:ws:broadcast
INSTANCE_ID=backend-local-1

LOG_LEVEL=debug
```

## Пример `backend/.env.docker`

```env
NODE_ENV=production
PORT=3000
HTTPS=false
JSON_LIMIT=10mb

AI_MOCK=true
GIGACHAT_CLIENT_ID=
GIGACHAT_CLIENT_SECRET=
GIGACHAT_AUTH_URL=https://ngw.devices.sberbank.ru:9443/api/v2/oauth
GIGACHAT_API_URL=https://gigachat.devices.sberbank.ru/api/v1

CSRF_SECRET=replace_with_random_64_hex_characters

CORS_ORIGINS=http://localhost:3001,http://localhost,http://127.0.0.1:3001
CORS_METHODS=GET,POST,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,x-csrf-token,x-classroom-code,x-teacher-token
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400

CSP_ENABLED=false
CSP_UPGRADE_INSECURE_REQUESTS=false

REDIS_WS_CHANNEL=lab:ws:broadcast

LOG_LEVEL=info
```

`DATABASE_URL` и `REDIS_URL` в Docker Compose могут задаваться прямо в `compose.dev.yml`, потому что внутри Docker нужно использовать service names:

```env
DATABASE_URL=postgresql://ai_lab_user:admin@db:5432/ai_lab
REDIS_URL=redis://redis:6379
```

## Пример `client/.env.local`

Для backend напрямую:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000/ws
BACKEND_URL=http://localhost:3000
```

Для backend через Docker Nginx:

```env
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_BACKEND_URL=http://localhost
NEXT_PUBLIC_WS_URL=ws://localhost/ws
BACKEND_URL=http://localhost
```

## Пример production env

Backend:

```env
NODE_ENV=production
PORT=3000
HTTPS=true
JSON_LIMIT=10mb

DATABASE_URL=postgresql://ai_lab_user:strong_password@db:5432/ai_lab
PGSSL=false

CORS_ORIGINS=https://your-domain.example
CORS_METHODS=GET,POST,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,x-csrf-token,x-classroom-code,x-teacher-token
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400

CSP_ENABLED=true
CSP_UPGRADE_INSECURE_REQUESTS=true

AI_MOCK=false
GIGACHAT_CLIENT_ID=your_client_id
GIGACHAT_CLIENT_SECRET=your_client_secret
GIGACHAT_AUTH_URL=https://ngw.devices.sberbank.ru:9443/api/v2/oauth
GIGACHAT_API_URL=https://gigachat.devices.sberbank.ru/api/v1

CSRF_SECRET=replace_with_random_64_hex_characters

REDIS_URL=redis://redis:6379
REDIS_WS_CHANNEL=lab:ws:broadcast
INSTANCE_ID=backend-prod-1

LOG_LEVEL=info
```

Client:

```env
NEXT_PUBLIC_API_URL=https://your-domain.example/api
NEXT_PUBLIC_BACKEND_URL=https://your-domain.example
NEXT_PUBLIC_WS_URL=wss://your-domain.example/ws
BACKEND_URL=http://nginx:80
```

## Dev vs Production

| Setting | Development | Production |
|---|---|---|
| `NODE_ENV` | `development` | `production` |
| `AI_MOCK` | можно `true` | только `false` |
| `HTTPS` | обычно `false` | `true` или HTTPS на proxy |
| `CSP_ENABLED` | можно `false` | `true` |
| `CORS_ORIGINS` | localhost origins | только реальные домены |
| `CSRF_SECRET` | можно локальный | обязательно сильный секрет |
| `DATABASE_URL` | localhost/db | production PostgreSQL |
| `REDIS_URL` | optional | обязателен для scale |
| `NEXT_PUBLIC_WS_URL` | `ws://...` | `wss://...` |

## Как проверить env

Backend:

```bash
cd backend
npm run typecheck
npm run build
npm run dev
```

Docker:

```bash
cd backend
docker compose --env-file .env.docker -f compose.dev.yml config
docker compose --env-file .env.docker -f compose.dev.yml up --build -d
curl http://localhost/health
```

Client:

```bash
cd client
npm run typecheck
npm run build
npm run dev
```

## Частые ошибки

### `DATABASE_URL is required in production`

Добавьте:

```env
DATABASE_URL=postgresql://ai_lab_user:admin@db:5432/ai_lab
```

Для локального запуска вне Docker используйте `localhost`, для Docker — `db`.

### `AI_MOCK=true is not allowed in production`

В production используйте:

```env
AI_MOCK=false
GIGACHAT_CLIENT_ID=your_client_id
GIGACHAT_CLIENT_SECRET=your_client_secret
```

Для разработки можно поставить:

```env
NODE_ENV=development
AI_MOCK=true
```

### `GIGACHAT_CLIENT_ID and GIGACHAT_CLIENT_SECRET are required`

Это значит, что `AI_MOCK=false`, но credentials не заданы.

Вариант для реального AI:

```env
AI_MOCK=false
GIGACHAT_CLIENT_ID=your_client_id
GIGACHAT_CLIENT_SECRET=your_client_secret
```

Вариант для mock-режима:

```env
AI_MOCK=true
GIGACHAT_CLIENT_ID=
GIGACHAT_CLIENT_SECRET=
```

### CORS блокирует запросы

Проверьте, что frontend origin есть в `CORS_ORIGINS`.

Например, frontend на `http://localhost:3001`:

```env
CORS_ORIGINS=http://localhost:3001,http://localhost
CORS_CREDENTIALS=true
```

### Cookie не сохраняется

Проверьте:

```env
CORS_CREDENTIALS=true
HTTPS=false
```

Для production с HTTPS:

```env
HTTPS=true
```

Также frontend должен отправлять credentials.

### WebSocket работает локально, но не работает через Nginx

Проверьте:

```env
NEXT_PUBLIC_WS_URL=ws://localhost/ws
```

В production:

```env
NEXT_PUBLIC_WS_URL=wss://your-domain.example/ws
```

Также проверьте, что Nginx проксирует `/ws` с headers:

```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

### Redis не используется

Если `REDIS_URL` пустой, backend может работать в single-instance режиме, но события WebSocket не будут рассылаться между несколькими backend-инстансами.

Для Docker:

```env
REDIS_URL=redis://redis:6379
```

Для локального запуска:

```env
REDIS_URL=redis://localhost:6379
```

## Checklist перед commit

Проверьте:

```bash
git status
```

В commit не должны попасть:

```text
backend/.env
backend/.env.docker
backend/.env.production
client/.env.local
.env
.env.production
```

Проверьте секреты:

```bash
git grep -n "GIGACHAT_CLIENT_SECRET"
git grep -n "CSRF_SECRET"
git grep -n "password"
```

Если команда находит реальные секреты — не коммитьте изменения, замените значения на placeholders.