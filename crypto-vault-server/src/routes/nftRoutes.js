const express = require('express');
const router = express.Router();
const NftService = require('../services/nftService');

// GET /nfts - Get all available NFTs for sale/auction
router.get('/nfts', async (req, res) => {
    try {
        const { network } = req.query; // 'testnet' or 'mainnet'
        const nfts = await NftService.getAllNfts(network || 'mainnet');
        res.json({ success: true, data: nfts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /user-nfts - Get NFTs owned by a specific user
router.get('/user-nfts', async (req, res) => {
    try {
        const { address, network } = req.query;
        if (!address) return res.status(400).json({ success: false, error: 'Address is required' });
        
        const nfts = await NftService.getUserNfts(address, network || 'mainnet');
        res.json({ success: true, data: nfts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /mint - Request minting data
router.post('/mint', async (req, res) => {
    try {
        const { ownerAddress, metadata, network } = req.body;
        const mintData = await NftService.prepareMint(ownerAddress, metadata, network || 'mainnet');
        res.json({ success: true, data: mintData });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /list - Prepare sale contract deployment data
router.post('/list', async (req, res) => {
    try {
        const { sellerAddress, nftAddress, price, type, network } = req.body; // type: 'SALE' or 'AUCTION'
        const listData = await NftService.prepareListing(sellerAddress, nftAddress, price, type, network || 'mainnet');
        res.json({ success: true, data: listData });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /utility - Check utility benefits for a user
router.get('/utility', async (req, res) => {
    try {
        const { address, network } = req.query;
        const benefits = await NftService.getBenefits(address, network || 'mainnet');
        res.json({ success: true, data: benefits });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
