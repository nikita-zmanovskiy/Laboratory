import { z } from 'zod'

export const generateBodySchema = z.object({
    mode: z.enum(['text', 'image']),
    prompt: z
        .string()
        .trim()
        .min(1, 'Prompt cannot be empty')
        .max(1000, 'Prompt must be 1000 characters or less'),
    classroom_code: z
        .string()
        .length(6, 'Classroom code must be exactly 6 characters')
        .regex(/^[A-Z0-9]+$/, 'Classroom code must contain only uppercase letters and numbers'),
    session_id: z.string().min(1).optional(),
    image: z.string().optional(),
})

export const generateSchema = z.object({
    body: generateBodySchema,
})
