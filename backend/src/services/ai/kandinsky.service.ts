import { BaseAiService, AI_RETRY_ATTEMPTS } from './baseAiService.js'
import { config } from '../../config/env.js'
import { AppError } from '../../utils/errors.js'
import { logger } from '../../utils/logger.js'
import type { AxiosRequestConfig } from 'axios'

interface KandinskyResponse {
    url?: string
    image_url?: string
}

interface KandinskyRequestConfig extends AxiosRequestConfig {
    data?: {
        mode?: string
    }
}

interface KandinskyResult {
    image_url?: string
    provider: 'kandinsky'
    mode?: string
}

export class KandinskyService extends BaseAiService {
    constructor() {
        super('Kandinsky', config.gigachat.apiUrl)
    }

    async generate(prompt: string, image?: string | null) {
        //todo: УБРАТЬ/АДАПТИРОВАТЬ МЕТОД - пока не ипользуется
        return
        // if (config.aiMock) {
        //     return this.mock(prompt, image)
        // }
        //
        // const mode = image ? 'image2image' : 'text2image'
        //
        // const payload = image
        //     ? { prompt, image, mode: 'image2image' }
        //     : { prompt, mode: 'text2image' }

        // return this.makeRequestWithRetry({
        //     method: 'POST',
        //     url: '/generate',
        //     headers: {
        //         'X-Key': `Key ${config.kandinsky?.key}`,
        //         'X-Secret': `Secret ${config.kandinsky?.secret}`,
        //         'Content-Type': 'application/json'
        //     },
        //     data: payload
        // })
    }

    private async makeRequestWithRetry(
        requestConfig: KandinskyRequestConfig,
        attempt = 0
    ): Promise<KandinskyResult> {
        try {
            const response = await this.makeRequest<KandinskyResponse>(requestConfig)
            return {
                image_url: response.url || response.image_url,
                provider: 'kandinsky',
                mode: requestConfig.data?.mode,
            }
        } catch (error) {
            if (
                attempt < AI_RETRY_ATTEMPTS &&
                error instanceof AppError &&
                error.statusCode === 503
            ) {
                logger.info(`kandinsky - retry attempt ${attempt + 1}`)
                await this.delay(Math.pow(2, attempt) * 1000)
                return this.makeRequestWithRetry(requestConfig, attempt + 1)
            }
            throw error
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    private mock(prompt: string, image?: string | null) {
        return {
            image_url: 'https://example.com/ai-mock-image.png',
            provider: 'kandinsky-mock',
            mode: image ? 'image2image' : 'text2image',
            prompt_preview: prompt.slice(0, 120),
            image_attached: Boolean(image),
        }
    }
}
