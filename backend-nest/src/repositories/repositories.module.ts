import { Global, Module } from '@nestjs/common'
import { ClassroomRepository } from './classroom.repository'
import { LogRepository } from './log.repository'

@Global()
@Module({
    providers: [ClassroomRepository, LogRepository],
    exports: [ClassroomRepository, LogRepository],
})
export class RepositoriesModule {}
