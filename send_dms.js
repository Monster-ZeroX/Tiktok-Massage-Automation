const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const config = require('./config.json');
const axios = require('axios');

puppeteer.use(StealthPlugin());

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

function randomDelay(min, max) {
    return delay(Math.floor(Math.random() * (max - min + 1) + min));
}

(async () => {
    if (!fs.existsSync('./cookies.json')) {
        console.error('Error: cookies.json not found. Run "node login.js" first.');
        process.exit(1);
    }

    const browser = await puppeteer.launch({
        headless: config.headless !== undefined ? config.headless : false,
        args: ['--start-maximized'],
        defaultViewport: null
    });

    const page = await browser.newPage();

    // Load cookies
    const cookiesString = fs.readFileSync('./cookies.json');
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);

    console.log('Navigate to TikTok Home for session check...');
    await page.goto('https://www.tiktok.com', { waitUntil: 'networkidle2' });

    // Validate Session
    try {
        await page.waitForSelector('div[data-e2e="profile-icon"]', { timeout: 10000 });
        console.log('Session valid.');
    } catch (e) {
        try {
            await page.waitForSelector('a[href="/upload"]', { timeout: 5000 });
            console.log('Session valid (Upload button found).');
        } catch (e2) {
            console.error('Session expired or not logged in. Please run "node login.js" again.');
            await browser.close();
            process.exit(1);
        }
    }

    for (const targetUser of config.targets) {
        console.log(`Processing user: ${targetUser}`);
        try {
            await page.goto(`https://www.tiktok.com/@${targetUser}`, { waitUntil: 'networkidle2' });
            await randomDelay(2000, 5000);

            // Click Message Button
            // Selector needs to be robust. 
            // "Message" button typically has text "Message"
            const messageButton = await page.waitForSelector('button[data-e2e="message-button"]', { timeout: 5000 }).catch(() => null);

            if (!messageButton) {
                console.log(`Could not find message button for ${targetUser}. May not be following or private.`);
                continue;
            }

            await messageButton.click();
            console.log('Clicked message button...');

            // Wait for chat input to appear. 
            // This might open a modal or navigate to /messages
            // TikTok web chat often opens a floating window or separate page.

            await randomDelay(3000, 6000);

            // Type message
            const editorSelector = 'div[contenteditable="true"][role="textbox"]';
            const inputField = await page.waitForSelector(editorSelector, { timeout: 10000 }).catch(() => null);

            if (inputField) {
                await inputField.type(config.message, { delay: 100 });
                await randomDelay(1000, 2000);

                // Press Enter or click send
                await page.keyboard.press('Enter');
                console.log(`Message sent to ${targetUser}`);
            } else {
                console.log(`Could not find chat input for ${targetUser}`);
            }

        } catch (error) {
            console.error(`Error sending to ${targetUser}:`, error);
        }

        await randomDelay(5000, 10000); // Wait between users
    }



    // Send Telegram Notification
    if (config.telegram && config.telegram.botToken && config.telegram.chatId) {
        try {
            const message = `TikTok Automation Completed.\nProcessed ${config.targets.length} users.`;
            const url = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;
            await axios.post(url, {
                chat_id: config.telegram.chatId,
                text: message
            });
            console.log('Telegram notification sent.');
        } catch (error) {
            console.error('Failed to send Telegram notification:', error.message);
        }
    }

    console.log('All done.');
    await browser.close();
})();
