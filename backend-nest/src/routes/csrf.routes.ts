import { Router } from 'express'
import { CsrfController } from '../controllers/csrf.controller'
import { CsrfService } from '../services/csrf.service'
import { RateLimitService } from '../services/rateLimit.service'

const csrfRouter = Router(),
    csrfService = new CsrfService(),
    rateLimitService = new RateLimitService(),
    csrfController = new CsrfController(csrfService, rateLimitService)

csrfRouter.get('/token', csrfController.getToken)
csrfRouter.post('/refresh', csrfController.refreshToken)
csrfRouter.delete('/token', csrfController.revokeToken)
csrfRouter.get('/status', csrfController.getStatus)

export { csrfRouter, csrfService }
