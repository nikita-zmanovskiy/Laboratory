import type { AiGenerateResult } from '../../../types/ai.js'
import { detectGigaChatMode } from '../gigachatPromptMode.js' 

export class GigaChatMockService {
    generate(prompt: string): AiGenerateResult {
        const isImage = detectGigaChatMode(prompt) === 'image'
        const preview = prompt.length > 200 ? `${prompt.slice(0, 200)}…` : prompt

        if (isImage) {
            return {
                text: `[MOCK] Генерирую изображение: ${preview}`,
                image_id: `mock-image-${Date.now()}`,
                image_url: `https://placehold.co/1024x1024/EEE/999?text=${encodeURIComponent(prompt.slice(0, 30))}`,
                finish_reason: 'stop',
                model: 'GigaChat-mock',
                usage: {
                    prompt_tokens: Math.ceil(prompt.length / 4),
                    completion_tokens: 20,
                    total_tokens: Math.ceil(prompt.length / 4) + 20,
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