import { http } from "./http"
import { ensureCsrfSession } from "./csrf"

interface GenerateResponse {
    mode: string
    data: {
        text?: string
        tokens?: { input: number; output: number }
        is_approximate?: boolean
        image_url?: string
        image_id?: string
        is_image?: boolean
    }
}

export const generateText = async (
    prompt: string,
    sessionId: string,
    classroomCode: string,
    imageBase64?: string | null,
    skipEnsureSession = false
): Promise<GenerateResponse> => {
    if (!skipEnsureSession) {
        await ensureCsrfSession(sessionId)
    }
    const body: Record<string, unknown> = { mode: "text", prompt, session_id: sessionId }
    if (imageBase64) body.image = imageBase64

    const response = await http.post<GenerateResponse>("/api/generate", body, {
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
): Promise<GenerateResponse> => {
    if (!skipEnsureSession) {
        await ensureCsrfSession(sessionId)
    }

    const body: Record<string, unknown> = {
        mode: "image",
        prompt,
        session_id: sessionId,
    }

    if (imageBase64) {
        body.image = imageBase64
    }

    const response = await http.post<GenerateResponse>("/api/generate", body, {
        headers: {
            "x-classroom-code": classroomCode,
        },
    })

    return response.data
}
