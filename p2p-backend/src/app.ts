import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { logger } from './core/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { p2pRoutes } from './modules/p2p/p2p.routes.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(pinoHttp({ logger }));

  app.get('/health', (_req: Request, res: Response) => res.json({ ok: true, service: 'p2p-backend' }));
  app.use('/api/v1/p2p', p2pRoutes);
  app.use(errorHandler);
  return app;
}
