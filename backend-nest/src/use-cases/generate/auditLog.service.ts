import { Injectable } from '@nestjs/common'
import { LogRepository } from '../../repositories/log.repository'
import type { RequestLog } from '../../types/models'
import { hashPrompt } from '../../utils/crypto'
import { WebSocketService } from '../../services/websocket.service'
import type { GenerateRequestDto } from '../../dto/generate.dto'
import type { TokenUsage } from './tokenUsage.service'

export interface AuditGenerateRequestParams {
    dto: GenerateRequestDto
    classroomId: string | null
    tokenUsage: TokenUsage
    status: number
    responseTimeMs: number
    errorMessage: string | null
}

function toRequestLog(log: Awaited<ReturnType<LogRepository['create']>>): RequestLog {
    return {
        id: log.id,
        timestamp: log.timestamp,
        classroom_id: log.classroomId,
        session_id: log.sessionId,
        mode: log.mode,
        prompt_hash: log.promptHash,
        image_attached: log.imageAttached,
        tokens_input: log.tokensInput,
        tokens_output: log.tokensOutput,
        tokens_is_approximate: log.tokensIsApproximate ?? true,
        status: log.status,
        response_time_ms: log.responseTimeMs ?? 0,
        error_message: log.errorMessage,
    }
}

@Injectable()
export class AuditLogService {
    constructor(
        private logRepo: LogRepository,
        private wsService: WebSocketService
    ) {}

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
            classroom_id: classroomId!,
            session_id: dto.sessionId || 'unknown',
            mode: dto.mode,
            prompt_hash: dto.prompt ? hashPrompt(dto.prompt) : undefined,
            image_attached: Boolean(dto.image),
            tokens_input: tokenUsage.input,
            tokens_output: tokenUsage.output,
            tokens_is_approximate: tokenUsage.approximate,
            status,
            response_time_ms: responseTimeMs,
            error_message: errorMessage ?? undefined,
        })

        const mapped = toRequestLog(logEntry)
        this.wsService.broadcastLog(dto.classroomCode, mapped)

        return mapped
    }
}
