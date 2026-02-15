const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const config = require('../config');
const logger = require('../utils/logger');

puppeteer.use(StealthPlugin());

class BrowserManager {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        try {
            logger.info('Launching browser...');
            this.browser = await puppeteer.launch({
                headless: config.app.headless,
                args: ['--start-maximized'],
                defaultViewport: null
            });

            this.page = await this.browser.newPage();

            // Maximize window by default
            try {
                const session = await this.page.target().createCDPSession();
                const window = await session.send('Browser.getWindowForTarget');
                await session.send('Browser.setWindowBounds', {
                    windowId: window.windowId,
                    bounds: { windowState: 'maximized' }
                });
            } catch (err) {
                logger.warn('Could not maximize window via CDP (might be headless mode or not supported)', err);
            }

            logger.info('Browser launched successfully.');
            return this.page;
        } catch (error) {
            logger.error('Failed to launch browser:', error);
            throw error;
        }
    }

    async close() {
        if (this.browser) {
            logger.info('Closing browser...');
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }

    async getPage() {
        if (!this.page) {
            throw new Error('Browser not initialized. Call init() first.');
        }
        return this.page;
    }

    async loadCookies(cookiesPath) {
        const fs = require('fs');
        if (fs.existsSync(cookiesPath)) {
            try {
                const cookiesString = fs.readFileSync(cookiesPath);
                const cookies = JSON.parse(cookiesString);
                await this.page.setCookie(...cookies);
                logger.info(`Loaded ${cookies.length} cookies.`);
            } catch (error) {
                logger.error('Error loading cookies:', error);
                throw error;
            }
        } else {
            logger.warn('No cookies found at ' + cookiesPath);
        }
    }

    async saveCookies(cookiesPath) {
        const fs = require('fs');
        try {
            const cookies = await this.page.cookies();
            fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
            logger.info(`Saved ${cookies.length} cookies to ${cookiesPath}`);
        } catch (error) {
            logger.error('Error saving cookies:', error);
            throw error;
        }
    }
}

module.exports = new BrowserManager();
