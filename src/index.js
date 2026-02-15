const config = require('./config');
const logger = require('./utils/logger');
const browserManager = require('./core/browser');
const tiktok = require('./core/tiktok');
const { runAutomation } = require('./core/automation');
const cron = require('node-cron');
const { COOKIES_PATH } = require('./config/constants');
const fs = require('fs');

// Command line arguments
const args = process.argv.slice(2);
const mode = args[0] || 'run-once'; // run-once, login, schedule, dashboard

async function main() {
    logger.info(`Starting application in ${mode} mode.`);

    if (mode === 'login') {
        try {
            await browserManager.init();
            tiktok.page = await browserManager.getPage();
            // Start manual login
            const { URLS } = require('./config/constants'); // lazy load
            await tiktok.page.goto(URLS.LOGIN, { waitUntil: 'networkidle2' });
            logger.info('Navigate to login page. Please login manually.');

            await tiktok.manualLogin();

        } catch (error) {
            logger.error('Login process failed:', error);
        } finally {
            logger.info('Login sequence finished. Closing.');
            await browserManager.close();
        }
    } else if (mode === 'schedule') {
        logger.info('Scheduling automation for 9 AM and 5 PM.');

        // 9 AM
        cron.schedule('0 9 * * *', () => {
            logger.info('Running scheduled task (9 AM).');
            runAutomation();
        });

        // 5 PM
        cron.schedule('0 17 * * *', () => {
            logger.info('Running scheduled task (5 PM).');
            runAutomation();
        });

        logger.info('Scheduler running. Press Ctrl+C to exit.');
    } else if (mode === 'dashboard') {
        logger.info('Starting Dashboard Server...');
        require('./server').startServer();
    } else {
        // run-once
        await runAutomation();
    }
}

main();
