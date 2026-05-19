import type { NextFunction, Request, Response } from 'express';
import { supabaseAdmin } from '../core/supabase.js';

export type AuthedRequest = Request & { userId?: string };

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Invalid token' });
  req.userId = data.user.id;
  next();
}

