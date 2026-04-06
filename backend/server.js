const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Mock database
let appConfig = {
  features: {
    p2pEnabled: true,
    swapEnabled: true,
    bridgeEnabled: false,
    maintenanceMode: false,
  },
  tokens: [
    { id: "eth", symbol: "ETH", enabled: true, priority: 1 },
    { id: "usdt", symbol: "USDT", enabled: true, priority: 2 },
    { id: "bnb", symbol: "BNB", enabled: false, priority: 3 }, // Example: Hidden token
  ],
  rpcUrls: {
    "1": "https://mainnet.infura.io/v3/your-api-key",
    "56": "https://bsc-dataseed.binance.org/",
  },
  minVersion: "1.0.0",
};

// GET config for App
app.get('/api/v1/config', (req, res) => {
  res.json(appConfig);
});

// Admin API to update config (In reality, add Auth here)
app.post('/api/v1/admin/config', (req, res) => {
  appConfig = { ...appConfig, ...req.body };
  res.json({ success: true, config: appConfig });
});

app.listen(port, () => {
  console.log(`BFF listening at http://localhost:${port}`);
});
