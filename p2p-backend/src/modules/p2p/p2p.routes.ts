import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireJobSecret } from '../../middleware/require-job-secret.js';
import { P2PController } from './p2p.controller.js';
import { P2PRepository } from './p2p.repository.js';
import { P2PService } from './p2p.service.js';

const repo = new P2PRepository();
const service = new P2PService(repo);
const controller = new P2PController(service);

export const p2pRoutes = Router();

p2pRoutes.get('/ads', requireAuth, controller.listAds);
p2pRoutes.post('/ads', requireAuth, controller.createAd);
p2pRoutes.get('/orders', requireAuth, controller.listOrders);
p2pRoutes.post('/orders', requireAuth, controller.createOrder);
p2pRoutes.get('/orders/:orderId', requireAuth, controller.getOrder);
p2pRoutes.post('/orders/:orderId/paid', requireAuth, controller.markPaid);
p2pRoutes.post('/orders/:orderId/release', requireAuth, controller.releaseOrder);
p2pRoutes.post('/orders/:orderId/dispute', requireAuth, controller.openDispute);
p2pRoutes.get('/orders/:orderId/chat', requireAuth, controller.listChat);
p2pRoutes.post('/orders/:orderId/chat', requireAuth, controller.sendChat);
p2pRoutes.post('/jobs/expire-orders', requireJobSecret, controller.expireOrders);
