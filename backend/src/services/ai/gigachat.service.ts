import { BaseAiService } from './baseAiService.js'
import { GigaChatAuthService } from './gigachatAuth.service.js'
import { GigaChatFilesService } from './gigachatFiles.service.js'
import { config } from '../../config/env.js'
import { RequestQueueService } from './requestQueue.service.js'
import axios from 'axios'
import FormData from 'form-data'
import path from 'path'
import https from 'https'
import fs from 'fs'
import type { AiGenerateResult } from '../../types/ai.js'
import { logger } from '../../utils/logger.js'

interface GigaChatMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
    attachments?: string[]
}

interface GigaChatResponse {
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

interface GigaChatRequestData {
    model: string
    messages: GigaChatMessage[]
    function_call?: 'auto'
    n: number
    stream: boolean
    max_tokens: number
    repetition_penalty?: number
    temperature?: number
}

export class GigaChatService extends BaseAiService {
    private authService: GigaChatAuthService
    private filesService: GigaChatFilesService
    private queue: RequestQueueService
    private model: string
    private textModel = 'GigaChat-2'
    private imageModel = 'GigaChat-Pro'

    constructor() {
        super('GigaChat', config.gigachat.apiUrl)
        this.queue = new RequestQueueService(2, 2000)
        this.authService = new GigaChatAuthService()
        this.filesService = new GigaChatFilesService()
        this.model = 'GigaChat'
    }
    async analyzeImage(
        prompt: string,
        imageBase64: string,
        systemPrompt?: string
    ): Promise<AiGenerateResult> {
        if (config.aiMock) return this.mockGenerate(prompt, imageBase64)

        const fileId = await this.uploadImage(imageBase64)

        const messages: GigaChatMessage[] = []

        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt })
        }

        messages.push({
            role: 'user',
            content: prompt,
            attachments: [fileId],
        })

        return this.queue.enqueue(async () => {
            const token = await this.authService.getAccessToken()
            const response = await this.makeRequest<GigaChatResponse>({
                method: 'POST',
                url: '/chat/completions',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                data: {
                    model: 'GigaChat-Pro',
                    messages: messages,
                    function_call: 'auto',
                    n: 1,
                    stream: false,
                    max_tokens: 2000,
                },
            })
            return this.parseResponse(response)
        })
    }
    async generate(
        prompt: string,
        image?: string,
        systemPrompt?: string
    ): Promise<AiGenerateResult> {
        if (config.aiMock) return this.mockGenerate(prompt, image)

        if (image && !this.isImagePrompt(prompt)) {
            return {
                text: "GigaChat не поддерживает анализ изображений. Используйте запросы с 'Нарисуй...' для генерации.",
                blocked: false,
                finish_reason: 'image_not_supported',
                usage: {
                    prompt_tokens: Math.ceil(prompt.length / 4),
                    completion_tokens: 20,
                    total_tokens: Math.ceil(prompt.length / 4) + 20,
                },
                image_support: false,
            }
        }

        const messages: GigaChatMessage[] = []

        if (systemPrompt && this.isImagePrompt(prompt)) {
            messages.push({ role: 'system', content: systemPrompt })
        } else if (this.isImagePrompt(prompt)) {
            messages.push({
                role: 'system',
                content: 'Ты - художник-иллюстратор. Создавай изображения по запросу.',
            })
        } else if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt })
        }

        messages.push({ role: 'user', content: prompt })

        const requestData: GigaChatRequestData = {
            model: this.textModel,
            messages: messages,
            n: 1,
            stream: false,
            max_tokens: 2000,
            repetition_penalty: 1,
            temperature: 0.7,
        }

        if (this.isImagePrompt(prompt) || (image && this.isImagePrompt(prompt))) {
            requestData.function_call = 'auto'
        }
        return this.queue.enqueue(async () => {
            return this.withRetry(async () => {
                const token = await this.authService.getAccessToken()

                const response = await this.makeRequest<GigaChatResponse>({
                    method: 'POST',
                    url: '/chat/completions',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    data: requestData,
                })

                return this.parseResponse(response)
            })
        })
    }
    async generateWithImage(
        prompt: string,
        imageBase64: string,
        systemPrompt?: string
    ): Promise<AiGenerateResult> {
        if (config.aiMock) return this.mockGenerate(prompt, imageBase64)

        const fileId = await this.uploadImage(imageBase64)

        const messages: GigaChatMessage[] = []

        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt })
        }

        messages.push({
            role: 'user',
            content: prompt,
            attachments: [fileId],
        })

        const requestData: GigaChatRequestData = {
            model: this.imageModel,
            messages: messages,
            function_call: 'auto',
            n: 1,
            stream: false,
            max_tokens: 2000,
        }

        return this.queue.enqueue(async () => {
            const token = await this.authService.getAccessToken()
            const response = await this.makeRequest<GigaChatResponse>({
                method: 'POST',
                url: '/chat/completions',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                data: requestData,
            })
            return this.parseResponse(response)
        })
    }

    private async uploadImage(base64Image: string): Promise<string> {
        const token = await this.authService.getAccessToken()
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')

        const form = new FormData()
        form.append('file', buffer, {
            filename: 'image.png',
            contentType: 'image/png',
        })
        form.append('purpose', 'general')

        const certPath = path.join(process.cwd(), 'russian_trusted_root_ca.cer')
        const httpsAgent = new https.Agent({
            ca: fs.existsSync(certPath) ? fs.readFileSync(certPath) : undefined,
            rejectUnauthorized: !fs.existsSync(certPath),
        })

        try {
            const response = await axios.post(`${config.gigachat.apiUrl}/files`, form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    ...form.getHeaders(),
                },
                httpsAgent,
                timeout: 30000,
            })
            return response.data.id
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                logger.error('[GigaChat Upload] Error', { status: error.response?.status })
            }
            throw error
        }
    }

    private parseResponse(response: GigaChatResponse): AiGenerateResult {
        const choice = response.choices?.[0]

        if (!choice) {
            throw new Error('Empty response from gigaChat')
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

    async downloadImage(imageId: string): Promise<Buffer> {
        const token = await this.authService.getAccessToken()

        const response = await this.makeRequest<ArrayBuffer>({
            method: 'GET',
            url: `/files/${imageId}/content`,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'image/jpg',
            },
            responseType: 'arraybuffer',
        })

        return Buffer.from(response)
    }

    async generateWithSystem(
        prompt: string,
        systemPrompt: string,
        image?: string
    ): Promise<AiGenerateResult> {
        if (config.aiMock) return this.mockGenerate(prompt, image)

        const messages: GigaChatMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
        ]

        const requestData: GigaChatRequestData = {
            model: this.textModel,
            messages: messages,
            n: 1,
            stream: false,
            max_tokens: 2000,
            repetition_penalty: 1,
            temperature: 0.7,
        }

        if (this.isImagePrompt(prompt)) {
            requestData.function_call = 'auto'
        }

        return this.queue.enqueue(async () => {
            const token = await this.authService.getAccessToken()
            const response = await this.makeRequest<GigaChatResponse>({
                method: 'POST',
                url: '/chat/completions',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                data: requestData,
                timeout: 120000,
            })
            return this.parseResponse(response)
        })
    }

    private isImagePrompt(prompt: string): boolean {
        const imageKeywords = [
            'нарисуй',
            'нарисуйте',
            'изобрази',
            'создай изображение',
            'покажи',
            'картинку',
            'рисунок',
            'draw',
            'paint',
            'image',
            'picture',
            'сгенерируй изображение',
        ]
        const lowerPrompt = prompt.toLowerCase()
        return imageKeywords.some((keyword) => lowerPrompt.includes(keyword))
    }

    private mockGenerate(prompt: string, image?: string): AiGenerateResult {
        const isImage = this.isImagePrompt(prompt)
        const preview = prompt.length > 200 ? `${prompt.slice(0, 200)}…` : prompt

        if (isImage) {
            return {
                text: `[MOCK] Генерирую изображение: ${preview}`,
                image_id: 'mock-image-' + Date.now(),
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
