export interface AiUsage {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
    input?: number
    output?: number
}

export interface AiGenerateResult {
    text?: string
    content?: string
    role?: string
    image_id?: string
    image_url?: string
    finish_reason?: string
    model?: string
    usage?: AiUsage | null
    is_image?: boolean
    image_support?: boolean
    blocked?: boolean
    warning?: string
}
