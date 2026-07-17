# Laboratory

Laboratory это учебное web-приложение для работы с AI-заданиями в формате класса.

Преподаватель создаёт комнату, ученики подключаются по коду и отправляют запросы к AI. Backend сохраняет историю, проверяет доступы и рассылает обновления через WebSocket.

## Добавлен новый бекенд на nest + prisma

Инструкция по запуску в docker будет позже

TODO: сделать инструкцию запуска в докер для нового сервера 

## Что внутри

Проект состоит из четырёх частей:

- client: интерфейс на Next.js
- backend: API, WebSocket и работа с базой
- postgres: хранение классов, логов и истории
- redis: Pub/Sub для WebSocket

Внешний вход в приложение идёт через nginx. Он отдаёт фронтенд, проксирует API и WebSocket на backend.

## Запуск через Docker

Скопируйте пример переменных окружения:

```bash
cp .env.production.example .env.production
```



запуск проекта: 
```bash 
docker compose --env-file .env.production build --no-cache
```

```bash
docker compose --env-file .env.production up --build -d
```

проект доступен по адресу http://localhost

остановить проект и удалить: docker compose --env-file .env.production down -v


## Чтобы запустить локально (без докера) /backend

для запуска npm i

npm run dev

нужно скачать PostgreSQL 15+ (если нет)

создать базу данных в sql с помощью запроса через pgAdmin 4:

Откройте pgAdmin 4 и подключитесь к серверу: Запусте pgAdmin 4 В левой панели раскройте Servers - PostgreSQL Введите пароль (тот что задали при установке PostgreSQL)

Создайте базу данных: Правый клик на Databases, Create, Database Введите имя: ai_lab Нажмите Save

Создайте пользователя: Правый клик на Login/Group Roles потом Create потом Login/Group Role Вкладка General: Name: ai_lab_user Вкладка Definition: Password: admin Вкладка Privileges: Поставьте галочку Can login? = Yes Нажмите Save

Выдайте права пользователю на базу: Правый клик на базе ai_lab потом Properties Вкладка Security Нажмите + добавить Выберите ai_lab_user в поле Grantee В поле Privileges поставьте ALL Нажмите Save

в корень проекта нужно добавить файл .env в котором такие значения 
## env

GigaChat API (получить на https://developers.sber.ru/) GIGACHAT_CLIENT_ID=ваш_client_id GIGACHAT_CLIENT_SECRET=ваш_client_secret GIGACHAT_AUTH_URL=https://ngw.devices.sberbank.ru:9443/api/v2/oauth GIGACHAT_API_URL=https://gigachat.devices.sberbank.ru/api/v1

PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://ai_lab_user:admin@localhost:5432/ai_lab
PGSSL=false

KANDINSKY_API_URL=https://api.fusionbrain.ai

GIGACHAT_AUTH_URL=https://ngw.devices.sberbank.ru:9443/api/v2/oauth
GIGACHAT_API_URL=https://gigachat.devices.sberbank.ru/api/v1

AI_MOCK=false #менять на false и удалять node_env при npm run dev
#NODE_ENV=test 

CORS_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_METHODS=GET,POST,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,x-csrf-token,x-classroom-code,x-teacher-token
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400

CSP_ENABLED=false
CSP_UPGRADE_INSECURE_REQUESTS=false

