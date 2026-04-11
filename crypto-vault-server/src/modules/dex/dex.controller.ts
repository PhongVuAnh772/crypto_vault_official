import { Request, Response } from 'express';
import { DexService } from './dex.service';

export class DexController {
  private service: DexService;

  constructor() {
    this.service = new DexService();
  }

  async quote(req: Request, res: Response) {
    try {
      const { inputToken, outputToken, amount } = req.query;
      
      if (!inputToken || !outputToken || !amount) {
        return res.status(400).json({ error: 'Missing required query parameters' });
      }

      const quote = await this.service.quote({
        userId: '', // Anonymous quote
        inputToken: inputToken as string,
        outputToken: outputToken as string,
        amount: amount as string,
      });

      res.json({ success: true, data: quote });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async swap(req: Request, res: Response) {
    try {
      const { userId, inputToken, outputToken, amount } = req.body;

      if (!userId || !inputToken || !outputToken || !amount) {
        return res.status(400).json({ error: 'Missing required body parameters' });
      }

      const swap = await this.service.initiateSwap({
        userId,
        inputToken,
        outputToken,
        amount,
      });

      res.json({
        success: true,
        message: 'Swap request accepted and queued for execution',
        data: swap,
      });
    } catch (error: any) {
      const status = error.message === 'Insufficient balance' ? 400 : 500;
      res.status(status).json({ success: false, error: error.message });
    }
  }
}
