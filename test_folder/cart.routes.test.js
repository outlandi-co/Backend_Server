import request from 'supertest';
import app from '../server.js';
describe('User Routes', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/users/register')
            .send({ name: 'Test User', email: 'test@example.com', password: '123456' });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
    });
});
