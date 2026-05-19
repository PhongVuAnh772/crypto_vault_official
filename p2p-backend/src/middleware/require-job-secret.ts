import type { NextFunction, Request, Response } from 'express';
import { env } from '../core/config/env.js';

export function requireJobSecret(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers['x-job-secret'];
  if (secret !== env.JOB_SECRET) {
    return res.status(401).json({ error: 'Unauthorized job trigger' });
  }
  return next();
}
