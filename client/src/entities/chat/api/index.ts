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
