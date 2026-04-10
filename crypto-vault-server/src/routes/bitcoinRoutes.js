const express = require('express');
const router = express.Router();
const bitcoinService = require('../services/bitcoinService');
const logger = require('../utils/logger');

router.get('/data/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const isTestnet = req.query.isTestnet === 'true';
        const data = await bitcoinService.getBitcoinData(address, isTestnet);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/full-data/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const isTestnet = req.query.isTestnet === 'true';
        const data = await bitcoinService.getBitcoinFullData(address, isTestnet);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/push-tx', async (req, res) => {
    try {
        const { tx, isTestnet } = req.body;
        const data = await bitcoinService.pushTransaction(tx, isTestnet === true);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/fees', async (req, res) => {
    try {
        const isTestnet = req.query.isTestnet === 'true';
        const data = await bitcoinService.getNetworkFee(isTestnet);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
