import { Module } from '@nestjs/common'
import { CsrfController } from '../controllers/csrf.controller'
import { CsrfService } from '../services/csrf.service'
import { RateLimitService } from '../services/rateLimit.service'

@Module({
    controllers: [CsrfController],
    providers: [CsrfService, RateLimitService],
    exports: [CsrfService, RateLimitService],
})
export class CsrfModule {}
