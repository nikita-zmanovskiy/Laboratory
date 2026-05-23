import { LogRepository } from '../../repositories/log.repository.js'
import type { RequestLog } from '../../types/models.js'
import { hashPrompt } from '../../utils/crypto.js'
import { getWebSocketService } from '../../services/websocket.service.js'
import type { GenerateRequestDto } from '../../dto/generate.dto.js'
import type { TokenUsage } from './tokenUsage.service.js'

export interface AuditGenerateRequestParams {
    dto: GenerateRequestDto
    classroomId: string | null
    tokenUsage: TokenUsage
    status: number
    responseTimeMs: number
    errorMessage: string | null
}

export class AuditLogService {
    constructor(private logRepo: LogRepository) {}

    async recordGenerateRequest({
        dto,
        classroomId,
        tokenUsage,
        status,
        responseTimeMs,
        errorMessage,
    }: AuditGenerateRequestParams): Promise<RequestLog | null> {
        const logEntry = await this.logRepo.create({
            timestamp: new Date(),
            classroom_id: classroomId,
            session_id: dto.sessionId || 'unknown',
            mode: dto.mode,
            prompt_hash: dto.prompt ? hashPrompt(dto.prompt) : null,
            image_attached: Boolean(dto.image),
            tokens_input: tokenUsage.input,
            tokens_output: tokenUsage.output,
            tokens_is_approximate: tokenUsage.approximate,
            status,
            response_time_ms: responseTimeMs,
            error_message: errorMessage,
        })

        const wsService = getWebSocketService()
        if (wsService) {
            wsService.broadcastLog(dto.classroomCode, logEntry)
        }

        return logEntry
    }
}
