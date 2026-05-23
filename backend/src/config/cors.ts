import type { CorsOptions } from 'cors'
import { config } from './env.js'

export const corsOptions: CorsOptions = {
    origin: config.cors.origins,
    credentials: true,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
}
