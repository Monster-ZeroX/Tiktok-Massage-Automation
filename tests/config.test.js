const config = require('../src/config');

describe('Configuration Loader', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    test('should load default values', () => {
        // Mock config.json emptiness by ensuring the require resolves to empty or mock fs
        // For simplicity, we test the exports directly assuming no env vars set for some
        expect(config.app.logLevel).toBe('info');
    });

    test('should load from environment variables', () => {
        process.env.TIKTOK_USERNAME = 'test_user';
        process.env.HEADLESS = 'true';

        // Re-require to pick up env vars
        jest.resetModules();
        const newConfig = require('../src/config');

        expect(newConfig.tiktok.username).toBe('test_user');
        expect(newConfig.app.headless).toBe(true);
    });
});
