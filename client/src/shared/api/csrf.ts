import { http } from "./http"

export const ensureCsrfSession = async (sessionId?: string): Promise<void> => {
    await http.get("/api/csrf/token", {
        params: sessionId ? { session_id: sessionId } : undefined,
    })
}

export const getCsrfToken = async (sessionId?: string): Promise<void> => {
    await ensureCsrfSession(sessionId)
}

export const revokeCsrfSession = async (sessionId: string): Promise<void> => {
    await http.delete("/api/csrf/token", {
        params: { session_id: sessionId },
    })
}

export const clearCachedToken = () => {
    //TODO:доделать
}
