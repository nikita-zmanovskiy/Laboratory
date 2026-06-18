import { apiRoutes } from "../config/router/apiRoutes"

import { http } from "./http"


/**
 * Инициализирует CSRF сессию запросом к серверу
 *
 * @param sessionId - идентификатор сессии (опционально, передаётся как query параметр)
 */

/**
 * Получает CSRF токен через инициализацию сессии
 *
 * Является обёрткой над ensureCsrfSession для совместимости
 *
 * @param sessionId - идентификатор сессии (опционально)
 */

/**
 * Отзывает CSRF сессию на сервере
 *
 * @param sessionId - идентификатор сессии для отзыва
 */

/**
 * Очищает закэшированный CSRF токен
 *
 * В текущей реализации токен не кэшируется на клиенте - заглушка для будущей реализации
 */

export const ensureCsrfSession = async (sessionId?: string): Promise<void> => {
    await http.get(apiRoutes.csrfToken, {
        params: sessionId ? { session_id: sessionId } : undefined,
    })
}

export const getCsrfToken = async (sessionId?: string): Promise<void> => {
    await ensureCsrfSession(sessionId)
}

export const revokeCsrfSession = async (sessionId: string): Promise<void> => {
    await http.delete(apiRoutes.csrfToken, {
        params: { session_id: sessionId },
    })
}

export const clearCachedToken = (): void => {
    return
}