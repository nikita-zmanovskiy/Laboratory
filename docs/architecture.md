# Architecture

Laboratory учебное web-приложение для проведения AI-занятий в формате класса.

Преподаватель создаёт класс, ученики подключаются по короткому коду, отправляют запросы к AI, а backend сохраняет историю, считает статистику и рассылает события преподавателю через WebSocket.

## Цели архитектуры

- отделить frontend от backend;
- хранить историю запросов и статистику в PostgreSQL;
- поддержать realtime-обновления через WebSocket;
- защитить действия с помощью session-token cookie;
- иметь возможность запускать проект локально и в Docker;
- оставить путь к горизонтальному масштабированию через Redis Pub/Sub.

## Общая схема

```text
┌─────────────┐
│   Browser   │
│ Next.js UI  │
└──────┬──────┘
       │ HTTP / WebSocket
       ▼
┌─────────────┐
│    Nginx    │
│ static/proxy│
└──────┬──────┘
       │
       ├──────────────► client container
       │
       └──────────────► backend container
                         │
                         ├────────► PostgreSQL
                         │          classrooms, request_logs
                         │
                         ├────────► Redis
                         │          WebSocket Pub/Sub
                         │
                         └────────► GigaChat API
                                    AI generation
```

## Компоненты

### Client

`client` - интерфейс на Next.js.

Отвечает за:

- выбор роли;
- создание класса;
- подключение по коду;
- отправку сообщений;
- отображение ответов AI;
- панель преподавателя;
- графики и статистику;
- WebSocket-подписку на события класса.

Frontend не хранит секреты и не должен класть токены в `localStorage`.

### Backend

`backend` - Express API на TypeScript.

Отвечает за:

- выдачу session-token cookie;
- создание и управление классами;
- проверку доступа;
- проксирование запросов к AI;
- аудит запросов;
- статистику;
- экспорт логов;
- WebSocket-события;
- Swagger-документацию.

### PostgreSQL

Хранит основные данные:

- `classrooms` - классы, коды, время жизни, активность, grade;
- `request_logs` - история запросов, статусы, токены, время ответа.

### Redis

Используется для WebSocket Pub/Sub.

Если запущено несколько backend-инстансов, событие публикуется в Redis и доставляется локальным WebSocket-клиентам каждого инстанса.

Без Redis realtime работает только внутри одного backend-инстанса.

### GigaChat

Внешний AI-провайдер.

Backend умеет работать в двух режимах:

- `AI_MOCK=true` - mock-ответы для разработки;
- `AI_MOCK=false` - реальные запросы к GigaChat.

В production mock-режим лучше запрещать.

## Backend layers

```text
routes
  ↓
controllers
  ↓
use-cases / services
  ↓
repositories
  ↓
database
```

### routes

Файлы маршрутов подключают middleware и контроллеры.

Примеры:

- `classroom.routes.ts`
- `generate.routes.ts`
- `logs.routes.ts`
- `stats.routes.ts`
- `csrf.routes.ts`
- `ws.routes.ts`

### controllers

Контроллеры читают `req`, вызывают сервисы/use-case и формируют HTTP-ответ.

Контроллеры не должны содержать тяжёлую бизнес-логику.

### use-cases

Use-case слой описывает пользовательские сценарии.

Пример: `GenerateUseCase`:

1. проверяет класс;
2. нормализует изображение;
3. вызывает AI;
4. считает токены;
5. пишет audit log.

### services

Сервисы отвечают за инфраструктурную или доменную логику:

- `CsrfService`;
- `ClassroomService`;
- `LogService`;
- `WebSocketService`;
- `RateLimitService`;
- `GigaChatService`.

### repositories

Репозитории изолируют SQL-запросы.

Пример:

- `ClassroomRepository`;
- `LogRepository`.

Репозитории не должны знать про HTTP, cookie или WebSocket.

## Основной flow: создание класса

```text
Browser
  │
  │ GET /api/csrf/token
  ▼
Backend создаёт student token и кладёт его в lab_student cookie
  │
  │ POST /api/classrooms
  ▼
Backend создаёт classroom
  │
  ├─ сохраняет token создателя как teacher_token
  ├─ кладёт lab_teacher cookie
  └─ возвращает код класса
```

## Основной flow: подключение ученика

