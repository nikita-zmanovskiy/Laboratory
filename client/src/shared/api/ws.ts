import { http } from "./http"

export interface WebSocketAuthResponse {
    token: string
    role: "teacher" | "student"
}

export const getWebSocketAuthToken = async (
    classroomCode: string
): Promise<WebSocketAuthResponse> => {
    const response = await http.get<WebSocketAuthResponse>("/api/ws/token", {
        params: { classroom_code: classroomCode },
    })
    return response.data
}
