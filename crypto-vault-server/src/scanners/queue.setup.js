const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const logger = require('../utils/logger');

// Mặc định kết nối Redis (Yêu cầu biến môi trường REDIS_URL)
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// 1. Hàng đợi Gửi Job từ Scanner tới Server để Lưu Nạp Tiền
const depositProcessQueue = new Queue('process-deposit', { connection: redisConnection });

// 2. Hàng đợi để gõ nhịp điệu Quét Block EVM
const evmScanQueue = new Queue('scan-evm-block', { connection: redisConnection });

logger.info(`[SCANNERS] BullMQ Setup Initialized. Using Redis Layer.`);

module.exports = {
  depositProcessQueue,
  evmScanQueue,
  redisConnection
};
