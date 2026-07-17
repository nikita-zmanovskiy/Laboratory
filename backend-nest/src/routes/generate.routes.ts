import { Router } from 'express'

import { validate } from '../middlewares/validateRequest.middleware'
import { generateSchema } from '../schemas/generate.schema'
import { createGenerateController } from '../factories/generate.factory'

const generateRouter = Router()

const generateController = createGenerateController()

generateRouter.post('/', validate(generateSchema), generateController.generate)

generateRouter.get('/images/:imageId', generateController.getImage)

export { generateRouter }
