import request from 'supertest';
import { app } from '../../app.js';

async function getSessionCookie(sessionId: string) {
  const tokenRes = await request(app)
    .get(`/api/csrf/token?session_id=${sessionId}`);

  return tokenRes.headers['set-cookie'];
}

async function createClassroom() {
  const teacherSessionId = `teacher-${Date.now()}`;
  const cookie = await getSessionCookie(teacherSessionId);

  const classroomRes = await request(app)
    .post('/api/classrooms')
    .set('Cookie', cookie)
    .send({
      title: `Test lesson ${Date.now()}`,
      expires_in_minutes: 60,
      grade: 8,
    });

  expect(classroomRes.status).toBe(201);

  return classroomRes.body.code as string;
}

async function joinClassroom(classroomCode: string) {
  const joinRes = await request(app)
    .get(`/api/classrooms/${classroomCode}/join?student_id=test-student`);

  expect(joinRes.status).toBe(200);

  return joinRes.headers['set-cookie'];
}

describe('generate security', () => {
  it('rejects generate request without CSRF token', async () => {
    const res = await request(app)
      .post('/api/generate')
      .send({
        mode: 'text',
        prompt: 'hello',
        classroom_code: 'ABC123',
        session_id: 'student-1',
      });

    expect(res.status).toBe(403);
  });

  it('rejects invalid classroom code format', async () => {
    const cookie = await getSessionCookie('student-1');

    const res = await request(app)
      .post('/api/generate')
      .set('Cookie', cookie)
      .send({
        mode: 'text',
        prompt: 'hello',
        classroom_code: 'bad',
        session_id: 'student-1',
      });

    expect(res.status).toBe(400);
  });

  it('rejects prompt longer than 1000 chars', async () => {
    const classroomCode = await createClassroom();
    const studentCookie = await joinClassroom(classroomCode);

    const res = await request(app)
      .post('/api/generate')
      .set('Cookie', studentCookie)
      .send({
        mode: 'text',
        prompt: 'a'.repeat(1001),
        classroom_code: classroomCode,
        session_id: `student-${classroomCode}-test-student`,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});