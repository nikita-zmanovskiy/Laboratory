import type { AiGenerateResult } from '../../../types/ai'
import type { GigaChatResponse } from './gigachat.types'

export class GigaChatResponseParser {
    parse(response: GigaChatResponse): AiGenerateResult {
        const choice = response.choices?.[0]

        if (!choice) {
            throw new Error('Empty response from GigaChat')
        }

        if (choice.finish_reason === 'safety') {
            return {
                text: 'Запрос отклонен по соображениям безопасности.',
                blocked: true,
                finish_reason: 'safety',
                usage: response.usage || null,
            }
        }

        const content = choice.message.content
        const imageMatch = content.match(/<img src="([^"]+)"[^>]*>/)

        if (imageMatch) {
            const imageId = imageMatch[1]

            return {
                text: content.replace(/<img[^>]+>/g, '').trim(),
                image_id: imageId,
                image_url: `/api/generate/images/${imageId}`,
                finish_reason: choice.finish_reason,
                model: response.model,
                usage: response.usage || null,
                is_image: true,
            }
        }

        return {
            text: content,
            role: choice.message.role,
            finish_reason: choice.finish_reason,
            model: response.model,
            usage: response.usage || null,
            is_image: false,
        }
    }
}
