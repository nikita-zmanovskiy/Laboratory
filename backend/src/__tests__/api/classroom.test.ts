import request from 'supertest'
import { app } from '../../app.js'
import { getStudentTokenFromResponse } from '../helpers/auth.js'

describe('Classroom API', () => {
    let csrfToken: string
    const ts = Date.now()

    beforeAll(async () => {
        const res = await request(app)
            .get('/api/csrf/token')
            .query({ session_id: 'test-classroom-' + ts })
        csrfToken = getStudentTokenFromResponse(res)
    })

    test('create classroom', async () => {
        const response = await request(app)
            .post('/api/classrooms')
            .set('x-csrf-token', csrfToken)
            .send({ title: 'API Test Class ' + ts, expires_in_minutes: 10 })

        expect(response.status).toBe(201)
        expect(response.body.code).toMatch(/^[A-Z0-9]{6}$/)
        expect(response.body.is_active).toBe(true)
    })

    test('duplicate title is allowed and returns 201', async () => {
        const ts = Date.now()
        const title = `API Test Class ${ts}`

        const firstResponse = await request(app)
            .post('/api/classrooms')
            .set('x-csrf-token', csrfToken)
            .send({ title, expires_in_minutes: 10 })

        expect(firstResponse.status).toBe(201)
        expect(firstResponse.body.title).toBe(title)
        expect(firstResponse.body.code).toMatch(/^[A-Z0-9]{6}$/)

        const secondResponse = await request(app)
            .post('/api/classrooms')
            .set('x-csrf-token', csrfToken)
            .send({ title, expires_in_minutes: 10 })

        expect(secondResponse.status).toBe(201)
        expect(secondResponse.body.title).toBe(title)
        expect(secondResponse.body.code).toMatch(/^[A-Z0-9]{6}$/)
        expect(secondResponse.body.code).not.toBe(firstResponse.body.code)
    })

    test('empty title returns 400', async () => {
        const response = await request(app)
            .post('/api/classrooms')
            .set('x-csrf-token', csrfToken)
            .send({ title: '', expires_in_minutes: 10 })

        expect(response.status).toBe(400)
    })

    test('student can join classroom', async () => {
        const classRes = await request(app)
            .post('/api/classrooms')
            .set('x-csrf-token', csrfToken)
            .send({ title: 'Join Test ' + ts, expires_in_minutes: 10 })

        const code = classRes.body.code

        const joinRes = await request(app)
            .get(`/api/classrooms/${code}/join`)
            .query({ student_id: '1' })

        expect(joinRes.status).toBe(200)
        expect(joinRes.body.classroom_code).toBe(code)
        expect(getStudentTokenFromResponse(joinRes)).toMatch(/^[a-f0-9]{64}$/)
    })
})
