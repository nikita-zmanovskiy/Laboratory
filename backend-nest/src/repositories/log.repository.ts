import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/services/prisma.service'

@Injectable()
export class LogRepository {
    constructor(private prisma: PrismaService) {}

    async findByClassroomCode(classroomCode: string) {
        return this.prisma.requestLog.findMany({
            where: {
                classroom: {
                    code: {
                        equals: classroomCode,
                        mode: 'insensitive',
                    },
                },
            },
            orderBy: { timestamp: 'desc' },
            take: 100,
        })
    }

    async findByClassroomCodePaginated(
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
        const offset = (page - 1) * limit

        const where: Prisma.RequestLogWhereInput = {
            classroom: {
                code: {
                    equals: classroomCode,
                    mode: 'insensitive',
                },
            },
        }

        if (filters?.search) {
            where.sessionId = {
                contains: filters.search,
                mode: 'insensitive',
            }
        }

        if (filters?.mode && filters.mode !== 'all') {
            where.mode = filters.mode
        }

        if (filters?.status === 'success') {
            where.status = 200
        } else if (filters?.status === 'error') {
            where.status = { gte: 400 }
        }

        if (filters?.image_attached === 'with_image') {
            where.imageAttached = true
        } else if (filters?.image_attached === 'no_image') {
            where.imageAttached = false
        }

        const orderBy: Prisma.RequestLogOrderByWithRelationInput = {
            timestamp: filters?.sort === 'oldest' ? 'asc' : 'desc',
        }

        const total = await this.prisma.requestLog.count({ where })
        const logs = await this.prisma.requestLog.findMany({
            where,
            orderBy,
            skip: offset,
            take: limit,
        })

        return {
            logs,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }
    }

    async create(log: {
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
        response_time_ms: number
        error_message?: string
    }) {
        return this.prisma.requestLog.create({
            data: {
                timestamp: log.timestamp,
                classroomId: log.classroom_id,
                sessionId: log.session_id,
                mode: log.mode,
                promptHash: log.prompt_hash,
                imageAttached: log.image_attached,
                tokensInput: log.tokens_input,
                tokensOutput: log.tokens_output,
                tokensIsApproximate: log.tokens_is_approximate,
                status: log.status,
                responseTimeMs: log.response_time_ms,
                errorMessage: log.error_message,
            },
        })
    }
}
