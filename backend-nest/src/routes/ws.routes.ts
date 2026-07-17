import { Router } from 'express'
import { ClassroomRepository } from '../repositories/classroom.repository'
import { WsController } from '../controllers/ws.controller'
import { csrfService } from './csrf.routes'

const wsRouter = Router()
const classroomRepo = new ClassroomRepository()
const wsController = new WsController(csrfService, classroomRepo)

wsRouter.get('/token', wsController.getToken)

export { wsRouter }
