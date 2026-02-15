module.exports = {
    SELECTORS: {
        PROFILE: {
            ICON: 'div[data-e2e="profile-icon"]',
            UPLOAD_BUTTON: 'a[href="/upload"]',
            MESSAGE_BUTTON: 'button[data-e2e="message-button"]'
        },
        CHAT: {
            INPUT_EDITOR: 'div[contenteditable="true"][role="textbox"]'
        }
    },
    URLS: {
        BASE: 'https://www.tiktok.com',
        LOGIN: 'https://www.tiktok.com/login',
        UPLOAD: 'https://www.tiktok.com/upload'
    },
    COOKIES_PATH: './cookies.json'
};
