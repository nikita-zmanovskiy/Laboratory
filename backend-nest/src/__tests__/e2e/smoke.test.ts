import request from 'supertest'
import { getApp } from '../helpers/app'

let app: Awaited<ReturnType<typeof getApp>>

describe('E2E smoke', () => {
    beforeAll(async () => {
        app = await getApp()
    })

    it('serves the health endpoint', async () => {
        const response = await request(app).get('/health')

        expect([200, 503]).toContain(response.status)
        expect(response.body).toHaveProperty('status')
        expect(response.body.services).toHaveProperty('api', 'healthy')
    })

    it('serves OpenAPI contract json', async () => {
        const response = await request(app).get('/api-docs.json')

        expect(response.status).toBe(200)
        expect(response.body.openapi).toBe('3.0.0')
        expect(response.body.info.title).toBeTruthy()
    })
})
