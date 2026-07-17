import { Module } from '@nestjs/common'
import { StatsController } from '../controllers/stats.controller'
import { ClassroomModule } from './classroom.module'
import { CsrfModule } from './csrf.module'

@Module({
    imports: [ClassroomModule, CsrfModule],
    controllers: [StatsController],
})
export class StatsModule {}
