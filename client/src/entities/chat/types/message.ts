

export type ChatMode = "text" | "image"

export interface Message {
    id: string
    role: "user" | "assistant"
    text?: string
    attachedImage?: string
    generatedImage?: string
    tokens?: {
        input: number
        output: number
    }
    isApproximate?: boolean
}