import crypto from 'node:crypto';
import { P2PRepository } from './p2p.repository.js';

export class P2PService {
  constructor(private readonly repo: P2PRepository) {}

  private assertPositiveDecimal(v: string, field: string) {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) throw new Error(`${field} must be > 0`);
  }

  async listAds(input: { assetCode?: string; fiatCode?: string; limit: number }) {
    return this.repo.listAds(input);
  }

  async createAd(userId: string, input: any) {
    this.assertPositiveDecimal(input.price, 'price');
    this.assertPositiveDecimal(input.minFiatAmount, 'minFiatAmount');
    this.assertPositiveDecimal(input.maxFiatAmount, 'maxFiatAmount');
    this.assertPositiveDecimal(input.totalAssetAmount, 'totalAssetAmount');
    return this.repo.createAd({
      seller_id: userId,
      wallet_asset_id: input.walletAssetId,
      payment_method_id: input.paymentMethodId ?? null,
      side: 'SELL',
      asset_code: input.assetCode,
      network_code: input.networkCode,
      fiat_code: input.fiatCode,
      price: input.price,
      min_fiat_amount: input.minFiatAmount,
      max_fiat_amount: input.maxFiatAmount,
      total_asset_amount: input.totalAssetAmount,
      remaining_asset_amount: input.totalAssetAmount,
      payment_window_minutes: input.paymentWindowMinutes,
      terms: input.terms ?? null,
    });
  }

  async createOrder(userId: string, input: any) {
    this.assertPositiveDecimal(input.assetAmount, 'assetAmount');
    const ad = await this.repo.getAdById(input.adId);
    const orderNo = `P2P-${Date.now()}-${crypto.randomInt(1000, 9999)}`;
    const expiresAt = new Date(Date.now() + (ad.payment_window_minutes ?? 15) * 60_000).toISOString();
    const orderId = await this.repo.rpcCreateOrder({
      adId: input.adId,
      buyerId: userId,
      assetAmount: input.assetAmount,
      orderNo,
      expiresAtIso: expiresAt,
    });
    const order = await this.repo.getOrderById(orderId);
    await this.repo.insertNotification({
      user_id: order.seller_id,
      title: 'New P2P order',
      body: `Order ${order.order_no} was created`,
      data: { orderId: order.id },
    });
    return order;
  }

  async markPaid(userId: string, input: any) {
    const order = await this.repo.getOrderById(input.orderId);
    if (order.buyer_id !== userId) throw new Error('Forbidden');
    if (order.status !== 'PENDING_PAYMENT') throw new Error('Invalid order status');

    await this.repo.insertPaymentProof({
      order_id: order.id,
      uploaded_by: userId,
      file_path: input.proofUrl,
      file_url: input.proofUrl,
      status: 'PENDING',
    });

    const updated = await this.repo.updateOrder(order.id, { status: 'PAID', paid_at: new Date().toISOString() });
    await this.repo.insertNotification({
      user_id: order.seller_id,
      title: 'Buyer marked as paid',
      body: `Order ${order.order_no} is awaiting release`,
      data: { orderId: order.id },
    });
    return updated;
  }

  async releaseOrder(userId: string, input: any) {
    const order = await this.repo.getOrderById(input.orderId);
    if (order.seller_id !== userId) throw new Error('Forbidden');
    if (order.status !== 'PAID') throw new Error('Order must be PAID');
    await this.repo.rpcReleaseOrder({
      orderId: order.id,
      actorId: userId,
      idempotencyKey: input.idempotencyKey,
    });
    const updated = await this.repo.getOrderById(order.id);
    await this.repo.insertAuditLog({
      actor_id: userId,
      actor_role: 'USER',
      action: 'ORDER_RELEASE',
      resource_type: 'P2P_ORDER',
      resource_id: order.id,
      payload: { idempotencyKey: input.idempotencyKey },
    });
    await this.repo.insertNotification({
      user_id: order.buyer_id,
      title: 'Order released',
      body: `Order ${order.order_no} released successfully`,
      data: { orderId: order.id },
    });
    return updated;
  }

  async listOrders(userId: string, input: { role: 'BUYER' | 'SELLER'; status?: string; limit: number }) {
    return this.repo.listOrders(userId, input.role, input.status, input.limit);
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.repo.getOrderById(orderId);
    if (order.buyer_id !== userId && order.seller_id !== userId) throw new Error('Forbidden');
    return order;
  }

  async openDispute(userId: string, input: { orderId: string; reason: string }) {
    const order = await this.getOrder(userId, input.orderId);
    if (!['PAID', 'PENDING_PAYMENT'].includes(order.status)) throw new Error('Order cannot be disputed now');
    const existing = await this.repo.getDisputeByOrder(order.id);
    if (existing) return existing;
    const dispute = await this.repo.createDispute({
      order_id: order.id,
      opened_by: userId,
      reason: input.reason,
      status: 'OPEN',
    });
    await this.repo.updateOrder(order.id, { status: 'DISPUTED' });
    await this.repo.insertAuditLog({
      actor_id: userId,
      actor_role: 'USER',
      action: 'OPEN_DISPUTE',
      resource_type: 'P2P_ORDER',
      resource_id: order.id,
      payload: { disputeId: dispute.id },
    });
    return dispute;
  }

  async sendOrderChat(userId: string, input: { orderId: string; message: string; messageType?: string; attachmentUrl?: string }) {
    await this.getOrder(userId, input.orderId);
    return this.repo.sendOrderChat({
      order_id: input.orderId,
      sender_id: userId,
      message: input.message,
      message_type: input.messageType ?? 'TEXT',
      attachment_url: input.attachmentUrl ?? null,
    });
  }

  async listOrderChat(userId: string, orderId: string) {
    await this.getOrder(userId, orderId);
    return this.repo.listOrderChat(orderId, 100);
  }

  async expireOrders(limit = 100) {
    return this.repo.rpcExpireOrders(limit);
  }
}