```text
Browser
  │
  │ GET /api/classrooms/:code/join?student_id=1
  ▼
Backend
  │
  ├─ проверяет classroom
  ├─ создаёт token до expires_at класса
  ├─ кладёт lab_student cookie
  └─ возвращает expires_at
```

## Основной flow: генерация AI-ответа

```text
Browser
  │
  │ POST /api/generate
  │ cookie: lab_student
  │ body: mode, prompt, classroom_code, session_id
  ▼
csrfMiddleware
  │
  ├─ проверяет student token
  └─ проверяет session_id при наличии
  ▼
classroomContextMiddleware
  │
  ├─ проверяет код класса
  ├─ проверяет active/expires_at
  └─ добавляет classroom_id в body
  ▼
GenerateUseCase
  │
  ├─ вызывает GigaChatService
  ├─ считает токены
  ├─ пишет request_logs
  └─ публикует WebSocket-событие
```

## Realtime flow

```text
Teacher browser
  │
  │ GET /api/ws/token?classroom_code=ABC123
  ▼
Backend возвращает token + role
  │
  │ WS /ws?classroom=ABC123&token=<token>
  ▼
WebSocketService проверяет token
  │
  └─ подписывает клиента на classroom ABC123
```

Когда появляется новый лог:

```text
GenerateUseCase / LogService
  │
  ▼
WebSocketService.broadcastLog
  │
  ▼
Redis Pub/Sub
  │
  ▼
Все backend-инстансы
  │
  ▼
Локальные WebSocket-клиенты нужного classroom
```

## Авторизация

Используются HTTPOnly-cookie:

| Cookie | Назначение |
|---|---|
| `lab_student` | ученик или обычная session-cookie |
| `lab_teacher` | преподаватель, создавший classroom |

Для teacher-only действий backend сверяет teacher token с `teacher_token`, сохранённым у класса.

Teacher-only endpoints:

- `POST /api/classrooms/:code/deactivate`
- `POST /api/classrooms/:code/extend`
- `POST /api/classrooms/:code/teacher-session`
- `GET /api/stats/:classroomCode`
- `GET /api/logs`
- `GET /api/logs/export`

## Ошибки

Единый формат:

```json
{
  "error": "Описание ошибки"
}
```

Для rate limit:

```json
{
  "error": "Too many requests",
  "retry_after": 3000
}
```

## Безопасность

Используются:

- Helmet;
- CORS allow-list;
- HTTPOnly-cookie;
- SameSite cookie policy;
- CSRF/session-token middleware;
- teacher-token проверка;
- rate limit;
- classroom expiration;
- validation через Zod;
- ограничение размера JSON body.

Production-требования:

- `NODE_ENV=production`;
- `CSRF_SECRET` задан и не короче 32 символов;
- `DATABASE_URL` задан;
- `CORS_ORIGINS` задан явно;
- `AI_MOCK=false`;
- `GIGACHAT_CLIENT_ID` и `GIGACHAT_CLIENT_SECRET` заданы;
- HTTPS включён на внешнем периметре;
- cookie отправляются только по HTTPS;
- секреты не лежат в репозитории.

## Масштабирование

### Один backend-инстанс

Подходит для локального запуска и демо.

WebSocket-клиенты находятся в памяти одного процесса.

### Несколько backend-инстансов

Нужно:

- Redis для Pub/Sub;
- Nginx upstream с несколькими backend;
- sticky sessions или корректная WebSocket routing-стратегия;
- общий PostgreSQL;
- единые production-переменные окружения.

События доставляются так:

```text
backend-1 publishes event → Redis → backend-2/backend-3 receive event → local clients
```

## Ограничения текущей архитектуры

- session-token store находится в памяти backend-процесса;
- при перезапуске backend активные token-сессии теряются;
- для полноценного multi-instance режима лучше вынести token store в Redis;
- WebSocket требует отдельной настройки reverse proxy;
- AI-провайдер является внешней точкой отказа;
- статистика строится SQL-запросами на лету.

## Что можно улучшить дальше

1. Перенести CSRF/session token store в Redis.
2. Добавить refresh/rotation teacher token.
3. Добавить миграции индексов для `request_logs`.
4. Добавить OpenAPI-спеку как источник истины.
5. Добавить e2e-тесты полного teacher/student flow.
6. Добавить structured audit events.
7. Добавить graceful degradation при недоступности GigaChat.
8. Добавить отдельный `docs/deployment.md`.