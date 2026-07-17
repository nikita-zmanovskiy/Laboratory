import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/services/prisma.service'

@Injectable()
export class ClassroomRepository {
    constructor(private prisma: PrismaService) {}

    async findByCode(code: string) {
        return this.prisma.classroom.findFirst({
            where: {
                code: {
                    equals: code,
                    mode: 'insensitive',
                },
            },
        })
    }

    async getStats(code: string) {
        const basicStats = await this.prisma.requestLog.aggregate({
            where: {
                classroom: {
                    code: {
                        equals: code,
                        mode: 'insensitive',
                    },
                },
            },
            _count: { _all: true },
            _avg: { responseTimeMs: true },
            _min: { timestamp: true },
            _max: { timestamp: true },
        })

        const textRequests = await this.prisma.requestLog.count({
            where: {
                classroom: { code: { equals: code, mode: 'insensitive' } },
                mode: 'text',
            },
        })

        const imageRequests = await this.prisma.requestLog.count({
            where: {
                classroom: { code: { equals: code, mode: 'insensitive' } },
                mode: 'image',
            },
        })

        const errors = await this.prisma.requestLog.count({
            where: {
                classroom: { code: { equals: code, mode: 'insensitive' } },
                status: { gte: 400 },
            },
        })

        const activeSessions = await this.prisma.requestLog.groupBy({
            by: ['sessionId'],
            where: {
                classroom: { code: { equals: code, mode: 'insensitive' } },
            },
        })

        const classroomInfo = await this.prisma.classroom.findFirst({
            where: { code: { equals: code, mode: 'insensitive' } },
            select: { expiresAt: true },
        })

        const totalRequests = basicStats._count._all
        const errorRate =
            totalRequests > 0 ? ((errors / totalRequests) * 100).toFixed(1) + '%' : '0%'

        const topStudentsRaw = await this.prisma.requestLog.groupBy({
            by: ['sessionId'],
            where: {
                classroom: { code: { equals: code, mode: 'insensitive' } },
            },
            _count: { _all: true },
            _avg: {
                tokensInput: true,
                tokensOutput: true,
            },
            orderBy: { sessionId: 'asc' },
        })

        const topStudents = topStudentsRaw
            .sort((a, b) => (b._count._all ?? 0) - (a._count._all ?? 0))
            .slice(0, 10)

        const tokensOverTime = await this.prisma.$queryRaw<
            Array<{
                minute: Date
                avg_input: number
                avg_output: number
            }>
        >`
      SELECT 
        date_trunc('minute', timestamp) as minute,
        AVG(tokens_input)::INTEGER as avg_input,
        AVG(tokens_output)::INTEGER as avg_output
      FROM request_logs rl
      JOIN classrooms c ON rl.classroom_id = c.id
      WHERE UPPER(c.code) = UPPER(${code}) AND tokens_input > 0
      GROUP BY minute
      ORDER BY minute
    `

        const requestsPerMinute = await this.prisma.$queryRaw<
            Array<{
                minute: string
                count: number
            }>
        >`
      SELECT 
        to_char(date_trunc('minute', timestamp), 'HH24:MI') as minute,
        COUNT(*)::INTEGER as count
      FROM request_logs rl
      JOIN classrooms c ON rl.classroom_id = c.id
      WHERE UPPER(c.code) = UPPER(${code})
      GROUP BY date_trunc('minute', timestamp)
      ORDER BY date_trunc('minute', timestamp)
    `

        const avgTokens = await this.prisma.requestLog.aggregate({
            where: {
                classroom: { code: { equals: code, mode: 'insensitive' } },
                tokensInput: { gt: 0 },
            },
            _avg: {
                tokensInput: true,
                tokensOutput: true,
            },
        })

        const avgTokensSum = Math.round(
            (avgTokens._avg.tokensInput || 0) + (avgTokens._avg.tokensOutput || 0)
        )

        return {
            total_requests: totalRequests,
            text_requests: textRequests,
            image_requests: imageRequests,
            errors,
            avg_response_time: Math.round(basicStats._avg.responseTimeMs || 0),
            active_sessions: activeSessions.length,
            first_request: basicStats._min.timestamp,
            last_request: basicStats._max.timestamp,
            error_rate: errorRate,
            expires_at: classroomInfo?.expiresAt || null,
            top_students: topStudents.map((r) => ({
                session_id: r.sessionId,
                requests: r._count?._all ?? 0,
                avg_tokens: Math.round(
                    ((r._avg?.tokensInput ?? 0) + (r._avg?.tokensOutput ?? 0)) / 2
                ),
            })),
            charts: {
                tokens_over_time: tokensOverTime.map((r) => ({
                    timestamp: r.minute,
                    input: r.avg_input,
                    output: r.avg_output,
                })),
                requests_per_minute: requestsPerMinute.map((r) => ({
                    minute: r.minute,
                    count: r.count,
                })),
                mode_distribution: {
                    text: textRequests,
                    image: imageRequests,
                },
                avg_tokens_per_request: avgTokensSum,
                avg_response_time: Math.round(basicStats._avg.responseTimeMs || 0),
                error_rate: parseFloat(errorRate),
                total_requests: totalRequests,
                active_students: activeSessions.length,
            },
        }
    }

