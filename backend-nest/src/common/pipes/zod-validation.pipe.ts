import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import { ZodError, ZodObject, ZodTypeAny } from 'zod'

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: ZodObject) {}

    async transform(value: unknown) {
        try {
            // Nest @Body() передаёт только body, а схемы из Express ожидают { body, query, params }
            const payload = this.wrapBodyIfNeeded(value)
            const parsed = await this.schema.parseAsync(payload)
            return (parsed as { body?: unknown }).body ?? parsed
        } catch (error) {
            throw new BadRequestException({
                error: 'Validation failed',
                details: error instanceof ZodError ? error.issues : 'Invalid request',
            })
        }
    }

    private wrapBodyIfNeeded(value: unknown): unknown {
        const shape = this.schema.shape as Record<string, ZodTypeAny | undefined>
        if (!shape?.body) {
            return value
        }

        if (value && typeof value === 'object' && !Array.isArray(value) && !('body' in value)) {
            return { body: value }
        }

        return value
    }
}
