import { ensureCsrfSession } from "@/shared/api/csrf"
import { http } from "@/shared/api/http"
import { apiRoutes } from "@/shared/config/router/apiRoutes"

import { createGenerateRequest } from "../lib"

import { GenerateResponseDto } from "./dto"

export const sendGenerateImage = async (
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
