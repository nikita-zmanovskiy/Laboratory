import type { GenerateUseCaseResult } from '../use-cases/generate/generate.use-case.js'

export interface GenerateResponse {
    mode: 'text' | 'image'
    data: {
        text?: string
        tokens?: {
            input: number
            output: number
        }
        is_approximate: boolean
        image_url?: string
        image_id?: string
        is_image?: boolean
    }
}

export class GeneratePresenter {
    present(result: GenerateUseCaseResult): GenerateResponse {
        if (result.mode === 'image') {
            return {
                mode: 'image',
                data: {
                    text: result.result.text,
                    image_id: result.result.image_id,
                    image_url: result.result.image_id
                        ? `/api/generate/images/${result.result.image_id}`
                        : result.result.image_url,
                    is_image: true,
                    tokens: {
                        input: result.tokenUsage.input,
                        output: result.tokenUsage.output,
                    },
                    is_approximate: result.tokenUsage.approximate,
                },
            }
        }

        return {
            mode: 'text',
            data: {
                text: result.result.text || result.result.content,
                tokens: {
                    input: result.tokenUsage.input,
                    output: result.tokenUsage.output,
                },
                is_approximate: result.tokenUsage.approximate,
            },
        }
    }
}
