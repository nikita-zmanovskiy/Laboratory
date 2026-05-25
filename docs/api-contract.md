# API Contract

Backend возвращает данные в JSON-формате.

Базовый URL для локальной разработки:

```text
http://localhost:3000
```

Префикс API:

```text
/api
```

Swagger UI:

```http
GET /api-docs
```

OpenAPI JSON:

```http
GET /api-docs.json
```

## Общие правила

### Content-Type

Для JSON-запросов:

```http
Content-Type: application/json
```

### Credentials

Frontend должен отправлять cookie:

```ts
fetch(url, {
  credentials: 'include',
})
```

или для Axios:

```ts
axios.create({
  withCredentials: true,
})
```

### Ошибки

Единый формат ошибки:

```json
{
  "error": "Описание ошибки"
}
```

Возможны дополнительные поля:

```json
{
  "error": "Too many requests",
  "retry_after": 3000
}
```

### Cookie

| Cookie | Описание |
|---|---|
| `lab_student` | session token ученика |
| `lab_teacher` | token преподавателя |

Cookie выставляются backend-ом как HTTPOnly.

### Заголовки

| Header | Где используется |
|---|---|
| `x-csrf-token` | fallback для student token |
| `x-teacher-token` | fallback для teacher token |
| `x-classroom-code` | код класса для `/api/generate` |

## Health

### `GET /health`

Проверяет состояние API и базы данных.

#### Response 200

```json
{
  "status": "ok",
  "timestamp": "2026-01-01T12:00:00.000Z",
  "moscow_time": "2026-01-01T15:00:00.000+03:00",
  "uptime": 120,
  "services": {
    "api": "healthy",
    "database": "healthy"
  }
}
```

#### Response 503

```json
{
  "status": "degraded",
  "timestamp": "2026-01-01T12:00:00.000Z",
  "moscow_time": "2026-01-01T15:00:00.000+03:00",
  "uptime": 120,
  "services": {
    "api": "healthy",
    "database": "unhealthy"
  }
}
```

## CSRF / Session

### `GET /api/csrf/token`

Создаёт или возвращает session token и кладёт его в `lab_student` cookie.

#### Query

| Name | Type | Required | Description |
|---|---|---:|---|
| `session_id` | string | no | внешний id сессии |

#### Response 200

```json
{
  "session_id": "student-1",
  "is_new": true,
  "expires_at": "2026-01-02T12:00:00.000Z",
  "message": "Session cookie set. Token is stored in HTTPOnly cookie."
}
```

### `POST /api/csrf/refresh`

Обновляет session cookie для существующей сессии.

#### Query

| Name | Type | Required |
|---|---|---:|
| `session_id` | string | yes |

#### Response 200

```json
{
  "session_id": "student-1",
  "message": "Session cookie refreshed. Rate limit reset."
}
```

#### Response 400

```json
{
  "error": "session_id is required to refresh token"
}
```

### `DELETE /api/csrf/token`

Удаляет session token и очищает `lab_student`.

#### Query

| Name | Type | Required |
|---|---|---:|
| `session_id` | string | yes |

#### Response 200

```json
{
  "message": "Token revoked and session cookie cleared",
  "session_id": "student-1"
}
```

### `GET /api/csrf/status`

Возвращает состояние rate limit для текущего token/IP.

#### Response 200

```json
{
  "requests_made": 2,
  "requests_remaining": 8,
  "limit": 10,
  "window_seconds": 3,
  "window_remaining_ms": 1500,
  "blocked": false
}
```

## Classrooms

### `POST /api/classrooms`

Создаёт classroom.

Требует `lab_student` cookie. Token создателя сохраняется как teacher token, после чего backend выставляет `lab_teacher`.

#### Request body

```json
{
  "title": "Урок физики",
  "expires_in_minutes": 90,
  "grade": 11
}
```

#### Validation

| Field | Type | Required | Rules |
|---|---|---:|---|
| `title` | string | yes | 1–100 символов |
| `expires_in_minutes` | number | no | 1–10080 |
| `grade` | number | no | 5–11 |

#### Response 201

```json
{
  "id": "7f9dd3a5-9f2d-48d6-9c8a-3fd83e76f001",
  "code": "ABC123",
  "title": "Урок физики",
  "is_active": true,
  "expires_at": "2026-01-01T13:30:00.000Z",
  "grade": 11,
  "expires_in_minutes": 90,
  "message": "Students join via GET /api/classrooms/ABC123/join?student_id=1"
}
```

#### Response 403

```json
{
  "error": "Authentication required"
}
```

### `GET /api/classrooms/:code/join`

Подключает ученика к classroom и выставляет `lab_student`.

#### Params

| Name | Type | Required |
|---|---|---:|
| `code` | string | yes |

#### Query

| Name | Type | Required |
|---|---|---:|
| `student_id` | string | no |

#### Response 200

```json
{
  "classroom_code": "ABC123",
  "student_id": "student-1",
  "expires_at": "2026-01-01T13:30:00.000Z",
  "message": "Joined. Session stored in HTTPOnly cookie."
}
```

