import { createApp } from './app.js';
import { env } from './core/config/env.js';
import { logger } from './core/logger.js';

const app = createApp();
app.listen(Number(env.PORT), () => {
  logger.info(`P2P backend listening on :${env.PORT}`);
});

