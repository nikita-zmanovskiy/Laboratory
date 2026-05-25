import axios from 'axios'
import crypto from 'crypto'
import https from 'https'
import fs from 'fs'
import path from 'path'
import { config } from '../../config/env.js'
import { AppError } from '../../utils/errors.js'
import { logger } from '../../utils/logger.js'

interface TokenCache {
    accessToken: string
    expiresAt: number
}

function getHttpsAgent(): https.Agent {
    const certPaths = [
        path.join(process.cwd(), 'russian_trusted_root_ca.cer'),
        path.join(process.cwd(), 'src/tests/russian_trusted_root_ca.cer'),
    ]

    for (const certPath of certPaths) {
        if (fs.existsSync(certPath)) {
            return new https.Agent({ ca: fs.readFileSync(certPath) })
        }
    }

    return new https.Agent({ rejectUnauthorized: false })
}

export class GigaChatAuthService {
    private tokenCache: TokenCache | null = null
    private httpsAgent: https.Agent

    constructor() {
        this.httpsAgent = getHttpsAgent()
    }

    async getAccessToken(): Promise<string> {
        if (this.tokenCache && Date.now() < this.tokenCache.expiresAt - 120000) {
            //можно ли использовать токен или нужен новый
            return this.tokenCache.accessToken
        }

        try {
            const authKey = config.gigachat.clientSecret,
                rquid = crypto.randomUUID()

            const response = await axios.post(
                config.gigachat.authUrl,
                new URLSearchParams({ scope: 'GIGACHAT_API_PERS' }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Accept: 'application/json',
                        RqUID: rquid,
                        Authorization: `Basic ${authKey}`,
                    },
                    httpsAgent: this.httpsAgent,
                    timeout: 10000,
                }
            )
            if (!response.data.access_token) {
                throw new Error('no access token in response')
            }

            this.tokenCache = {
                accessToken: response.data.access_token,
                expiresAt: response.data.expires_at,
            }
            return this.tokenCache.accessToken
        } catch (error: unknown) {
            const status = axios.isAxiosError(error) ? error.response?.status : undefined
            logger.error('gigaChat auth - error', { status })
            throw new AppError(503, 'failed gigaChat API')
        }
    }
}
