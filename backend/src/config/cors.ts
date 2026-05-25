import type { CorsOptions } from 'cors'
import { config } from './env.js'

export const corsOptions: CorsOptions = {
    origin: config.cors.origins,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
    credentials: config.cors.credentials,
    maxAge: config.cors.maxAge,
    optionsSuccessStatus: 204,
}
