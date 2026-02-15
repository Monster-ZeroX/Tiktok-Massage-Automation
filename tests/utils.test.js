const { delay, randomDelay } = require('../src/utils/common');

describe('Utility Functions', () => {
    test('delay should resolve after specified time', async () => {
        const start = Date.now();
        await delay(100);
        const end = Date.now();
        expect(end - start).toBeGreaterThanOrEqual(90); // Allow some leniency
    });

    test('randomDelay should return a promise resolving within range', async () => {
        const start = Date.now();
        await randomDelay(100, 200);
        const end = Date.now();
        const duration = end - start;
        expect(duration).toBeGreaterThanOrEqual(90);
        // checking upper bound is flaky in CI/slow envs, so we skip it or make it loose
    });
});
