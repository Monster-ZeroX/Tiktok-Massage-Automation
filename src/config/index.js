require('dotenv').config();
const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, '../../config.json');
let fileConfig = {};

if (fs.existsSync(configPath)) {
    try {
        fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
        console.error('Error reading config.json:', error);
    }
}

module.exports = {
    tiktok: {
        username: process.env.TIKTOK_USERNAME || '',
        password: process.env.TIKTOK_PASSWORD || '',
        targets: fileConfig.targets || [],
        message: fileConfig.message || "Hello!",
    },
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || fileConfig.telegram?.botToken || '',
        chatId: process.env.TELEGRAM_CHAT_ID || fileConfig.telegram?.chatId || '',
    },
    app: {
        headless: process.env.HEADLESS === 'true' || fileConfig.headless || false,
        logLevel: process.env.LOG_LEVEL || 'info',
    }
};
