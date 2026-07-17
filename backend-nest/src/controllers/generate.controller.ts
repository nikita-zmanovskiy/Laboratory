import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Res,
    UsePipes,
    HttpCode,
    HttpStatus,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { GigaChatService } from '../services/ai/gigachat.service'
import { GenerateUseCase } from '../use-cases/generate/generate.use-case'
import { GeneratePresenter } from '../presenters/generate.presenter'
import { toGenerateRequestDto, type GenerateRequestBody } from '../dto/generate.dto'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { generateSchema } from '../schemas/generate.schema'

@ApiTags('Generate')
@Controller('api/generate')
export class GenerateController {
    constructor(
        private generateUseCase: GenerateUseCase,
        private generatePresenter: GeneratePresenter,
        private gigaChat: GigaChatService
    ) {}

    @Post()
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodValidationPipe(generateSchema))
    async generate(@Body() body: GenerateRequestBody) {
        const dto = toGenerateRequestDto(body)
        const result = await this.generateUseCase.execute(dto)
        return this.generatePresenter.present(result)
    }

    @Get('images/:imageId')
    async getImage(@Param('imageId') imageId: string, @Res() res: Response) {
        const imageBuffer = await this.gigaChat.downloadImage(imageId)
        res.setHeader('Content-Type', 'image/jpeg')
        res.setHeader('Cache-Control', 'public, max-age=3600')
        res.send(imageBuffer)
    }
}
