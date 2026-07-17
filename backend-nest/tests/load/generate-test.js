import http from 'k6/http'
import { check, sleep } from 'k6'
import { BASE_URL, CLASSROOM_CODE } from './config.js'

export const options = {
    stages: [
        { duration: '30s', target: 5 },
        { duration: '30s', target: 15 },
        { duration: '30s', target: 30 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.05'],
        http_req_duration: ['p(95)<60000'],
    },
}

export function setup() {
    if (!CLASSROOM_CODE) {
        throw new Error(
            'Укажите код класса: k6 run -e CLASSROOM_CODE=ABC123 tests/load/generate-test.js'
        )
    }
    return { classroomCode: CLASSROOM_CODE }
}

export default function (data) {
    const sessionId = `k6-${__VU}-${__ITER}`
    const tokenRes = http.get(`${BASE_URL}/api/csrf/token?session_id=${sessionId}`)
    const token = JSON.parse(tokenRes.body).csrf_token

    const res = http.post(
        `${BASE_URL}/api/generate`,
        JSON.stringify({
            mode: 'text',
            prompt: 'Say hello',
            session_id: sessionId,
        }),
        {
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': token,
                'x-classroom-code': data.classroomCode,
            },
        }
    )

    check(res, {
        'status is 200': (r) => r.status === 200,
    })

    sleep(3)
}
