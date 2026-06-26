import { ensureCsrfSession } from "@/shared/api/csrf"
import { http } from "@/shared/api/http"
import { apiRoutes } from "@/shared/config/router/apiRoutes"

import type { GenerateMode, GenerateRequestDto, GenerateResponseDto } from "./dto"


/**
 * Создаёт тело запроса для генерации
 *
 * Добавляет image в тело только если передан imageBase64
 *
 * @param mode - режим генерации (text или image)
 * @param prompt - текст запроса
 * @param sessionId - идентификатор сессии
 * @param imageBase64 - base64 строка изображения (опционально)
 * @returns объект GenerateRequestDto
 */

/**
 * Отправляет запрос на генерацию текста
 *
 * По умолчанию инициализирует CSRF сессию перед запросом
 * Пропускает инициализацию если skipEnsureSession = true
 *
 * @param prompt - текст запроса
 * @param sessionId - идентификатор сессии
 * @param classroomCode - код класса (передаётся в заголовке x-classroom-code)
 * @param imageBase64 - base64 изображения для vision запросов (опционально)
 * @param skipEnsureSession - пропустить инициализацию CSRF сессии
 * @returns ответ сервера с данными генерации
 */

/**
 * Отправляет запрос на генерацию изображения
 *
 * По умолчанию инициализирует CSRF сессию перед запросом
 * Пропускает инициализацию если skipEnsureSession = true
 *
 * @param prompt - текст запроса
 * @param imageBase64 - base64 изображения для img2img запросов
 * @param sessionId - идентификатор сессии
 * @param classroomCode - код класса (передаётся в заголовке x-classroom-code)
 * @param skipEnsureSession - пропустить инициализацию CSRF сессии
 * @returns ответ сервера с данными генерации
 */

// Review 26.06.2026 - если функция вспомогательная, то ее лучше положить в lib
const createGenerateRequest = (
    mode: GenerateMode,
    prompt: string,
    sessionId: string,
    imageBase64?: string | null
): GenerateRequestDto => {
    const body: GenerateRequestDto = { mode, prompt, session_id: sessionId }

    if (imageBase64) {
        body.image = imageBase64
    }

    return body
}

// Review 26.06.2026 - Хорошее решение 👍
// Небольшие улучшения:
// наименования функций в слое api должны быть более "транспортным" - лучше использовать префиксы в соответствии с типом запроса: send*, put*, patch*, delete*. вместо get* - лучше  использовать, fetch.
// fetch - работа с асинхроннностью + запрос на сервер, load (обычно используется для того, что бы "загрузить" данные от api до model (стора)), get - работа с локальными данными в синхронном режиме.

// get: Например getUserById - в этом случае у нас уже есть список всех пользователей в системе и мы локально проходим по нему.
// load: loadUserById - тут понимаем, что функция находится в сторе и ожидаем что она положит данные в стор либо возвращает их как промис (может быть какая-то бизнес-логика)
// fetch: fetchUserById - тут понимаем, что функция обращается к серверу напрямую, никакой бизнес-логики в ней нет
export const generateText = async (
    prompt: string,
    sessionId: string,
    classroomCode: string,
    imageBase64?: string | null,
    skipEnsureSession = false
): Promise<GenerateResponseDto> => {
    if (!skipEnsureSession) {
        await ensureCsrfSession(sessionId)
    }

    const body = createGenerateRequest("text", prompt, sessionId, imageBase64)

    const response = await http.post<GenerateResponseDto>(apiRoutes.generate, body, {
        headers: {
            "x-classroom-code": classroomCode,
        },
    })

    return response.data
}

// Review 26.06.2026 - параметры для запроса (request), можно так же вынести отдельным файлом в entities/chat/api/request.ts.
// Уменьшит кол-во, повысится читаемость кода.
export const generateImage = async (
    prompt: string,
    imageBase64: string | null,
    sessionId: string,
    classroomCode: string,
    skipEnsureSession = false
): Promise<GenerateResponseDto> => {
    if (!skipEnsureSession) {
        await ensureCsrfSession(sessionId)
    }

    const body = createGenerateRequest("image", prompt, sessionId, imageBase64)

    const response = await http.post<GenerateResponseDto>(apiRoutes.generate, body, {
        headers: {
            "x-classroom-code": classroomCode,
        },
    })

    return response.data
}
