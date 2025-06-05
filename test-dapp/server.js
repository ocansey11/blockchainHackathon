const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'IntelliWallet Test DApp is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 IntelliWallet Test DApp running on http://localhost:${PORT}`);
    console.log(`📱 Open this URL in your browser to test your wallet extension`);
    console.log(`🔗 Make sure your IntelliWallet extension is loaded in Chrome`);
});

module.exports = app;
