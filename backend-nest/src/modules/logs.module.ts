import { Module } from '@nestjs/common'
import { LogsController } from '../controllers/logs.controller'
import { LogService } from '../services/log.service'

@Module({
    controllers: [LogsController],
    providers: [LogService],
})
export class LogsModule {}
