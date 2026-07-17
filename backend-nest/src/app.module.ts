import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from '../prisma/prisma.module'
import { RepositoriesModule } from './repositories/repositories.module'
import { ClassroomModule } from './modules/classroom.module'
import { LogsModule } from './modules/logs.module'
import { StatsModule } from './modules/stats.module'
import { CsrfModule } from './modules/csrf.module'
import { HealthModule } from './modules/health.module'
import { WsModule } from './modules/ws.module'
import { GenerateModule } from './modules/generate.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { CsrfGuard } from './common/guards/csrf.guard'
import { RateLimitGuard } from './common/guards/rate-limit.guard'
import { ClassroomContextGuard } from './common/guards/classroom-context.guard'
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
        }),
        PrismaModule,
        RepositoriesModule,
        ClassroomModule,
        LogsModule,
        StatsModule,
        CsrfModule,
        HealthModule,
        WsModule,
        GenerateModule,
    ],
    providers: [
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: RequestContextInterceptor },
        { provide: APP_GUARD, useClass: RateLimitGuard },
        { provide: APP_GUARD, useClass: CsrfGuard },
        { provide: APP_GUARD, useClass: ClassroomContextGuard },
    ],
})
export class AppModule {}
