import { Injectable } from '@nestjs/common'
import { ClassroomRepository } from '../../repositories/classroom.repository'
import { AppError } from '../../utils/errors'

@Injectable()
export class ClassroomPolicy {
    constructor(private classroomRepo: ClassroomRepository) {}

    async ensureCanGenerate(
        classroomCode: string
    ): Promise<NonNullable<Awaited<ReturnType<ClassroomRepository['findByCode']>>>> {
        const classroom = await this.classroomRepo.findByCode(classroomCode)

        if (!classroom) {
            throw new AppError(404, 'Classroom not found')
        }

        if (!classroom.isActive) {
            throw new AppError(410, 'Session closed')
        }

        if (classroom.expiresAt && new Date() > new Date(classroom.expiresAt)) {
            await this.classroomRepo.deactivate(classroom.id)
            throw new AppError(410, 'Classroom has expired')
        }

        return classroom
    }
}
