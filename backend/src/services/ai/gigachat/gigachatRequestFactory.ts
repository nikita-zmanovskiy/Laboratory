import type { GigaChatMessage, GigaChatRequestData } from './gigachat.types.js'
import type { GigaChatMode } from '../gigachatPromptMode.js'

const DEFAULT_IMAGE_SYSTEM_PROMPT =
    'Ты - художник-иллюстратор. Создавай изображения по запросу. Активно используй Markdown.'

interface BuildTextRequestParams {
    prompt: string
    systemPrompt?: string
    mode: GigaChatMode
    textModel: string
}

interface BuildImageRequestParams {
    prompt: string
    fileId?: string
    systemPrompt?: string
    imageModel: string
}

export class GigaChatRequestFactory {
    buildTextRequest(params: BuildTextRequestParams): GigaChatRequestData {
        const messages: GigaChatMessage[] = []

        if (params.systemPrompt) {
            messages.push({ role: 'system', content: params.systemPrompt })
        } else if (params.mode === 'image') {
            messages.push({ role: 'system', content: DEFAULT_IMAGE_SYSTEM_PROMPT })
        }

        messages.push({ role: 'user', content: params.prompt })

        return {
            model: params.textModel,
            messages,
            n: 1,
            stream: false,
            max_tokens: 2000,
            repetition_penalty: 1,
            temperature: 0.7,
            ...(params.mode === 'image' ? { function_call: 'auto' as const } : {}),
        }
    }

    buildImageRequest(params: BuildImageRequestParams): GigaChatRequestData {
        const messages: GigaChatMessage[] = []

        if (params.systemPrompt) {
            messages.push({ role: 'system', content: params.systemPrompt })
        }

        messages.push({
            role: 'user',
            content: params.prompt,
            attachments: params.fileId ? [params.fileId] : undefined,
        })

        return {
            model: params.imageModel,
            messages,
            function_call: 'auto',
            n: 1,
            stream: false,
            max_tokens: 2000,
        }
    }
}
