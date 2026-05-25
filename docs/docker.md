# Docker

Этот документ описывает запуск Laboratory через Docker.

В Docker-режиме проект состоит из нескольких сервисов:

- PostgreSQL — хранение классов и логов;
- Redis — Pub/Sub для WebSocket-событий;
- Backend — Express API;
- Nginx — reverse proxy для API, healthcheck, Swagger и WebSocket;
- Client — опционально, через Docker Compose profile `full`.

## Где лежат Docker-файлы

```text
backend/
├── compose.dev.yml
├── Dockerfile
├── Dockerfile.nginx
├── nginx.conf
├── .env.docker.example
└── .env.docker

client/
└── Dockerfile
```

Основной compose-файл находится в `backend/compose.dev.yml`.

## Требования

Установите:

- Docker;
- Docker Compose v2.

Проверка:

```bash
docker --version
docker compose version
```

## Быстрый запуск backend-стека

Перейдите в папку backend:

```bash
cd backend
```

Создайте файл окружения:

```bash
cp .env.docker.example .env.docker
```

Откройте `.env.docker` и замените значения:

```env
GIGACHAT_CLIENT_ID=your_client_id
GIGACHAT_CLIENT_SECRET=your_client_secret
CSRF_SECRET=replace_with_random_64_char_secret
AI_MOCK=false
```

Для разработки без реального GigaChat можно поставить:

```env
AI_MOCK=true
GIGACHAT_CLIENT_ID=
GIGACHAT_CLIENT_SECRET=
```

Запустите стек:

```bash
docker compose --env-file .env.docker -f compose.dev.yml up --build -d
```

Проверка контейнеров:

```bash
docker compose -f compose.dev.yml ps
```

Проверка API:

```bash
curl http://localhost/health
```

Swagger UI:

```text
http://localhost/api-docs
```

OpenAPI JSON:

```text
http://localhost/api-docs.json
```

## Порты

| Сервис | Внутренний порт | Внешний порт | Назначение |
|---|---:|---:|---|
| Nginx | 80 | 80 | публичная точка входа |
| Backend | 3000 | не публикуется напрямую | API внутри Docker-сети |
| PostgreSQL | 5432 | 5432 | база данных |
| Redis | 6379 | 6379 | Pub/Sub и WebSocket |
| Client profile `full` | 3000 | 3001 | frontend |

В обычном Docker-запуске frontend можно запускать локально через `npm run dev`, а backend будет доступен через Nginx на `http://localhost`.

## Запуск с frontend-контейнером

Client подключён к compose через profile `full`.

Запуск полного стека:

```bash
cd backend
docker compose --profile full --env-file .env.docker -f compose.dev.yml up --build -d
```

После запуска:

```text
Frontend: http://localhost:3001
Backend через Nginx: http://localhost
Swagger: http://localhost/api-docs
Health: http://localhost/health
WebSocket: ws://localhost/ws
```

## Остановка

Остановить контейнеры без удаления данных PostgreSQL:

```bash
docker compose -f compose.dev.yml down
```

Остановить и удалить volume PostgreSQL:

```bash
docker compose -f compose.dev.yml down -v
```

После `down -v` база данных будет очищена.

## Логи

Все сервисы:

```bash
docker compose -f compose.dev.yml logs -f
```

Только backend:

```bash
docker compose -f compose.dev.yml logs -f backend
```

Только Nginx:

```bash
docker compose -f compose.dev.yml logs -f nginx
```

Только PostgreSQL:

```bash
docker compose -f compose.dev.yml logs -f db
```

Только Redis:

```bash
docker compose -f compose.dev.yml logs -f redis
```

## Пересборка

Backend:

```bash
docker compose --env-file .env.docker -f compose.dev.yml build backend
docker compose --env-file .env.docker -f compose.dev.yml up -d backend
```

Nginx:

```bash
docker compose --env-file .env.docker -f compose.dev.yml build nginx
docker compose --env-file .env.docker -f compose.dev.yml up -d nginx
```

Полная пересборка:

```bash
docker compose --env-file .env.docker -f compose.dev.yml up --build -d
```

## Миграции базы данных

Backend Dockerfile копирует SQL-миграции в production build.

Если приложение само запускает миграции при старте, отдельная команда не нужна.

Если нужно выполнить миграции вручную:

```bash
docker compose -f compose.dev.yml exec backend npm run db:init
```

Если команда недоступна в production-контейнере, выполните миграции локально из backend-папки:

```bash
npm install
npm run db:init
```

При этом `DATABASE_URL` должен указывать на Docker PostgreSQL:

```env
DATABASE_URL=postgresql://ai_lab_user:admin@localhost:5432/ai_lab
```

## Проверка WebSocket

Сначала получите обычный session cookie и создайте classroom через API.

Затем получите WebSocket token:

```bash
curl -i -b cookies.txt \
  "http://localhost/api/ws/token?classroom_code=ABC123"
```

Подключение выполняется к:

```text
ws://localhost/ws?classroom=ABC123&token=<token>
```

Через Nginx WebSocket-проксирование уже настроено на location `/ws`.

## Проверка CSRF/session flow

Получить session cookie:

```bash
curl -i -c cookies.txt "http://localhost/api/csrf/token?session_id=teacher-1"
```

Создать classroom:

```bash
curl -i -b cookies.txt -c cookies.txt \
  -X POST "http://localhost/api/classrooms" \
  -H "Content-Type: application/json" \
  -d '{"title":"Урок физики","expires_in_minutes":90,"grade":11}'
```

Подключить ученика:

```bash
curl -i -b cookies.txt -c cookies.txt \
  "http://localhost/api/classrooms/ABC123/join?student_id=student-1"
```

Отправить запрос:

