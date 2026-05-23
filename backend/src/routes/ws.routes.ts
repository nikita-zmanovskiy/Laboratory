import { Router } from 'express'
import { ClassroomRepository } from '../repositories/classroom.repository.js'
import { WsController } from '../controllers/ws.controller.js'
import { csrfService } from './csrf.routes.js'

const wsRouter = Router()
const classroomRepo = new ClassroomRepository()
const wsController = new WsController(csrfService, classroomRepo)

wsRouter.get('/token', wsController.getToken)

export { wsRouter }
