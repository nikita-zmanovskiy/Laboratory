import http from 'k6/http'
import { check, sleep } from 'k6'
import { BASE_URL } from './config.js'

export const options = {
    vus: 5,
    duration: '20s',
    thresholds: {
        http_req_failed: ['rate<0.01'],
    },
}

export default function () {
    const res = http.get(`${BASE_URL}/api/csrf/token?session_id=load-test-${__VU}`)
    check(res, {
        'status is 200': (r) => r.status === 200,
        'has token': (r) => JSON.parse(r.body).csrf_token !== undefined,
    })
    sleep(1)
}
