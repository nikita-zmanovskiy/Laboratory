import { Module } from '@nestjs/common'
import { GenerateController } from '../controllers/generate.controller'
import { GigaChatService } from '../services/ai/gigachat.service'
import { GenerateUseCase } from '../use-cases/generate/generate.use-case'
import { GeneratePresenter } from '../presenters/generate.presenter'
import { ClassroomPolicy } from '../use-cases/generate/classroomPolicy'
import { PromptBuilder } from '../use-cases/generate/promptBuilder'
import { TokenUsageService } from '../use-cases/generate/tokenUsage.service'
import { AuditLogService } from '../use-cases/generate/auditLog.service'
import { ClassroomModule } from './classroom.module'

@Module({
    imports: [ClassroomModule],
    controllers: [GenerateController],
    providers: [
        GigaChatService,
        GenerateUseCase,
        GeneratePresenter,
        ClassroomPolicy,
        PromptBuilder,
        TokenUsageService,
        AuditLogService,
    ],
})
export class GenerateModule {}
