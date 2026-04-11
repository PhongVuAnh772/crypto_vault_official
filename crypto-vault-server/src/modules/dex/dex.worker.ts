import { ethers } from 'ethers';
import { DexRepository } from './dex.repository';
import logger from '../../utils/logger';

const ROUTER_ABI = [
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
];

export class DexWorker {
  private repository: DexRepository;
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor() {
    this.repository = new DexRepository();
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, this.provider);
  }

  async run() {
    logger.info('🚀 DEX Swap Worker started');

    // Simple polling loop (should ideally use BullMQ given its presence in package.json)
    setInterval(async () => {
      try {
        const jobs = await this.repository.getQueuedJobs();
        for (const job of jobs) {
          await this.processJob(job);
        }
      } catch (error) {
        logger.error(`Worker polling error: ${error}`);
      }
    }, 10000); // Check every 10 seconds
  }

  private async processJob(job: any) {
    logger.info(`Processing DEX Swap Job: ${job.id}`);

    try {
      await this.repository.updateJobStatus(job.id, 'RUNNING');

      const payload = job.payload; // Already parsed if using JSONB or manual parse
      const { path, amountIn, amountOutMin, wallet: userAddress, router: routerAddress } = payload;

      const router = new ethers.Contract(routerAddress, ROUTER_ABI, this.wallet);

      // Setup transaction parameters
      const amountInWei = ethers.parseUnits(amountIn, 18);
      const amountOutMinWei = ethers.parseUnits(amountOutMin, 18);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

      // Execute transaction
      const tx = await router.swapExactTokensForTokens(
        amountInWei,
        amountOutMinWei,
        path,
        userAddress,
        deadline,
        {
          gasLimit: 300000 // Buffer for swap
        }
      );

      logger.info(`Transaction broadcasted: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        await this.repository.updateSwapStatus(job.reference_id, 'COMPLETED', tx.hash);
        await this.repository.updateJobStatus(job.id, 'SUCCESS');
        logger.info(`Swap completed successfully: ${tx.hash}`);
      } else {
        throw new Error('Transaction reverted on chain');
      }

    } catch (error: any) {
      logger.error(`Swap failed for Job ${job.id}:`, error.message);
      await this.repository.updateSwapStatus(job.reference_id, 'FAILED');
      await this.repository.updateJobStatus(job.id, 'FAILED', error.message);
    }
  }
}

// Instantiate and run if this file is executed directly
if (require.main === module) {
  const worker = new DexWorker();
  worker.run();
}
