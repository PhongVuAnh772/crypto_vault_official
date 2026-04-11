import { Router } from 'express';
import { DexController } from './dex.controller';

const router = Router();
const controller = new DexController();

/**
 * @route GET /api/v1/dex/quote
 * @desc Get a real-time swap quote from Uniswap & Binance
 */
router.get('/quote', (req: any, res: any) => controller.quote(req, res));

/**
 * @route POST /api/v1/dex/swap
 * @desc Submit a swap request
 */
router.post('/swap', (req: any, res: any) => controller.swap(req, res));

export default router;