    async getGlobalStats() {
        const rows = await this.prisma.$queryRaw<
            Array<{
                total_classrooms: number
                active_classrooms: number
                total_requests: number
                total_sessions: number
            }>
        >`
      SELECT 
        COUNT(DISTINCT c.id)::INTEGER as total_classrooms,
        COUNT(DISTINCT CASE WHEN c.is_active THEN c.id END)::INTEGER as active_classrooms,
        COUNT(rl.id)::INTEGER as total_requests,
        COUNT(DISTINCT rl.session_id)::INTEGER as total_sessions
      FROM classrooms c
      LEFT JOIN request_logs rl ON rl.classroom_id = c.id
    `
        return rows[0]
    }

    async cleanupExpiredClassrooms(): Promise<string[]> {
        const expired = await this.prisma.classroom.findMany({
            where: {
                isActive: true,
                expiresAt: { not: null, lt: new Date() },
            },
            select: { id: true, code: true },
        })

        if (expired.length === 0) {
            return []
        }

        await this.prisma.classroom.updateMany({
            where: { id: { in: expired.map((e) => e.id) } },
            data: { isActive: false },
        })

        return expired.map((e) => e.code)
    }

    async setTeacherToken(id: string, token: string) {
        await this.prisma.classroom.update({
            where: { id },
            data: { teacherToken: token },
        })
    }

    async getTeacherToken(code: string) {
        const classroom = await this.prisma.classroom.findFirst({
            where: {
                code: { equals: code, mode: 'insensitive' },
            },
            select: { teacherToken: true },
        })
        return classroom?.teacherToken || null
    }

    async findByTitle(title: string) {
        return this.prisma.classroom.findFirst({
            where: {
                title,
                isActive: true,
            },
        })
    }

    async extend(code: string, additionalMinutes: number) {
        const classroom = await this.findByCode(code)
        if (!classroom?.expiresAt) {
            return null
        }

        return this.prisma.classroom.update({
            where: { id: classroom.id },
            data: {
                expiresAt: new Date(classroom.expiresAt.getTime() + additionalMinutes * 60 * 1000),
            },
        })
    }

    async create(data: {
        id: string
        code: string
        title: string
        expiresAt: Date | null
        grade?: number
    }) {
        return this.prisma.classroom.create({
            data: {
                id: data.id,
                code: data.code,
                title: data.title,
                expiresAt: data.expiresAt,
                grade: data.grade || 11,
            },
        })
    }

    async deactivate(id: string) {
        await this.prisma.classroom.update({
            where: { id },
            data: { isActive: false },
        })
    }
}
