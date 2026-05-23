import type { Request, Response, NextFunction } from 'express'
import { GigaChatService } from '../services/ai/gigachat.service.js'
import { GenerateUseCase } from '../use-cases/generate/generate.use-case.js'
import { GeneratePresenter } from '../presenters/generate.presenter.js'
import { toGenerateRequestDto, type GenerateRequestBody } from '../dto/generate.dto.js'

export class GenerateController {
    constructor(
        private generateUseCase: GenerateUseCase,
        private generatePresenter: GeneratePresenter,
        private gigaChat: GigaChatService
    ) {}

    generate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto = toGenerateRequestDto(req.body as GenerateRequestBody)
            const result = await this.generateUseCase.execute(dto)

            return res.json(this.generatePresenter.present(result))
        } catch (error) {
            next(error)
        }
    }

    getImage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const imageId = req.params.imageId as string
            const imageBuffer = await this.gigaChat.downloadImage(imageId)

            res.setHeader('Content-Type', 'image/jpeg')
            res.setHeader('Cache-Control', 'public, max-age=3600')
            res.send(imageBuffer)
        } catch (error) {
            next(error)
        }
    }
}
