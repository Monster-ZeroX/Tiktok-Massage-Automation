const config = require('../config');
const logger = require('../utils/logger');
const browserManager = require('./browser');
const tiktok = require('./tiktok');
const { randomDelay } = require('../utils/common');
const axios = require('axios');
const fs = require('fs');
const { COOKIES_PATH } = require('../config/constants');

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
            const msg = 'Cookies not found. Please run with "login" mode first.';
            logger.error(msg);
            return { success: false, message: msg };
        }

        await browserManager.init();
        const page = await browserManager.getPage();
        await browserManager.loadCookies(COOKIES_PATH);

        // Initialize TikTok module with page
        tiktok.page = page;

        const isLoggedIn = await tiktok.loginCheck();
        if (!isLoggedIn) {
            const msg = 'Session invalid/expired. Please login again.';
            logger.error(msg);
            await sendTelegramNotification(`TikTok Automation Failed: ${msg}`);
            await browserManager.close();
            return { success: false, message: msg };
        }

        // Reload config to get latest targets if they changed via dashboard
        delete require.cache[require.resolve('../config')];
        const currentConfig = require('../config');

        for (const target of currentConfig.tiktok.targets) {
            const result = await tiktok.sendMessage(target, currentConfig.tiktok.message);
            if (result) successCount++;
            else failCount++;
            await randomDelay(5000, 10000);
        }

        const summary = `TikTok Automation Completed.\nSuccess: ${successCount}\nFailed: ${failCount}`;
        logger.info(summary);
        await sendTelegramNotification(summary);
        return { success: true, message: summary, stats: { success: successCount, failed: failCount } };

    } catch (error) {
        logger.error('Fatal error during automation:', error);
        await sendTelegramNotification(`TikTok Automation Crashed: ${error.message}`);
        return { success: false, message: error.message };
    } finally {
        await browserManager.close();
    }
}

module.exports = { runAutomation };
