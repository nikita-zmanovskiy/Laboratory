import { Injectable } from '@nestjs/common'
import type { GenerateRequestDto, GenerateMode } from '../../dto/generate.dto'
import type { AiGenerateResult } from '../../types/ai'
import { GigaChatService } from '../../services/ai/gigachat.service'
import { AppError } from '../../utils/errors'
import { validateImageSize } from '../../utils/imageValidator'
import { ClassroomPolicy } from './classroomPolicy'
import { PromptBuilder } from './promptBuilder'
import { AuditLogService } from './auditLog.service'
import { TokenUsage, TokenUsageService } from './tokenUsage.service'

export interface GenerateUseCaseResult {
    mode: GenerateMode
    result: AiGenerateResult
    tokenUsage: TokenUsage
}

@Injectable()
export class GenerateUseCase {
    constructor(
        private classroomPolicy: ClassroomPolicy,
        private promptBuilder: PromptBuilder,
        private tokenUsageService: TokenUsageService,
        private auditLogService: AuditLogService,
        private gigaChat: GigaChatService
    ) {}

    async execute(dto: GenerateRequestDto): Promise<GenerateUseCaseResult> {
        const startTime = Date.now()
        let status = 200
        let errorMessage: string | null = null
        let classroomId: string | null = null
        let tokenUsage = this.tokenUsageService.createEmpty()

        try {
            const classroom = await this.classroomPolicy.ensureCanGenerate(dto.classroomCode)
            classroomId = classroom.id

            const normalizedImage = this.normalizeImageInput(dto.image)
            const result =
                dto.mode === 'text'
                    ? await this.generateText(dto, classroom.grade || 11, normalizedImage)
                    : await this.generateImage(dto, normalizedImage)

            if (result.blocked) {
                status = 403
                errorMessage = 'Request blocked by safety filter'
                throw new AppError(403, result.text || 'Request rejected for safety reasons')
            }

            tokenUsage = this.tokenUsageService.fromAiUsage(
                dto.prompt,
                result.text || result.content || '',
                result.usage
            )

            return {
                mode: dto.mode,
                result,
                tokenUsage,
            }
        } catch (error) {
            if (error instanceof AppError) {
                status = error.statusCode
                errorMessage = error.message
                throw error
            }

            status = 500
            errorMessage = error instanceof Error ? error.message : 'Internal error'
            throw new AppError(500, errorMessage)
        } finally {
            await this.auditLogService
                .recordGenerateRequest({
                    dto,
                    classroomId,
                    tokenUsage,
                    status,
                    responseTimeMs: Date.now() - startTime,
                    errorMessage,
                })
                .catch(() => null)
        }
    }

    private async generateText(
        dto: GenerateRequestDto,
        grade: number,
        normalizedImage?: string
    ): Promise<AiGenerateResult> {
        if (normalizedImage) {
            return this.gigaChat.analyzeImage(
                dto.prompt,
                normalizedImage,
                this.promptBuilder.buildTextWithImageSystemPrompt(grade)
            )
        }

        return this.gigaChat.generate(
            dto.prompt,
            undefined,
            this.promptBuilder.buildTextSystemPrompt(grade)
        )
    }

    private async generateImage(
        dto: GenerateRequestDto,
        normalizedImage?: string
    ): Promise<AiGenerateResult> {
        const systemPrompt = this.promptBuilder.buildImageSystemPrompt()
        const imagePrompt = this.promptBuilder.buildImagePrompt(
            dto.prompt,
            Boolean(normalizedImage)
        )

        return normalizedImage
            ? this.gigaChat.generateWithImage(imagePrompt, normalizedImage, systemPrompt)
            : this.gigaChat.generate(imagePrompt, normalizedImage, systemPrompt)
    }

    private normalizeImageInput(image: unknown): string | undefined {
        if (typeof image !== 'string' || !image.trim()) return undefined

        const value = image.trim()
        const validation = validateImageSize(value)
        if (!validation.valid) {
            throw new AppError(400, validation.error!)
        }

        return value
    }
}
