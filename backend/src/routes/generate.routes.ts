import { Router } from 'express'
import { GenerateController } from '../controllers/generate.controller.js'
import { ClassroomRepository } from '../repositories/classroom.repository.js'
import { LogRepository } from '../repositories/log.repository.js'
import { GigaChatService } from '../services/ai/gigachat.service.js'
import { validate } from '../middlewares/validateRequest.middleware.js'
import { generateSchema } from '../schemas/generate.schema.js'
import { ClassroomPolicy } from '../use-cases/generate/classroomPolicy.js'
import { PromptBuilder } from '../use-cases/generate/promptBuilder.js'
import { TokenUsageService } from '../use-cases/generate/tokenUsage.service.js'
import { AuditLogService } from '../use-cases/generate/auditLog.service.js'
import { GenerateUseCase } from '../use-cases/generate/generate.use-case.js'
import { GeneratePresenter } from '../presenters/generate.presenter.js'

const generateRouter = Router()

const classroomRepo = new ClassroomRepository(),
    logRepo = new LogRepository(),
    gigaChat = new GigaChatService(),
    classroomPolicy = new ClassroomPolicy(classroomRepo),
    promptBuilder = new PromptBuilder(),
    tokenUsageService = new TokenUsageService(),
    auditLogService = new AuditLogService(logRepo),
    generateUseCase = new GenerateUseCase(
        classroomPolicy,
        promptBuilder,
        tokenUsageService,
        auditLogService,
        gigaChat
    ),
    generatePresenter = new GeneratePresenter(),
    generateController = new GenerateController(generateUseCase, generatePresenter, gigaChat)

generateRouter.post('/', validate(generateSchema), generateController.generate)
generateRouter.get('/images/:imageId', generateController.getImage)

export { generateRouter }