```bash
curl -i -b cookies.txt \
  -X POST "http://localhost/api/generate" \
  -H "Content-Type: application/json" \
  -H "x-classroom-code: ABC123" \
  -d '{"mode":"text","prompt":"Объясни закон Ома","classroom_code":"ABC123","session_id":"student-1"}'
```

## Production-рекомендации

Для production не используйте `.env.docker` из разработки.

Создайте отдельный файл:

```text
.env.production
```

Минимальные требования:

```env
NODE_ENV=production
AI_MOCK=false
HTTPS=true
CSP_ENABLED=true
CSP_UPGRADE_INSECURE_REQUESTS=true
DATABASE_URL=postgresql://user:password@db:5432/ai_lab
REDIS_URL=redis://redis:6379
CSRF_SECRET=<long_random_secret>
CORS_ORIGINS=https://your-domain.example
GIGACHAT_CLIENT_ID=<real_client_id>
GIGACHAT_CLIENT_SECRET=<real_client_secret>
```

Production-запуск лучше делать через отдельный compose-файл, например:

```text
compose.prod.yml
```

В production:

- не публикуйте backend-порт напрямую наружу;
- открывайте только Nginx;
- используйте HTTPS на внешнем периметре;
- не храните `.env.production` в git;
- не используйте `AI_MOCK=true`;
- не используйте дефолтные секреты;
- включите CSP;
- ограничьте `CORS_ORIGINS` реальным доменом;
- настройте backup PostgreSQL;
- настройте логирование и мониторинг;
- настройте restart policy;
- используйте Docker secrets или secret manager, если проект разворачивается на сервере.

## Горизонтальное масштабирование backend

Текущий compose поднимает один backend-инстанс.

Для нескольких backend-инстансов нужно:

1. использовать общий PostgreSQL;
2. использовать общий Redis;
3. добавить несколько backend-сервисов или replicas;
4. настроить Nginx upstream;
5. проверить WebSocket routing;
6. желательно вынести session-token store в Redis.

Пример идеи upstream:

```nginx
upstream backend_upstream {
  server backend-1:3000;
  server backend-2:3000;
}
```

Для WebSocket желательно использовать sticky sessions или другой стабильный routing-подход, чтобы соединение не обрывалось при проксировании.

Redis Pub/Sub нужен для доставки событий между backend-инстансами:

```text
backend-1 publishes event -> Redis -> backend-2 receives event -> local WebSocket clients
```

## Типичные проблемы

### Порт 80 уже занят

Проверьте, кто занимает порт:

```bash
lsof -i :80
```

Можно временно поменять порт в `compose.dev.yml`:

```yaml
ports:
  - "8080:80"
```

После этого backend будет доступен на:

```text
http://localhost:8080
```

### PostgreSQL не стартует

Посмотрите логи:

```bash
docker compose -f compose.dev.yml logs db
```

Если база была создана с другими credentials, удалите volume:

```bash
docker compose -f compose.dev.yml down -v
docker compose --env-file .env.docker -f compose.dev.yml up --build -d
```

### Backend не подключается к базе

Внутри Docker `DATABASE_URL` должен использовать host `db`, а не `localhost`:

```env
DATABASE_URL=postgresql://ai_lab_user:admin@db:5432/ai_lab
```

Локально, вне Docker, используйте:

```env
DATABASE_URL=postgresql://ai_lab_user:admin@localhost:5432/ai_lab
```

### Backend не подключается к Redis

Внутри Docker:

```env
REDIS_URL=redis://redis:6379
```

Локально:

```env
REDIS_URL=redis://localhost:6379
```

### CORS ошибка в браузере

Проверьте `.env.docker`:

```env
CORS_ORIGINS=http://localhost:3001,http://localhost,http://127.0.0.1:3001
CORS_CREDENTIALS=true
CORS_ALLOWED_HEADERS=Content-Type,x-csrf-token,x-classroom-code,x-teacher-token
```

После изменения env перезапустите backend:

```bash
docker compose --env-file .env.docker -f compose.dev.yml up -d --force-recreate backend
```

### Cookie не отправляются

Проверьте:

- frontend использует `credentials: "include"` или `withCredentials: true`;
- frontend и backend работают на ожидаемых host/port;
- CORS разрешает origin frontend;
- `CORS_CREDENTIALS=true`;
- в production используется HTTPS.

### WebSocket не подключается

Проверьте:

- classroom существует;
- classroom активен;
- сначала получен `/api/ws/token`;
- URL имеет вид `ws://localhost/ws?classroom=ABC123&token=<token>`;
- Nginx location `/ws` проксирует `Upgrade` и `Connection`;
- Redis работает, если используется несколько backend-инстансов.

### AI не отвечает

Проверьте:

```env
AI_MOCK=false
GIGACHAT_CLIENT_ID=...
GIGACHAT_CLIENT_SECRET=...
GIGACHAT_AUTH_URL=https://ngw.devices.sberbank.ru:9443/api/v2/oauth
GIGACHAT_API_URL=https://gigachat.devices.sberbank.ru/api/v1
```

Для проверки без внешнего AI:

```env
AI_MOCK=true
```

После изменения:

```bash
docker compose --env-file .env.docker -f compose.dev.yml up -d --force-recreate backend
```

## Безопасность Docker-конфигурации

Нельзя коммитить:

```text
.env
.env.local
.env.docker
.env.production
*.pem
*.key
```

Можно коммитить:

```text
.env.example
.env.docker.example
```

Если секрет уже попал в git:

1. удалите файл из репозитория;
2. добавьте его в `.gitignore`;
3. перевыпустите скомпрометированные ключи;
4. очистите историю git, если проект публичный;
5. заново задеплойте приложение с новыми секретами.