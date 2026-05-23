# Запуск «Лаборатория ИИ» в Docker (Windows)

Полный стек в контейнерах:

| Сервис | Назначение | Порт на ПК |
|--------|------------|------------|
| **PostgreSQL** | БД, логи, классы | 5432 |
| **Redis** | Pub/Sub для WebSocket при нескольких инстансах | 6379 |
| **Backend** | API + WebSocket (Node.js) | 3000 (прямой доступ) |
| **Nginx** | Прокси `/api`, `/ws`, rate limit | **80** |
| **Client** (опционально) | Next.js фронт | 3001 |

---

## 0. Ошибка «cannot find dockerDesktopLinuxEngine»

Сообщение из терминала значит: **Docker Desktop не запущен** или не установлен.

1. Установите [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/).
2. Запустите **Docker Desktop** из меню Пуск.
3. Дождитесь статуса **Engine running** (зелёный индикатор).
4. В настройках включите **WSL 2** (рекомендуется на Windows 10/11).
5. Проверьте в PowerShell:

```powershell
docker version
docker compose version
```

Обе команды должны отработать без ошибок. После этого снова:

```powershell
cd C:\Users\ZMANOVSKIY\Desktop\Laboratory\backend
docker compose up -d redis
```

---

## 1. Подготовка секретов (GigaChat)

В папке `backend` создайте файл **`.env.docker`** (он не попадает в git):

```powershell
cd C:\Users\ZMANOVSKIY\Desktop\Laboratory\backend
copy .env.docker.example .env.docker
notepad .env.docker
```

Заполните минимум:

```env
GIGACHAT_CLIENT_ID=019e221d-....   # из вашего .env
GIGACHAT_CLIENT_SECRET=MDE5ZTIy... # из вашего .env
AI_MOCK=false
CSRF_SECRET=любая_длинная_случайная_строка_32_символа_и_больше
```

Остальное в `.env.docker.example` можно оставить по умолчанию.

---

## 2. Запуск backend + PostgreSQL + Redis + Nginx

```powershell
cd C:\Users\ZMANOVSKIY\Desktop\Laboratory\backend
docker compose --env-file .env.docker up --build -d
```

Первый запуск 5–15 минут (сборка образов).

Проверка:

```powershell
docker compose ps
curl http://localhost/health
```

Ожидается JSON со `"status":"ok"`.

Логи:

```powershell
docker compose logs -f backend
```

Остановка:

```powershell
docker compose down
```

С удалением данных БД:

```powershell
docker compose down -v
```

---

## 3. Запуск фронтенда (рекомендуется локально)

Фронт удобнее запускать **на хосте** (быстрее hot-reload), API и WS — через Nginx на порту 80.

```powershell
cd C:\Users\ZMANOVSKIY\Desktop\Laboratory\client
```

Создайте или отредактируйте **`.env.local`**:

```env
NEXT_PUBLIC_API_URL=
BACKEND_URL=http://localhost
NEXT_PUBLIC_BACKEND_URL=http://localhost
NEXT_PUBLIC_WS_URL=ws://localhost/ws
```

```powershell
pnpm install
pnpm dev
```

Откройте в браузере: **http://localhost:3001**

- Запросы `/api/*` → Next proxy → `http://localhost` (nginx) → backend  
- WebSocket → `ws://localhost/ws?classroom=...&token=...`

---

## 4. Вариант: фронт тоже в Docker

```powershell
cd C:\Users\ZMANOVSKIY\Desktop\Laboratory\backend
docker compose --profile full --env-file .env.docker up --build -d
```

Сайт: **http://localhost:3001**

---

## 5. Схема запросов

```
Браузер :3001 (Next.js)
    │  /api/*  ──►  nginx :80  ──►  backend :3000
    │  ws://localhost/ws  ──►  nginx :80  ──►  backend :3000
    │
backend ──► PostgreSQL (db:5432)
backend ──► Redis (redis:6379) — fan-out WebSocket
backend ──► GigaChat API (интернет)
```

---

## 6. Несколько инстансов backend (production)

1. Один Redis (`REDIS_URL` одинаковый у всех).
2. Несколько реплик `backend` за nginx с **sticky sessions** для WebSocket.
3. В `docker-compose` можно масштабировать:

```powershell
docker compose --env-file .env.docker up -d --scale backend=3
```

Для этого nginx должен проксировать на все реплики (отдельная конфигурация upstream). Для учебного MVP достаточно **одного** backend + Redis.

---

## 7. Частые проблемы

| Проблема | Решение |
|---------|---------|
| `npm ci` — Missing `@emnapi/core`, `yaml` из lock file | Lockfile собран на Windows (npm 11), а в Docker — npm 10. В `backend` выполните: `docker run --rm -v "${PWD}:/app" -w /app node:22-alpine npm install`, затем снова `docker compose up --build` |
| `dockerDesktopLinuxEngine` не найден | Запустить Docker Desktop |
| Порт 80 занят | Остановить IIS/Skype или в `docker-compose.yml` сменить `"80:80"` на `"8080:80"` и в `.env.local` клиента использовать `http://localhost:8080` |
| GigaChat 403/503 | Проверить `GIGACHAT_*` в `.env.docker`, `AI_MOCK=false` |
| WebSocket «Подключение...» | `NEXT_PUBLIC_WS_URL=ws://localhost/ws`, nginx и backend запущены |
| CORS ошибка | В `.env.docker`: `CORS_ORIGINS=http://localhost:3001,...` |
| Пустые ответы AI | `AI_MOCK` должен быть `false` |

---

## 8. Полезные команды

```powershell
# Пересобрать только backend после изменений кода
docker compose --env-file .env.docker up -d --build backend

# Зайти в контейнер БД
docker compose exec db psql -U ai_lab_user -d ai_lab

# Redis ping
docker compose exec redis redis-cli ping
```
