import { Injectable } from '@nestjs/common'
import { LogRepository } from '../repositories/log.repository'

@Injectable()
export class LogService {
    constructor(private logRepo: LogRepository) {}

    async getLogsByClassroomCode(classroomCode: string) {
        return this.logRepo.findByClassroomCode(classroomCode)
    }

    async getLogsByClassroomCodePaginated(
        classroomCode: string,
        page: number = 1,
        limit: number = 20,
        filters?: {
            search?: string
            mode?: string
            status?: string
            image_attached?: string
            sort?: string
        }
    ) {
        return this.logRepo.findByClassroomCodePaginated(classroomCode, page, limit, filters)
    }

    async createLog(data: {
        timestamp: Date
        classroom_id: string
        session_id: string
        mode: string
        prompt_hash?: string
        image_attached: boolean
        tokens_input: number
        tokens_output: number
        tokens_is_approximate: boolean
        status: number
        response_time_ms?: number
        error_message?: string
    }) {
        return this.logRepo.create({
            ...data,
            response_time_ms: data.response_time_ms ?? 0,
        })
    }
}
