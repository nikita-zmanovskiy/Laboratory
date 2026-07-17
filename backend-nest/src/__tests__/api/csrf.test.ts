import request from 'supertest'
import { getApp } from '../helpers/app'

import { getStudentTokenFromResponse } from '../helpers/auth'

let app: Awaited<ReturnType<typeof getApp>>

describe('GET /api/csrf/token', () => {
    beforeAll(async () => {
        app = await getApp()
    })

    test('returns token', async () => {
        const response = await request(app)
            .get('/api/csrf/token')
            .query({ session_id: 'test-session' })

        expect(response.status).toBe(200)
        const token = getStudentTokenFromResponse(response)
        expect(token).toMatch(/^[a-f0-9]{64}$/)
        expect(response.body.session_id).toBe('test-session')
        expect(response.body.is_new).toBe(true)
    })

    test('returns same token for same session', async () => {
        const res1 = await request(app).get('/api/csrf/token').query({ session_id: 'same-session' })

        const res2 = await request(app).get('/api/csrf/token').query({ session_id: 'same-session' })

        expect(getStudentTokenFromResponse(res1)).toBe(getStudentTokenFromResponse(res2))
        expect(res2.body.is_new).toBe(false)
    })
})
