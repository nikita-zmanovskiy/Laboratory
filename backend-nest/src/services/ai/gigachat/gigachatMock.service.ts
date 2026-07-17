import type { AiGenerateResult } from '../../../types/ai'
import { detectGigaChatMode } from '../gigachatPromptMode'

export class GigaChatMockService {
    generate(prompt: string, image?: string | null): AiGenerateResult {
        const isImage = Boolean(image) || detectGigaChatMode(prompt) === 'image'
        const preview = prompt.length > 200 ? `${prompt.slice(0, 200)}…` : prompt

        if (isImage) {
            const promptTokens = Math.ceil(prompt.length / 4)
            const completionTokens = 20

            return {
                text: `[MOCK] Генерирую изображение: ${preview}`,
                image_id: `mock-image-${Date.now()}`,
                image_url: `https://placehold.co/1024x1024/EEE/999?text=${encodeURIComponent(
                    prompt.slice(0, 30)
                )}`,
                finish_reason: 'stop',
                model: 'GigaChat-mock',
                usage: {
                    prompt_tokens: promptTokens,
                    completion_tokens: completionTokens,
                    total_tokens: promptTokens + completionTokens,
                },
                is_image: true,
            }
        }

        return {
            text: `[MOCK] ${preview}`,
            role: 'assistant',
            finish_reason: 'stop',
            model: 'GigaChat-2-mock',
            usage: {
                prompt_tokens: Math.ceil(prompt.length / 4),
                completion_tokens: Math.ceil(preview.length / 4),
                total_tokens: Math.ceil((prompt.length + preview.length) / 4),
            },
            is_image: false,
        }
    }
}