#### Response 404

```json
{
  "error": "Classroom not found"
}
```

#### Response 410

```json
{
  "error": "Classroom has expired"
}
```

### `POST /api/classrooms/:code/teacher-session`

Создаёт student-preview session для преподавателя.

Требует teacher-доступ.

#### Response 200

```json
{
  "classroom_code": "ABC123",
  "session_id": "teacher-preview-ABC123",
  "expires_at": "2026-01-01T13:30:00.000Z",
  "message": "Teacher preview session for chat"
}
```

### `POST /api/classrooms/:code/extend`

Продлевает classroom.

Требует teacher-доступ.

#### Request body

```json
{
  "additional_minutes": 30
}
```

#### Validation

| Field | Type | Required | Rules |
|---|---|---:|---|
| `additional_minutes` | number | yes | 1–120 |

#### Response 200

```json
{
  "code": "ABC123",
  "old_expires_at": "2026-01-01T13:30:00.000Z",
  "new_expires_at": "2026-01-01T14:00:00.000Z",
  "added_minutes": 30,
  "message": "Classroom extended by 30 minutes. Tokens also extended."
}
```

### `POST /api/classrooms/:code/deactivate`

Деактивирует classroom.

Требует teacher-доступ.

#### Response 200

```json
{
  "message": "Classroom deactivated",
  "code": "ABC123",
  "is_active": false
}
```

## Generate

### `POST /api/generate`

Отправляет запрос к AI.

Требует `lab_student` cookie.

#### Headers

```http
x-classroom-code: ABC123
```

`classroom_code` также можно передать в body.

#### Request body: text

```json
{
  "mode": "text",
  "prompt": "Объясни закон Ома простыми словами",
  "classroom_code": "ABC123",
  "session_id": "student-1"
}
```

#### Request body: image

```json
{
  "mode": "image",
  "prompt": "Нарисуй схему электрической цепи",
  "classroom_code": "ABC123",
  "session_id": "student-1"
}
```

#### Request body: image input

```json
{
  "mode": "text",
  "prompt": "Проанализируй изображение",
  "classroom_code": "ABC123",
  "session_id": "student-1",
  "image": "data:image/png;base64,..."
}
```

#### Validation

| Field | Type | Required | Rules |
|---|---|---:|---|
| `mode` | string | yes | `text` или `image` |
| `prompt` | string | yes | 1–1000 символов |
| `classroom_code` | string | yes | 6 символов, A-Z/0-9 |
| `session_id` | string | no | непустая строка |
| `image` | string | no | base64/data URL |

#### Response 200

Форма зависит от presenter-а, но обычно содержит результат генерации и usage.

```json
{
  "mode": "text",
  "text": "Закон Ома говорит, что сила тока зависит от напряжения и сопротивления...",
  "blocked": false,
  "finish_reason": "stop",
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 60,
    "total_tokens": 80
  }
}
```

#### Response 400

```json
{
  "error": "Prompt cannot be empty"
}
```

#### Response 403

```json
{
  "error": "CSRF token required"
}
```

#### Response 410

```json
{
  "error": "Classroom has expired",
  "expired_at": "2026-01-01T13:30:00.000Z"
}
```

### `GET /api/generate/images/:imageId`

Скачивает изображение из AI-провайдера.

#### Response 200

```http
Content-Type: image/jpeg
Cache-Control: public, max-age=3600
```

Body: binary image.

## Stats

### `GET /api/stats/:classroomCode`

Возвращает статистику classroom.

Требует teacher-доступ.

#### Response 200

```json
{
  "classroom_code": "ABC123",
  "stats": {
    "total_requests": 10,
    "text_requests": 7,
    "image_requests": 3,
    "errors": 1,
    "avg_response_time": 1200,
    "active_sessions": 4,
    "first_request": "2026-01-01T12:00:00.000Z",
    "last_request": "2026-01-01T12:30:00.000Z",
    "error_rate": "10.0%",
    "expires_at": "2026-01-01T13:30:00.000Z",
    "top_students": [
      {
        "session_id": "student-1",
        "requests": 5,
        "avg_tokens": 120
      }
    ],
    "charts": {
      "tokens_over_time": [
        {
          "timestamp": "2026-01-01T12:00:00.000Z",
          "input": 20,
          "output": 80
        }
      ],
      "requests_per_minute": [
        {
          "minute": "12:00",
          "count": 2
        }
      ],
      "mode_distribution": {
        "text": 7,
        "image": 3
      },
      "avg_tokens_per_request": 100,
      "avg_response_time": 1200,
      "error_rate": 10,
      "total_requests": 10,
      "active_students": 4
    }
  },
  "expires_at": "2026-01-01T13:30:00.000Z"
}
```

#### Response 200: no data

```json
{
  "classroom_code": "ABC123",
  "message": "No data yet",
  "stats": {
    "total_requests": 0,
    "text_requests": 0,
    "image_requests": 0,
    "errors": 0,
    "avg_response_time": 0,
    "active_sessions": 0,
    "top_students": [],
    "charts": {
      "tokens_over_time": [],
      "requests_per_minute": [],
      "mode_distribution": {
        "text": 0,
        "image": 0
      },
      "avg_tokens_per_request": 0
    }
  }
}
```

