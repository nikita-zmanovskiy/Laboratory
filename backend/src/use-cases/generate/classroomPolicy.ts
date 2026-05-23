import { ClassroomRepository } from '../../repositories/classroom.repository.js'
import type { Classroom } from '../../types/models.js'
import { AppError } from '../../utils/errors.js'

export class ClassroomPolicy {
    constructor(private classroomRepo: ClassroomRepository) {}

    async ensureCanGenerate(classroomCode: string): Promise<Classroom> {
        const classroom = await this.classroomRepo.findByCode(classroomCode)

        if (!classroom) {
            throw new AppError(404, 'Classroom not found')
        }

        if (!classroom.is_active) {
            throw new AppError(410, 'Session closed')
        }

        if (classroom.expires_at && new Date() > new Date(classroom.expires_at)) {
            await this.classroomRepo.deactivate(classroom.id)
            throw new AppError(410, 'Classroom has expired')
        }

        return classroom
    }
}
