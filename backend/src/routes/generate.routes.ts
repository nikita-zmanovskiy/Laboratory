import { Router } from 'express'

import { validate } from '../middlewares/validateRequest.middleware.js'
import { generateSchema } from '../schemas/generate.schema.js'
import { createGenerateController } from '../factories/generate.factory.js'

const generateRouter = Router()

const generateController = createGenerateController()

generateRouter.post('/', validate(generateSchema), generateController.generate)

generateRouter.get('/images/:imageId', generateController.getImage)

export { generateRouter }