### `GET /api/stats`

Возвращает глобальную статистику.

Требует valid student token.

#### Response 200

```json
{
  "global": {
    "total_classrooms": 12,
    "active_classrooms": 3,
    "total_requests": 100,
    "total_sessions": 25
  }
}
```

## Logs

### `GET /api/logs`

Возвращает логи classroom с пагинацией.

Требует teacher-доступ.

#### Query

| Name | Type | Required | Description |
|---|---|---:|---|
| `classroom_code` | string | yes | код класса |
| `page` | number | no | страница, по умолчанию 1 |
| `limit` | number | no | размер страницы, по умолчанию 20 |
| `search` | string | no | поиск |
| `mode` | string | no | `text` или `image` |
| `status` | string | no | HTTP status |
| `image_attached` | string | no | фильтр по изображению |
| `sort` | string | no | сортировка |

#### Response 200

```json
{
  "classroom_code": "ABC123",
  "count": 1,
  "total": 10,
  "page": 1,
  "total_pages": 10,
  "limit": 1,
  "logs": [
    {
      "id": 1,
      "timestamp": "2026-01-01T12:00:00.000Z",
      "classroom_id": "7f9dd3a5-9f2d-48d6-9c8a-3fd83e76f001",
      "session_id": "student-1",
      "mode": "text",
      "prompt_hash": "abc123",
      "image_attached": false,
      "tokens_input": 20,
      "tokens_output": 80,
      "status": 200,
      "response_time_ms": 1200,
      "tokens_is_approximate": false,
      "error_message": null
    }
  ]
}
```

### `GET /api/logs/export`

Экспортирует логи classroom в CSV.

Требует teacher-доступ.

#### Query

| Name | Type | Required |
|---|---|---:|
| `classroom_code` | string | yes |

#### Response 200

```http
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename=logs-ABC123-1760000000000.csv
```

CSV columns:

```text
Timestamp,Session ID,Mode,Prompt Hash,Image Attached,Tokens Input,Tokens Output,Tokens Approximate,Status,Response Time (ms),Error Message
```

## WebSocket

### `GET /api/ws/token`

Возвращает token для подключения к WebSocket.

Требует student или teacher cookie.

#### Query

| Name | Type | Required |
|---|---|---:|
| `classroom_code` | string | yes |

#### Response 200

```json
{
  "token": "64-character-hex-token",
  "role": "teacher"
}
```

или:

```json
{
  "token": "64-character-hex-token",
  "role": "student"
}
```

#### Response 403

```json
{
  "error": "Access denied for this classroom"
}
```

### `WS /ws`

WebSocket endpoint.

#### Query

| Name | Type | Required |
|---|---|---:|
| `classroom` | string | yes |
| `token` | string | yes |

#### Example

```text
ws://localhost:3000/ws?classroom=ABC123&token=<token>
```

#### Connected event

```json
{
  "type": "connected",
  "clientId": "k3p9w7x2",
  "classroomCode": "ABC123",
  "role": "teacher",
  "message": "connected to classroom stream"
}
```

#### New log event

```json
{
  "type": "new_log",
  "classroom_code": "ABC123",
  "log": {
    "id": 1,
    "session_id": "student-1",
    "mode": "text",
    "status": 200
  },
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

#### Classroom closed event

```json
{
  "type": "classroom_closed",
  "classroom_code": "ABC123",
  "reason": "expired",
  "message": "Время урока истекло",
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

#### Classroom extended event

```json
{
  "type": "classroom_extended",
  "classroom_code": "ABC123",
  "new_expires_at": "2026-01-01T14:00:00.000Z",
  "message": "Время урока продлено",
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

## Status codes

| Code | Meaning |
|---:|---|
| 200 | успешный запрос |
| 201 | сущность создана |
| 400 | ошибка валидации или обязательного параметра |
| 403 | нет token/нет доступа |
| 404 | сущность не найдена |
| 410 | classroom истёк или неактивен |
| 429 | rate limit |
| 500 | внутренняя ошибка |
| 503 | degraded health status |

## Минимальный сценарий через curl

```bash
curl -i -c cookies.txt "http://localhost:3000/api/csrf/token?session_id=teacher-1"

curl -i -b cookies.txt -c cookies.txt \
  -X POST "http://localhost:3000/api/classrooms" \
  -H "Content-Type: application/json" \
  -d '{"title":"Урок физики","expires_in_minutes":90,"grade":11}'

curl -i -b cookies.txt -c cookies.txt \
  "http://localhost:3000/api/classrooms/ABC123/join?student_id=student-1"

curl -i -b cookies.txt \
  -X POST "http://localhost:3000/api/generate" \
  -H "Content-Type: application/json" \
  -H "x-classroom-code: ABC123" \
  -d '{"mode":"text","prompt":"Объясни закон Ома","classroom_code":"ABC123","session_id":"student-1"}'
```