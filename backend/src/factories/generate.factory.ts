import { GenerateController } from '../controllers/generate.controller.js'
import { GeneratePresenter } from '../presenters/generate.presenter.js'
import { ClassroomRepository } from '../repositories/classroom.repository.js'
import { LogRepository } from '../repositories/log.repository.js'
import { GigaChatService } from '../services/ai/gigachat.service.js'
import { AuditLogService } from '../use-cases/generate/auditLog.service.js'
import { ClassroomPolicy } from '../use-cases/generate/classroomPolicy.js'
import { GenerateUseCase } from '../use-cases/generate/generate.use-case.js'
import { PromptBuilder } from '../use-cases/generate/promptBuilder.js'
import { TokenUsageService } from '../use-cases/generate/tokenUsage.service.js'

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
