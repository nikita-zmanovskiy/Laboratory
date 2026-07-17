import { Injectable } from '@nestjs/common'
import { BaseAiService } from './baseAiService'
import { GigaChatAuthService } from './gigachatAuth.service'
import { GigaChatFilesService } from './gigachatFiles.service'
import { RequestQueueService } from './requestQueue.service'
import { config } from '../../config/env'
import type { AiGenerateResult } from '../../types/ai'

import type { GigaChatRequestData, GigaChatResponse } from './gigachat/gigachat.types'
import { detectGigaChatMode } from './gigachatPromptMode'
import { GigaChatRequestFactory } from './gigachat/gigachatRequestFactory'
import { GigaChatResponseParser } from './gigachat/gigachatResponseParser'
import { GigaChatMockService } from './gigachat/gigachatMock.service'

@Injectable()
export class GigaChatService extends BaseAiService {
    private readonly authService: GigaChatAuthService
    private readonly filesService: GigaChatFilesService
    private readonly queue: RequestQueueService

    private readonly requestFactory: GigaChatRequestFactory
    private readonly responseParser: GigaChatResponseParser
    private readonly mockService: GigaChatMockService

    private readonly textModel = 'GigaChat-2'
    private readonly imageModel = 'GigaChat-Pro'

    constructor() {
        super('GigaChat', config.gigachat.apiUrl)

        this.authService = new GigaChatAuthService()
        this.filesService = new GigaChatFilesService()
        this.queue = new RequestQueueService(2, 2000)

        this.requestFactory = new GigaChatRequestFactory()
        this.responseParser = new GigaChatResponseParser()
        this.mockService = new GigaChatMockService()
    }

    async generate(
        prompt: string,
        image?: string,
        systemPrompt?: string
    ): Promise<AiGenerateResult> {
        if (config.aiMock) {
            return this.mockService.generate(prompt, image)
        }

        const mode = detectGigaChatMode(prompt)

        if (image && mode !== 'image') {
            return this.unsupportedImageAnalysisResult(prompt)
        }

        const requestData = this.requestFactory.buildTextRequest({
            prompt,
            systemPrompt,
            mode,
            textModel: this.textModel,
        })

        return this.sendChatCompletion(requestData)
    }

    async generateWithSystem(
        prompt: string,
        systemPrompt: string,
        image?: string
    ): Promise<AiGenerateResult> {
        if (config.aiMock) {
            return this.mockService.generate(prompt, image)
        }

        const mode = detectGigaChatMode(prompt)

        if (image && mode !== 'image') {
            return this.unsupportedImageAnalysisResult(prompt)
        }

        const requestData = this.requestFactory.buildTextRequest({
            prompt,
            systemPrompt,
            mode,
            textModel: this.textModel,
        })

        return this.sendChatCompletion(requestData, 120000)
    }

    async generateWithImage(
        prompt: string,
        imageBase64: string,
        systemPrompt?: string
    ): Promise<AiGenerateResult> {
        if (config.aiMock) {
            return this.mockService.generate(prompt, imageBase64)
        }

        const fileId = await this.filesService.uploadImage(imageBase64)

        const requestData = this.requestFactory.buildImageRequest({
            prompt,
            fileId,
            systemPrompt,
            imageModel: this.imageModel,
        })

        return this.sendChatCompletion(requestData, 120000)
    }

    async analyzeImage(
        prompt: string,
        imageBase64: string,
        systemPrompt?: string
    ): Promise<AiGenerateResult> {
        return this.generateWithImage(prompt, imageBase64, systemPrompt)
    }

    async downloadImage(imageId: string): Promise<Buffer> {
        return this.filesService.downloadImage(imageId)
    }

    private async sendChatCompletion(
        requestData: GigaChatRequestData,
        timeout?: number
    ): Promise<AiGenerateResult> {
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
                    ...(timeout ? { timeout } : {}),
                })

                return this.responseParser.parse(response)
            })
        })
    }

    private unsupportedImageAnalysisResult(prompt: string): AiGenerateResult {
        const promptTokens = Math.ceil(prompt.length / 4)
        const completionTokens = 20

        return {
            text: "GigaChat не поддерживает анализ изображений. Используйте запросы с 'Нарисуй...' для генерации.",
            blocked: false,
            finish_reason: 'image_not_supported',
            usage: {
                prompt_tokens: promptTokens,
                completion_tokens: completionTokens,
                total_tokens: promptTokens + completionTokens,
            },
            image_support: false,
        }
    }
}
