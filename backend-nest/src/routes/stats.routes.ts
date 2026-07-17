import { Router } from 'express'
import { ClassroomRepository } from '../repositories/classroom.repository'
import { ClassroomService } from '../services/classroom.service'
import { StatsController } from '../controllers/stats.controller'

const statsRouter = Router(),
    classroomRepo = new ClassroomRepository(),
    classroomService = new ClassroomService(classroomRepo),
    statsController = new StatsController(classroomService, classroomRepo)

statsRouter.get('/:classroomCode', statsController.getClassroomStats)
statsRouter.get('/', statsController.getGlobalStats)

export { statsRouter }
