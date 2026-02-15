const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

(async () => {
    console.log('Launching browser for login...');
    console.log('Please log in to TikTok manually in the opened browser.');
    console.log('Keep this console open.');

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--start-maximized'],
        defaultViewport: null
    });

    const page = await browser.newPage();
    await page.goto('https://www.tiktok.com/login', { waitUntil: 'networkidle2' });

    console.log('Waiting for login... (Checking every 5 seconds)');

    // Maximizing browser window
    const session = await page.target().createCDPSession();
    await session.send('Browser.setWindowBounds', { windowId: (await session.send('Browser.getWindowForTarget')).windowId, bounds: { windowState: 'maximized' } });


    // Loop to check if logged in by looking for profile element or cookie specific to logged in users
    let isLoggedIn = false;
    while (!isLoggedIn) {
        try {
            // Check for an element that only appears when logged in (e.g., profile icon avatar)
            // The selector might change, but typically checking for the "Upload" button or profile picture is good.
            // Let's check for the user-avatar in the header.
            const profileSelector = 'div[data-e2e="profile-icon"]';
            // Or upload button
            const uploadSelector = 'a[href="/upload"]';

            if (await page.$(profileSelector) || await page.$(uploadSelector)) {
                isLoggedIn = true;
                console.log('Login detected!');
            } else {
                await new Promise(r => setTimeout(r, 5000));
            }
        } catch (e) {
            // Just wait and retry if page is navigating
            await new Promise(r => setTimeout(r, 5000));
        }

        // Also break if browser is closed
        if (browser.isConnected() === false) {
            console.log('Browser closed by user before login detection.');
            process.exit(1);
        }
    }

    // Save cookies
    const cookies = await page.cookies();
    fs.writeFileSync('./cookies.json', JSON.stringify(cookies, null, 2));
    console.log('Cookies saved to cookies.json');
    console.log('You can now close the browser and run send_dms.js');

    await browser.close();
})();
