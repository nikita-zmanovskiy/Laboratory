# Backend

Backend отвечает за API, работу с классами, генерацию через GigaChat, логи, статистику и WebSocket-уведомления.

В production backend запускается только внутри Docker. Напрямую порт backend наружу не открывается. Снаружи к нему обращается Nginx.

## Что есть внутри

Основные части:

- `src/app.ts` подключает middleware и маршруты
- `src/server.ts` запускает HTTP-сервер и WebSocket
- `src/config` хранит настройки окружения
- `src/routes` описывает HTTP-маршруты
- `src/controllers` принимает запросы
- `src/services` содержит бизнес-логику
- `src/repositories` работает с PostgreSQL
- `src/db/migrations` содержит SQL-миграции

## Переменные окружения

Для Docker используется файл `.env.production` в корне проекта.

Пример лежит тут:

```bash
.env.production.example
```