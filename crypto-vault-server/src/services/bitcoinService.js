const axios = require('axios');
const logger = require('../utils/logger');

class BitcoinService {
    constructor() {
        this.baseUrls = {
            mainnet: 'https://api.blockcypher.com/v1/btc/main',
            testnet: 'https://api.blockcypher.com/v1/btc/test3'
        };
    }

    getBaseUrl(isTestnet) {
        return isTestnet ? this.baseUrls.testnet : this.baseUrls.mainnet;
    }

    async getBitcoinData(address, isTestnet = false) {
        try {
            const url = `${this.getBaseUrl(isTestnet)}/addrs/${address}?unspentOnly=true`;
            logger.info(`[BITCOIN SERVICE] Fetching data for ${address} on ${isTestnet ? 'testnet' : 'mainnet'}`);
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            logger.error(`[BITCOIN SERVICE] Error getting bitcoin data: ${error.message}`);
            throw error;
        }
    }

    async getBitcoinFullData(address, isTestnet = false) {
        try {
            const url = `${this.getBaseUrl(isTestnet)}/addrs/${address}/full?limit=50`;
            logger.info(`[BITCOIN SERVICE] Fetching full data for ${address} on ${isTestnet ? 'testnet' : 'mainnet'}`);
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            logger.error(`[BITCOIN SERVICE] Error getting bitcoin full data: ${error.message}`);
            throw error;
        }
    }

    async pushTransaction(txHex, isTestnet = false) {
        try {
            const url = `${this.getBaseUrl(isTestnet)}/txs/push`;
            logger.info(`[BITCOIN SERVICE] Pushing transaction to ${isTestnet ? 'testnet' : 'mainnet'}`);
            const response = await axios.post(url, { tx: txHex });
            return response.data;
        } catch (error) {
            logger.error(`[BITCOIN SERVICE] Error pushing transaction: ${error.message}`);
            throw error;
        }
    }

    async getNetworkFee(isTestnet = false) {
        try {
            const url = this.getBaseUrl(isTestnet);
            logger.info(`[BITCOIN SERVICE] Fetching network fee for ${isTestnet ? 'testnet' : 'mainnet'}`);
            const response = await axios.get(url);
            return {
                high_fee_per_kb: response.data.high_fee_per_kb,
                medium_fee_per_kb: response.data.medium_fee_per_kb,
                low_fee_per_kb: response.data.low_fee_per_kb,
            };
        } catch (error) {
            logger.error(`[BITCOIN SERVICE] Error getting network fee: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new BitcoinService();
