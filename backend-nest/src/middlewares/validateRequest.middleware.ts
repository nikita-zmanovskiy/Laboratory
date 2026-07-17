import type { Request, Response, NextFunction } from 'express'
import { ZodError, type ZodObject } from 'zod'

export const validate =
    (schema: ZodObject) => async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            })
            req.body = parsed.body
            req.query = parsed.query as Request['query']
            req.params = parsed.params as Request['params']
            return next()
        } catch (error: unknown) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error instanceof ZodError ? error.issues : 'Invalid request',
            })
        }
    }
