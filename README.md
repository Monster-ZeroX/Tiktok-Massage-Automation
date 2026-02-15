# TikTok Automation Bot

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![Status](https://img.shields.io/badge/status-stable-green)

A robust, production-ready Node.js automation tool for sending messages on TikTok. This project uses [Puppeteer](https://pptr.dev/) with stealth plugins to automate browser interactions.

## Features

- **Automated Messaging**: Sends messages to a list of target users.
- **Stealth Mode**: Uses `puppeteer-extra-plugin-stealth` to evade detection.
- **Smart Scheduling**: Built-in support for running at specific times (e.g., 9 AM and 5 PM) using `node-cron`.
- **Telegram Notifications**: Sends status updates and error reports to your Telegram chat.
- **Robust Logging**: Detailed logs using `winston` for debugging and monitoring.
- **Configurable**: Easy configuration via `.env` file and `config.json`.

## Prerequisites

- Node.js (v14 or higher)
- Google Chrome installed (Puppeteer will launch its own instance, but having Chrome is good)

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd Tiktok-Massage-Automation
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Configuration**:
    - Copy `.env.example` to `.env`:
        ```bash
        cp .env.example .env
        ```
    - Fill in your `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `.env`.
    - (Optional) Adjust `config.json` for target users and message content.

## Usage

### 1. Login (First Run)

You must log in manually once to save your session cookies.

```bash
npm run login
```

- A browser window will open.
- Log in to TikTok manually.
- The bot will detect the login and save `cookies.json`.
- The browser will close automatically after success.

### 2. Run Once

To run the automation immediately:

```bash
npm start
```

### 4. Web Dashboard

To start the Web Dashboard for managing targets and viewing logs:

```bash
npm run dashboard
```

- Open `http://localhost:3000` in your browser.
- You can update configuration and trigger automation runs from the UI.

### 5. Docker

To run the application using Docker:

1.  **Build the image**:
    ```bash
    docker-compose build
    ```

2.  **Run the container**:
    ```bash
    docker-compose up -d
    ```

- The dashboard will be available at `http://localhost:3000`.
- Volumes are mounted so `config.json`, `cookies.json`, and `logs` persist.

## Configuration

### `config.json`
- `targets`: Array of usernames to message.
- `message`: The message content.
- `headless`: Boolean to fallback if env var is not set.

### `.env`
- `TIKTOK_USERNAME` / `TIKTOK_PASSWORD`: (Reserved for future auto-login).
- `TELEGRAM_BOT_TOKEN`: Your Telegram Bot Token.
- `TELEGRAM_CHAT_ID`: Your Telegram Chat ID.
- `HEADLESS`: `true` or `false` (default `false` recommended for TikTok).
- `LOG_LEVEL`: `info`, `debug`, or `error`.

## Roadmap

- [ ] **Auto Login**: Implement full auto-login with username/password (bypassing captcha might be tricky).
- [ ] **Docker Support**: Containerize the application for easier deployment.
- [ ] **Dashboard**: A simple web UI to manage targets and view logs.
- [ ] **Proxy Support**: Add support for rotating proxies to avoid IP bans.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This tool is for educational purposes only. Automating interactions on TikTok may violate their Terms of Service. Use at your own risk. The authors are not responsible for any account bans or restrictions.
