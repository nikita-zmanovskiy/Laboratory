import { http } from "./http"

export interface WebSocketAuthResponse {
    token: string
    role: "teacher" | "student"
}

/** Токен для подключения к /ws (cookie httpOnly → JSON через API). */
export const getWebSocketAuthToken = async (
    classroomCode: string
): Promise<WebSocketAuthResponse> => {
    const response = await http.get<WebSocketAuthResponse>("/api/ws/token", {
        params: { classroom_code: classroomCode },
    })
    return response.data
}
