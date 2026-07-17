import request from 'supertest'
import { getApp } from '../helpers/app'

let app: Awaited<ReturnType<typeof getApp>>

describe('GET /health', () => {
    beforeAll(async () => {
        app = await getApp()
    })

    test('returns 200 with status ok', async () => {
        const response = await request(app).get('/health')
        expect(response.status).toBe(200)
        expect(response.body.status).toBe('ok')
        expect(response.body.services).toBeDefined()
        expect(response.body.services.api).toBe('healthy')
    })
})
