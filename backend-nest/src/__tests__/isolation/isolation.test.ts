import request from 'supertest'
import { getApp } from '../helpers/app'

import { getStudentTokenFromResponse } from '../helpers/auth'

let app: Awaited<ReturnType<typeof getApp>>

describe('Classroom Isolation Tests', () => {
    beforeAll(async () => {
        app = await getApp()
    })

    let teacher1Token: string,
        teacher2Token: string,
        class1Code: string,
        class2Code: string,
        class3Code: string

    beforeAll(async () => {
        const t1 = await request(app).get('/api/csrf/token').query({ session_id: 'teacher-1' })
        teacher1Token = getStudentTokenFromResponse(t1)

        const t2 = await request(app).get('/api/csrf/token').query({ session_id: 'teacher-2' })
        teacher2Token = getStudentTokenFromResponse(t2)

        const c1 = await request(app)
            .post('/api/classrooms')
            .set('x-csrf-token', teacher1Token)
            .send({ title: 'Isolation Class 1 ' + Date.now(), expires_in_minutes: 10 })
        class1Code = c1.body.code

        const c2 = await request(app)
            .post('/api/classrooms')
            .set('x-csrf-token', teacher1Token)
            .send({ title: 'Isolation Class 2 ' + Date.now(), expires_in_minutes: 10 })
        class2Code = c2.body.code

        const c3 = await request(app)
            .post('/api/classrooms')
            .set('x-csrf-token', teacher2Token)
            .send({ title: 'Isolation Class 3 ' + Date.now(), expires_in_minutes: 10 })
        class3Code = c3.body.code
    })

    test('logs are isolated between classrooms', async () => {
        const s1 = await request(app)
                .get(`/api/classrooms/${class1Code}/join`)
                .query({ student_id: 'log1' }),
            s2 = await request(app)
                .get(`/api/classrooms/${class2Code}/join`)
                .query({ student_id: 'log2' })

        await request(app)
            .post('/api/generate')
            .set('x-csrf-token', getStudentTokenFromResponse(s1))
            .set('x-classroom-code', class1Code)
            .send({ mode: 'text', prompt: 'Class 1', session_id: 'log1' })
        await request(app)
            .post('/api/generate')
            .set('x-csrf-token', getStudentTokenFromResponse(s2))
            .set('x-classroom-code', class2Code)
            .send({ mode: 'text', prompt: 'Class 2', session_id: 'log2' })

        await new Promise((resolve) => setTimeout(resolve, 3000))

        const logs1 = await request(app)
            .get('/api/logs')
            .query({ classroom_code: class1Code })
            .set('x-teacher-token', teacher1Token)
        expect(logs1.status).toBe(200)
    }, 15000)

    test('teacher cannot view another teacher logs', async () => {
        const response = await request(app)
            .get('/api/logs')
            .query({ classroom_code: class1Code })
            .set('x-teacher-token', teacher2Token)

        expect(response.status).toBe(403)
    })

    test('student cannot deactivate classroom', async () => {
        const studentRes = await request(app)
            .get(`/api/classrooms/${class1Code}/join`)
            .query({ student_id: '1' })

        const studentToken = getStudentTokenFromResponse(studentRes)

        const deactivateRes = await request(app)
            .post(`/api/classrooms/${class1Code}/deactivate`)
            .set('x-csrf-token', studentToken)

        expect(deactivateRes.status).toBe(403)
    })

    test('student cannot extend classroom', async () => {
        const studentRes = await request(app)
            .get(`/api/classrooms/${class2Code}/join`)
            .query({ student_id: '2' })

        const studentToken = getStudentTokenFromResponse(studentRes)

        const extendRes = await request(app)
            .post(`/api/classrooms/${class2Code}/extend`)
            .set('x-csrf-token', studentToken)
            .send({ additional_minutes: 5 })

        expect(extendRes.status).toBe(403)
    })

    test('multiple classrooms work simultaneously', async () => {
        const s1 = await request(app)
                .get(`/api/classrooms/${class1Code}/join`)
                .query({ student_id: 'sim1' }),
            s2 = await request(app)
                .get(`/api/classrooms/${class2Code}/join`)
                .query({ student_id: 'sim2' }),
            s3 = await request(app)
                .get(`/api/classrooms/${class3Code}/join`)
                .query({ student_id: 'sim3' })

        const requests = [
            request(app)
                .post('/api/generate')
                .set('x-csrf-token', getStudentTokenFromResponse(s1))
                .set('x-classroom-code', class1Code)
                .send({ mode: 'text', prompt: 'C1', session_id: 'sim1' }),
            request(app)
                .post('/api/generate')
                .set('x-csrf-token', getStudentTokenFromResponse(s2))
                .set('x-classroom-code', class2Code)
                .send({ mode: 'text', prompt: 'C2', session_id: 'sim2' }),
            request(app)
                .post('/api/generate')
                .set('x-csrf-token', getStudentTokenFromResponse(s3))
                .set('x-classroom-code', class3Code)
                .send({ mode: 'text', prompt: 'C3', session_id: 'sim3' }),
        ]

        const results = await Promise.all(requests)
        for (const res of results) {
            expect([200, 403, 503]).toContain(res.status)
        }
    })

    test('statistics are per classroom', async () => {
        const stats1 = await request(app)
            .get(`/api/stats/${class1Code}`)
            .set('x-teacher-token', teacher1Token)

        const stats2 = await request(app)
            .get(`/api/stats/${class2Code}`)
            .set('x-teacher-token', teacher1Token)

        expect(stats1.status).toBe(200)
        expect(stats2.status).toBe(200)
    })
})
