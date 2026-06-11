import { ensureCsrfSession } from "@/shared/api/csrf"
import { http } from "@/shared/api/http"
import { apiRoutes } from "@/shared/config/apiRoutes"

import type { GenerateMode, GenerateRequestDto, GenerateResponseDto } from "./dto"

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
