import type { Response } from 'express';
import type { AuthedRequest } from '../../middleware/auth.js';
import { P2PService } from './p2p.service.js';
import {
  CreateAdSchema,
  CreateOrderSchema,
  ListAdsSchema,
  ListOrdersSchema,
  MarkPaidSchema,
  OpenDisputeSchema,
  OrderIdParamSchema,
  ReleaseOrderSchema,
  SendOrderChatSchema,
} from './p2p.schema.js';

export class P2PController {
  constructor(private readonly service: P2PService) {}

  listAds = async (req: AuthedRequest, res: Response) => {
    const input = ListAdsSchema.parse(req.query);
    const items = await this.service.listAds(input);
    res.json({ ok: true, data: items });
  };

  createAd = async (req: AuthedRequest, res: Response) => {
    const input = CreateAdSchema.parse(req.body);
    const ad = await this.service.createAd(req.userId!, input);
    res.json({ ok: true, data: ad });
  };

  createOrder = async (req: AuthedRequest, res: Response) => {
    const input = CreateOrderSchema.parse(req.body);
    const order = await this.service.createOrder(req.userId!, input);
    res.json({ ok: true, data: order });
  };

  listOrders = async (req: AuthedRequest, res: Response) => {
    const input = ListOrdersSchema.parse(req.query);
    const items = await this.service.listOrders(req.userId!, input);
    res.json({ ok: true, data: items });
  };

  getOrder = async (req: AuthedRequest, res: Response) => {
    const { orderId } = OrderIdParamSchema.parse(req.params);
    const order = await this.service.getOrder(req.userId!, orderId);
    res.json({ ok: true, data: order });
  };

  markPaid = async (req: AuthedRequest, res: Response) => {
    const params = OrderIdParamSchema.parse(req.params);
    const body = MarkPaidSchema.parse(req.body);
    const input = { ...body, orderId: params.orderId };
    const order = await this.service.markPaid(req.userId!, input);
    res.json({ ok: true, data: order });
  };

  releaseOrder = async (req: AuthedRequest, res: Response) => {
    const params = OrderIdParamSchema.parse(req.params);
    const body = ReleaseOrderSchema.parse(req.body);
    const input = { ...body, orderId: params.orderId };
    const order = await this.service.releaseOrder(req.userId!, input);
    res.json({ ok: true, data: order });
  };

  openDispute = async (req: AuthedRequest, res: Response) => {
    const params = OrderIdParamSchema.parse(req.params);
    const body = OpenDisputeSchema.parse(req.body);
    const dispute = await this.service.openDispute(req.userId!, { ...body, orderId: params.orderId });
    res.json({ ok: true, data: dispute });
  };

  listChat = async (req: AuthedRequest, res: Response) => {
    const { orderId } = OrderIdParamSchema.parse(req.params);
    const items = await this.service.listOrderChat(req.userId!, orderId);
    res.json({ ok: true, data: items });
  };

  sendChat = async (req: AuthedRequest, res: Response) => {
    const params = OrderIdParamSchema.parse(req.params);
    const body = SendOrderChatSchema.parse(req.body);
    const item = await this.service.sendOrderChat(req.userId!, { ...body, orderId: params.orderId });
    res.json({ ok: true, data: item });
  };

  expireOrders = async (_req: AuthedRequest, res: Response) => {
    const expired = await this.service.expireOrders(200);
    res.json({ ok: true, data: { expired } });
  };
}
