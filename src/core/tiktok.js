const { SELECTORS, URLS, COOKIES_PATH } = require('../config/constants');
const { randomDelay } = require('../utils/common');
const logger = require('../utils/logger');
const browserManager = require('./browser');

class TikTokAutomation {
    constructor() {
        this.page = null;
    }

    async init() {
        this.page = await browserManager.getPage();
    }

    async loginCheck() {
        logger.info('Checking login status...');
        await this.page.goto(URLS.BASE, { waitUntil: 'networkidle2' });

        try {
            await this.page.waitForSelector(SELECTORS.PROFILE.ICON, { timeout: 10000 });
            logger.info('Login confirmed (Profile Icon found).');
            return true;
        } catch (e) {
            try {
                await this.page.waitForSelector(SELECTORS.PROFILE.UPLOAD_BUTTON, { timeout: 5000 });
                logger.info('Login confirmed (Upload Button found).');
                return true;
            } catch (e2) {
                logger.warn('Not logged in.');
                return false;
            }
        }
    }

    async manualLogin() {
        logger.info('Starting manual login flow...');
        await this.page.goto(URLS.LOGIN, { waitUntil: 'networkidle2' });

        logger.info('Please log in manually in the browser window.');

        let isLoggedIn = false;
        while (!isLoggedIn) {
            if (await this.page.$(SELECTORS.PROFILE.ICON) || await this.page.$(SELECTORS.PROFILE.UPLOAD_BUTTON)) {
                isLoggedIn = true;
                logger.info('Login detected!');
            } else {
                if (this.page.isClosed()) {
                    throw new Error('Browser closed by user.');
                }
                await randomDelay(2000, 3000);
            }
        }

        await browserManager.saveCookies(COOKIES_PATH);
    }

    async sendMessage(username, message) {
        logger.info(`Navigating to user: ${username}`);
        try {
            await this.page.goto(`${URLS.BASE}/@${username}`, { waitUntil: 'networkidle2' });
            await randomDelay(2000, 4000);

            const messageButton = await this.page.waitForSelector(SELECTORS.PROFILE.MESSAGE_BUTTON, { timeout: 5000 }).catch(() => null);

            if (!messageButton) {
                logger.warn(`Message button not found for ${username}. Skipping.`);
                return false;
            }

            await messageButton.click();
            logger.info('Clicked message button.');

            // Wait for potential navigation or modal
            await randomDelay(3000, 5000);

            const inputField = await this.page.waitForSelector(SELECTORS.CHAT.INPUT_EDITOR, { timeout: 10000 }).catch(() => null);

            if (inputField) {
                await inputField.type(message, { delay: 100 });
                await randomDelay(1000, 2000);
                await this.page.keyboard.press('Enter');
                logger.info(`Message sent to ${username}`);
                return true;
            } else {
                logger.warn(`Chat input not found for ${username}`);
                return false;
            }

        } catch (error) {
            logger.error(`Error processing ${username}:`, error);
            return false;
        }
    }
}

module.exports = new TikTokAutomation();
