const request = require('supertest');
const { app } = require('../src/server');
const fs = require('fs');
const path = require('path');

jest.mock('../src/core/automation', () => ({
    runAutomation: jest.fn().mockResolvedValue({ success: true })
}));

describe('Dashboard API', () => {
    test('GET /api/config should return config object', async () => {
        const res = await request(app).get('/api/config');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('targets');
        expect(Array.isArray(res.body.targets)).toBe(true);
    });

    test('POST /api/config should update config', async () => {
        const newConfig = {
            targets: ['user1', 'user2'],
            message: 'Test message'
        };
        const res = await request(app).post('/api/config').send(newConfig);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        // Verify it was written (mock fs would be better but integration test is fine here if we revert)
        // We will skip reverting for now as it's a dev env
    });

    test('GET /api/logs should return logs array', async () => {
        const res = await request(app).get('/api/logs');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('POST /api/run should trigger automation', async () => {
        const res = await request(app).post('/api/run');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
