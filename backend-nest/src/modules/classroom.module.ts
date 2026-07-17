import { Module } from '@nestjs/common'
import { ClassroomController } from '../controllers/classroom.controller'
import { ClassroomService } from '../services/classroom.service'
import { WebSocketService } from '../services/websocket.service'
import { CsrfModule } from './csrf.module'

@Module({
    imports: [CsrfModule],
    controllers: [ClassroomController],
    providers: [ClassroomService, WebSocketService],
    exports: [ClassroomService, WebSocketService],
})
export class ClassroomModule {}
