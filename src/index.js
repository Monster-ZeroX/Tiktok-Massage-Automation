const config = require('./config');
const logger = require('./utils/logger');
const browserManager = require('./core/browser');
const tiktok = require('./core/tiktok');
const { delay, randomDelay } = require('./utils/common');
const axios = require('axios');
const cron = require('node-cron');
const { COOKIES_PATH } = require('./config/constants');
const fs = require('fs');

// Command line arguments
const args = process.argv.slice(2);
const mode = args[0] || 'run-once'; // run-once, login, schedule

async function sendTelegramNotification(message) {
    if (config.telegram.botToken && config.telegram.chatId) {
        try {
            const url = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;
            await axios.post(url, {
                chat_id: config.telegram.chatId,
                text: message
            });
            logger.info('Telegram notification sent.');
        } catch (error) {
            logger.error('Failed to send Telegram notification:', error);
        }
    }
}

async function runAutomation() {
    logger.info('Starting automation run...');
    let successCount = 0;
    let failCount = 0;

    try {
        if (!fs.existsSync(COOKIES_PATH)) {
            logger.error('Cookies not found. Please run with "login" mode first.');
            return;
        }

        await browserManager.init();
        const page = await browserManager.getPage();
        await browserManager.loadCookies(COOKIES_PATH);

        // Initialize TikTok module with page
        tiktok.page = page;

        const isLoggedIn = await tiktok.loginCheck();
        if (!isLoggedIn) {
            logger.error('Session invalid/expired. Please login again.');
            await sendTelegramNotification('TikTok Automation Failed: Session expired.');
            await browserManager.close();
            return;
        }

        for (const target of config.tiktok.targets) {
            const result = await tiktok.sendMessage(target, config.tiktok.message);
            if (result) successCount++;
            else failCount++;
            await randomDelay(5000, 10000);
        }

        const summary = `TikTok Automation Completed.\nSuccess: ${successCount}\nFailed: ${failCount}`;
        logger.info(summary);
        await sendTelegramNotification(summary);

    } catch (error) {
        logger.error('Fatal error during automation:', error);
        await sendTelegramNotification(`TikTok Automation Crashed: ${error.message}`);
    } finally {
        await browserManager.close();
    }
}

async function main() {
    logger.info(`Starting application in ${mode} mode.`);

    if (mode === 'login') {
        try {
            await browserManager.init();
            tiktok.page = await browserManager.getPage();
            // Start manual login
            await page.goto('https://www.tiktok.com/login', { waitUntil: 'networkidle2' });
            logger.info('Navigate to login page. Please login manually.');

            // Wait for user to login
            // For now, we reuse the logic from the old script but slightly cleaner
            // ... actually tiktok.manualLogin() does this.
            await tiktok.manualLogin();

        } catch (error) {
            logger.error('Login process failed:', error);
        } finally {
            // prompt user before closing? or just close
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
    } else {
        // run-once
        await runAutomation();
    }
}

main();
