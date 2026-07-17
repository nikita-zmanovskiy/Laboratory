import { Router } from 'express'
import { ClassroomRepository } from '../repositories/classroom.repository'
import { ClassroomController } from '../controllers/classroom.controller'
import { validate } from '../middlewares/validateRequest.middleware'
import { createClassroomSchema } from '../schemas/classroom.schema'
import { csrfService } from './csrf.routes'

const classroomRouter = Router(),
    classroomRepo = new ClassroomRepository(),
    classroomController = new ClassroomController(classroomRepo, csrfService)

classroomRouter.post('/', validate(createClassroomSchema), classroomController.create)
classroomRouter.post('/:code/deactivate', classroomController.deactivate)
classroomRouter.post('/:code/extend', classroomController.extend)
classroomRouter.get('/:code/join', classroomController.join)
classroomRouter.post('/:code/teacher-session', classroomController.teacherSession)
export { classroomRouter }
