import type { z } from 'zod'
import type { generateBodySchema } from '../schemas/generate.schema.js'

export type GenerateMode = 'text' | 'image'

export type GenerateRequestBody = z.infer<typeof generateBodySchema>

export interface GenerateRequestDto {
    mode: GenerateMode
    prompt: string
    classroomCode: string
    sessionId?: string
    image?: string
}

export const toGenerateRequestDto = (body: GenerateRequestBody): GenerateRequestDto => ({
    mode: body.mode,
    prompt: body.prompt,
    classroomCode: body.classroom_code,
    sessionId: body.session_id,
    image: body.image,
})
