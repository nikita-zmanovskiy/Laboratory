import { Controller, Get, HttpStatus, Res } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { PrismaService } from '../../prisma/services/prisma.service'
import { getMoscowISOString } from '../utils/moscowTime'

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(private prisma: PrismaService) {}

    @Get()
    async check(@Res() res: Response) {
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            moscow_time: getMoscowISOString(),
            uptime: process.uptime(),
            services: {
                api: 'healthy',
                database: 'unknown' as string,
            },
        }

        try {
            await this.prisma.$queryRaw`SELECT 1`
            health.services.database = 'healthy'
        } catch {
            health.services.database = 'unhealthy'
            health.status = 'degraded'
        }

        const statusCode = health.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE
        res.status(statusCode).json(health)
    }
}
