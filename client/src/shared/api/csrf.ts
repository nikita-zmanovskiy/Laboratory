import { http } from "./http"
import { apiRoutes } from "@/shared/config/apiRoutes"

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