const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const logger = require('./utils/logger');
const { runAutomation } = require('./core/automation');
const constantConfig = require('./config/constants');

const app = express();
const PORT = process.env.PORT || 3000;
const CONFIG_FILE = path.resolve(__dirname, '../config.json');
const LOG_FILE = path.resolve(__dirname, '../logs/combined.log');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// API: Get Config
app.get('/api/config', (req, res) => {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
            res.json(data);
        } else {
            res.json({});
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Update Config
app.post('/api/config', (req, res) => {
    try {
        const newConfig = req.body;
        // Validate basic structure
        if (!Array.isArray(newConfig.targets) || typeof newConfig.message !== 'string') {
            return res.status(400).json({ error: 'Invalid config format' });
        }

        // Preserve other keys in config.json if any
        let currentConfig = {};
        if (fs.existsSync(CONFIG_FILE)) {
            currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        }

        const updatedConfig = { ...currentConfig, ...newConfig };
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 4));

        logger.info('Configuration updated via Dashboard.');
        res.json({ success: true });
    } catch (error) {
        logger.error('Failed to update config:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Get Logs
app.get('/api/logs', (req, res) => {
    try {
        if (fs.existsSync(LOG_FILE)) {
            const logs = fs.readFileSync(LOG_FILE, 'utf8');
            // Return last 100 lines roughly (or just send all if small)
            // For simplicity sending all, but splitting by newline for frontend
            const logLines = logs.trim().split('\n').map(line => {
                try { return JSON.parse(line); } catch (e) { return null; }
            }).filter(l => l !== null).reverse().slice(0, 100);

            res.json(logLines);
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Trigger Run
app.post('/api/run', async (req, res) => {
    logger.info('Manual run triggered via Dashboard.');

    // Run in background to not block response? 
    // Or return status? 
    // Puppeteer cannot have concurrency issues so we should check if running.
    // For now simple implementation:

    res.json({ success: true, message: 'Automation started in background' });

    // Fire and forget (or track status in global var)
    runAutomation().then(result => {
        logger.info('Dashboard triggered run finished.', result);
    });
});

// Serve frontend
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

function startServer() {
    app.listen(PORT, () => {
        logger.info(`Dashboard running at http://localhost:${PORT}`);
    });
}

if (require.main === module) {
    startServer();
}

module.exports = { startServer, app };
