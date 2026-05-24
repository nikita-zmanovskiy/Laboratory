import axios from 'axios'
import FormData from 'form-data'
import path from 'path'
import https from 'https'
import fs from 'fs'

import { config } from '../../config/env.js'
import { logger } from '../../utils/logger.js'
import { GigaChatAuthService } from './gigachatAuth.service.js'

export class GigaChatFilesService {
    private readonly authService: GigaChatAuthService

    constructor() {
        this.authService = new GigaChatAuthService()
    }

    async uploadImage(base64Image: string): Promise<string> {
        const token = await this.authService.getAccessToken()

        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')

        const form = new FormData()

        form.append('file', buffer, {
            filename: 'image.png',
            contentType: 'image/png',
        })

        form.append('purpose', 'general')

        const httpsAgent = this.createHttpsAgent()

        try {
            const response = await axios.post(
                `${config.gigachat.apiUrl}/files`,
                form,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        ...form.getHeaders(),
                    },
                    httpsAgent,
                    timeout: 30000,
                }
            )

            return response.data.id
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                logger.error('[GigaChat Upload] Error', {
                    status: error.response?.status,
                    data: error.response?.data,
                })
            }

            throw error
        }
    }

    async downloadImage(imageId: string): Promise<Buffer> {
        const token = await this.authService.getAccessToken()
        const httpsAgent = this.createHttpsAgent()

        try {
            const response = await axios.get<ArrayBuffer>(
                `${config.gigachat.apiUrl}/files/${imageId}/content`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'image/jpeg',
                    },
                    responseType: 'arraybuffer',
                    httpsAgent,
                    timeout: 30000,
                }
            )

            return Buffer.from(response.data)
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                logger.error('[GigaChat Download] Error', {
                    imageId,
                    status: error.response?.status,
                    data: error.response?.data,
                })
            }

            throw error
        }
    }

    private createHttpsAgent(): https.Agent {
        const certPath = path.join(process.cwd(), 'russian_trusted_root_ca.cer')
        const certExists = fs.existsSync(certPath)

        return new https.Agent({
            ca: certExists ? fs.readFileSync(certPath) : undefined,
            rejectUnauthorized: !certExists,
        })
    }
}