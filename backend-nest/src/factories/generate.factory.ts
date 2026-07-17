import { GenerateController } from '../controllers/generate.controller'
import { GeneratePresenter } from '../presenters/generate.presenter'
import { ClassroomRepository } from '../repositories/classroom.repository'
import { LogRepository } from '../repositories/log.repository'
import { GigaChatService } from '../services/ai/gigachat.service'
import { AuditLogService } from '../use-cases/generate/auditLog.service'
import { ClassroomPolicy } from '../use-cases/generate/classroomPolicy'
import { GenerateUseCase } from '../use-cases/generate/generate.use-case'
import { PromptBuilder } from '../use-cases/generate/promptBuilder'
import { TokenUsageService } from '../use-cases/generate/tokenUsage.service'

export function createGenerateController() {
    const classroomRepository = new ClassroomRepository()
    const logRepository = new LogRepository()

    const gigaChatService = new GigaChatService()

    const classroomPolicy = new ClassroomPolicy(classroomRepository)
    const promptBuilder = new PromptBuilder()
    const tokenUsageService = new TokenUsageService()
    const auditLogService = new AuditLogService(logRepository)

    const generateUseCase = new GenerateUseCase(
        classroomPolicy,
        promptBuilder,
        tokenUsageService,
        auditLogService,
        gigaChatService
    )

    const generatePresenter = new GeneratePresenter()

    return new GenerateController(generateUseCase, generatePresenter, gigaChatService)
}
