import { Router } from 'express'
import { LogsController } from '../controllers/logs.controller'
import { LogRepository } from '../repositories/log.repository'
import { LogService } from '../services/log.service'
import { ClassroomRepository } from '../repositories/classroom.repository'

const logsRouter = Router(),
    logRepo = new LogRepository(),
    logService = new LogService(logRepo),
    classroomRepo = new ClassroomRepository(),
    logsController = new LogsController(logService, classroomRepo)

logsRouter.get('/', logsController.getLogs)
logsRouter.get('/export', logsController.exportLogs)
export { logsRouter }
