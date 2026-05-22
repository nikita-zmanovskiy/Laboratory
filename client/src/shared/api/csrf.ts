import { http } from "./http"

/** Создаёт/обновляет сессию; токен сохраняется только в HTTPOnly cookie */
export const ensureCsrfSession = async (sessionId?: string): Promise<void> => {
    await http.get("/api/csrf/token", {
        params: sessionId ? { session_id: sessionId } : undefined,
    })
}

/** @deprecated Используйте ensureCsrfSession — токен недоступен из JS */
export const getCsrfToken = async (sessionId?: string): Promise<void> => {
    await ensureCsrfSession(sessionId)
}

export const revokeCsrfSession = async (sessionId: string): Promise<void> => {
    await http.delete("/api/csrf/token", {
        params: { session_id: sessionId },
    })
}

export const clearCachedToken = () => {
    // Токен в cookie, сброс кэша в JS не требуется
}
