export type GenerateMode = "text" | "image"

export interface GenerateTokensDto {
    input: number
    output: number
}

export interface GenerateResponseDataDto {
    text?: string
    tokens?: GenerateTokensDto
    is_approximate?: boolean
    image_url?: string
    image_id?: string
    is_image?: boolean
}

export interface GenerateRequestDto {
    mode: GenerateMode
    prompt: string
    session_id: string
    image?: string
}

export interface GenerateResponseDto {
    mode: string
    data: GenerateResponseDataDto
}