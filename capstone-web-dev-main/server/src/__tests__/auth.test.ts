import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';

describe('Authentication & Security API', () => {
  it('GET /health should return 200 and status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.timestamp).toBeDefined();
  });

  it('POST /api/auth/login should fail if email or password missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me should reject request without token (401 Unauthorized)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me should reject invalid/tampered token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid_tampered_token_string');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/refresh should reject missing refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Role verification token signing produces valid payload', () => {
    const payload = { id: 'user123', email: 'test@university.edu', role: 'STUDENT', name: 'Test User' };
    const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: '15m' });
    const decoded = jwt.verify(token, jwtConfig.secret) as any;
    expect(decoded.id).toBe('user123');
    expect(decoded.role).toBe('STUDENT');
  });
});
