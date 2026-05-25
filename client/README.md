# Laboratory Client

Frontend часть проекта Laboratory, учебного web-приложения для работы с AI-заданиями в формате класса.

Преподаватель создаёт комнату, ученики подключаются по коду класса, отправляют текстовые или графические запросы к AI, а преподаватель видит активность, статистику и историю запросов.

## Стек

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- Axios
- Recharts
- ESLint
- Prettier
- Husky + lint-staged

## Основные возможности

- выбор роли: преподаватель или ученик;
- создание класса преподавателем;
- подключение ученика по коду класса;
- отправка текстовых запросов;
- отправка запросов на генерацию изображения;
- работа с HTTPOnly-cookie для токенов сессии;
- панель преподавателя со статистикой;
- получение событий через WebSocket;
- отображение истории сообщений;
- адаптивный интерфейс.

## Структура

```text
client/
├── app/                    # Next.js app-level файлы
├── pages/                  # страницы приложения
├── public/                 # статические файлы
├── scripts/                # вспомогательные скрипты
├── src/
│   ├── app/                # layout-level слой
│   ├── features/           # пользовательские действия
│   │   ├── chat-messages/
│   │   ├── create-classroom/
│   │   ├── role-select/
│   │   ├── send-message/
│   │   ├── teacher-panel/
│   │   └── toggle-chat-mode/
│   ├── shared/             # переиспользуемые API, UI, lib
│   └── widgets/            # крупные UI-блоки
├── Dockerfile
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Требования

- Node.js 22+
- npm 11+
- запущенный backend Laboratory

## Установка

```bash
cd client
npm install
```

## Переменные окружения

Создайте файл `.env.local` или используйте `.env.example`.

Минимальный набор для локального запуска:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000/ws
```

Для Docker/Nginx, когда backend доступен через тот же домен:

```env
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_BACKEND_URL=
NEXT_PUBLIC_WS_URL=ws://localhost/ws
```

## Запуск в разработке

```bash
npm run dev
```

Приложение будет доступно на:

```text
http://localhost:3000
```

Для запуска dev-сервера с HTTPS:

```bash
npm run devhttps
```

## Проверки качества

```bash
npm run lint
npm run typecheck
npm run build
```

Полная проверка:

```bash
npm run check
```

Автоисправление форматирования и импортов:

```bash
npm run lint:fix
npm run prettier
npm run lint:imports
```

## Production build

```bash
npm run build
npm run start
```

## Docker

Сборка образа:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=/api \
  --build-arg NEXT_PUBLIC_BACKEND_URL= \
  --build-arg NEXT_PUBLIC_WS_URL=ws://localhost/ws \
  -t laboratory-client .
```

Запуск:

```bash
docker run --rm -p 3000:3000 laboratory-client
```

## Работа с backend API

Frontend ожидает, что backend предоставляет:

- `GET /api/csrf/token`
- `POST /api/classrooms`
- `GET /api/classrooms/:code/join`
- `POST /api/classrooms/:code/teacher-session`
- `POST /api/generate`
- `GET /api/stats/:classroomCode`
- `GET /api/logs`
- `GET /api/ws/token`
- `WS /ws`

Подробный контракт описан в `../docs/api-contract.md`.

## Авторизация и сессии

Проект использует HTTPOnly-cookie:

- `lab_student` — токен ученика;
- `lab_teacher` — токен преподавателя.

Frontend не должен хранить эти токены в `localStorage` или `sessionStorage`.

Для обычных API-запросов браузер автоматически отправляет cookie, если запрос выполняется с `credentials: "include"`.

Для WebSocket отдельный токен получается через:

```http
GET /api/ws/token?classroom_code=ABC123
```

Затем подключение выполняется к:

```text
ws://localhost:3000/ws?classroom=ABC123&token=<token>
```

## Типичный пользовательский сценарий

1. Пользователь получает CSRF/session cookie через `/api/csrf/token`.
2. Преподаватель создаёт класс через `/api/classrooms`.
3. Backend возвращает код класса.
4. Ученик подключается через `/api/classrooms/:code/join`.
5. Ученик отправляет запросы через `/api/generate`.
6. Backend логирует запросы и отправляет события через WebSocket.
7. Преподаватель смотрит статистику и историю.

## Рекомендации по разработке

- Не смешивать бизнес-логику и UI-компоненты.
- API-клиенты держать в `shared/api`.
- Переиспользуемые компоненты держать в `shared/ui`.
- Логику отдельных пользовательских действий держать в `features`.
- Большие экраны собирать из `widgets`.
- Не обращаться к backend напрямую из глубоко вложенных компонентов — лучше через слой API.
- Не хранить секреты в frontend-переменных окружения: всё с префиксом `NEXT_PUBLIC_` попадает в клиентский bundle.

## Частые проблемы

### CORS или cookie не отправляются

Проверьте:

- backend `CORS_ORIGINS`;
- `CORS_CREDENTIALS=true`;
- axios/fetch использует `credentials: "include"` или `withCredentials: true`;
- frontend и backend используют совместимые домены и протоколы.

### WebSocket не подключается

Проверьте:

- classroom code существует;
- класс активен и не истёк;
- сначала вызван `/api/ws/token`;
- `NEXT_PUBLIC_WS_URL` указывает на `/ws`;
- при Nginx настроен upgrade для WebSocket.

### AI не отвечает

Проверьте backend-переменные:

- `AI_MOCK`;
- `GIGACHAT_CLIENT_ID`;
- `GIGACHAT_CLIENT_SECRET`;
- `GIGACHAT_AUTH_URL`;
- `GIGACHAT_API_URL`.