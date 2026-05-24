export interface GigaChatMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
    attachments?: string[]
}

export interface GigaChatResponse {
    choices: Array<{
        message: {
            content: string
            role: string
        }
        finish_reason: string
        index: number
    }>
    usage: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
    model: string
    object: string
}

export interface GigaChatRequestData {
    model: string
    messages: GigaChatMessage[]
    function_call?: 'auto'
    n: number
    stream: boolean
    max_tokens: number
    repetition_penalty?: number
    temperature?: number
}
