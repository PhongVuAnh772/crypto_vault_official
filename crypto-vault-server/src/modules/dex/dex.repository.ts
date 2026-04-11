import db from '../../utils/db';
import { SwapDetails, TransactionJobPayload } from './dex.types';

export class DexRepository {
  async getTokenBySymbol(symbol: string): Promise<any> {
    const res = await db.query('SELECT * FROM tokens WHERE symbol = $1 AND is_active = true', [symbol]);
    return res.rows[0];
  }

  async getUserBalance(userId: string, tokenId: string): Promise<number> {
    const res = await db.query(
      'SELECT available_balance FROM balances WHERE user_id = $1 AND token_id = $2',
      [userId, tokenId]
    );
    const row = res.rows[0] as unknown as { available_balance: string | number } | undefined;
    return row ? parseFloat(row.available_balance.toString()) : 0;
  }

  async createSwap(details: Omit<SwapDetails, 'id' | 'status'>): Promise<SwapDetails> {
    const res = await db.query(
      `INSERT INTO dex_swaps (user_id, input_token_id, output_token_id, amount_in, expected_out, amount_out_min, path, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        details.userId,
        details.inputTokenId,
        details.outputTokenId,
        details.amountIn,
        details.expectedOut,
        details.amountOutMin,
        details.path,
        'PENDING'
      ]
    );
    const row = res.rows[0] as any;
    if (!row) throw new Error('Failed to create swap');

    return {
      id: row.id,
      userId: row.user_id,
      inputTokenId: row.input_token_id,
      outputTokenId: row.output_token_id,
      amountIn: row.amount_in,
      expectedOut: row.expected_out,
      amountOutMin: row.amount_out_min,
      path: row.path,
      status: row.status
    };
  }

  async createTransactionJob(referenceId: string, payload: TransactionJobPayload): Promise<void> {
    await db.query(
      `INSERT INTO transaction_jobs (reference_id, job_type, status, payload)
       VALUES ($1, $2, $3, $4)`,
      [referenceId, 'DEX_SWAP', 'QUEUED', JSON.stringify(payload)]
    );
  }

  async getQueuedJobs(): Promise<any[]> {
    const res = await db.query(
      "SELECT * FROM transaction_jobs WHERE job_type = 'DEX_SWAP' AND status = 'QUEUED' ORDER BY created_at ASC"
    );
    return res.rows;
  }

  async updateSwapStatus(id: string, status: string, txHash?: string): Promise<void> {
    await db.query(
      'UPDATE dex_swaps SET status = $1, tx_hash = $2, updated_at = NOW() WHERE id = $3',
      [status, txHash, id]
    );
  }

  async updateJobStatus(id: string, status: string, errorLog?: string): Promise<void> {
    await db.query(
      'UPDATE transaction_jobs SET status = $1, error_log = $2, updated_at = NOW() WHERE id = $3',
      [status, errorLog, id]
    );
  }

  async getWalletByUserAndChain(userId: string, chainId: string): Promise<any> {
    const res = await db.query(
      'SELECT * FROM wallets WHERE user_id = $1 AND chain_id = $2 LIMIT 1',
      [userId, chainId]
    );
    return res.rows[0];
  }
}
