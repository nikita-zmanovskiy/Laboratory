import { Module } from '@nestjs/common'
import { WsController } from '../controllers/ws.controller'
import { CsrfModule } from './csrf.module'

@Module({
    imports: [CsrfModule],
    controllers: [WsController],
})
export class WsModule {}
