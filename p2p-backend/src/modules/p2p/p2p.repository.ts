import { supabaseAdmin } from '../../core/supabase.js';

export class P2PRepository {
  async listAds(filter: { assetCode?: string; fiatCode?: string; limit: number }) {
    let query = supabaseAdmin
      .from('p2p_ads')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('price', { ascending: true })
      .limit(filter.limit);
    if (filter.assetCode) query = query.eq('asset_code', filter.assetCode);
    if (filter.fiatCode) query = query.eq('fiat_code', filter.fiatCode);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createAd(payload: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('p2p_ads').insert(payload).select('*').single();
    if (error) throw error;
    return data;
  }

  async getAdById(adId: string) {
    const { data, error } = await supabaseAdmin.from('p2p_ads').select('*').eq('id', adId).single();
    if (error) throw error;
    return data;
  }

  async createOrder(payload: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('p2p_orders').insert(payload).select('*').single();
    if (error) throw error;
    return data;
  }

  async getOrderById(orderId: string) {
    const { data, error } = await supabaseAdmin.from('p2p_orders').select('*').eq('id', orderId).single();
    if (error) throw error;
    return data;
  }

  async updateOrder(orderId: string, patch: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin
      .from('p2p_orders')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async insertPaymentProof(payload: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('payment_proofs').insert(payload).select('*').single();
    if (error) throw error;
    return data;
  }

  async walletMove(params: {
    fromWalletAssetId: string;
    toWalletAssetId: string;
    amount: string;
    mode: 'FREEZE' | 'UNFREEZE' | 'RELEASE' | 'TRANSFER';
    referenceType: string;
    referenceId: string;
    idempotencyKey: string;
    actorId: string;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await supabaseAdmin.rpc('rpc_wallet_move', {
      p_from_wallet_asset_id: params.fromWalletAssetId,
      p_to_wallet_asset_id: params.toWalletAssetId,
      p_amount: params.amount,
      p_mode: params.mode,
      p_reference_type: params.referenceType,
      p_reference_id: params.referenceId,
      p_idempotency_key: params.idempotencyKey,
      p_actor_id: params.actorId,
      p_metadata: params.metadata ?? {},
    });
    if (error) throw error;
    return data;
  }

  async rpcCreateOrder(params: {
    adId: string;
    buyerId: string;
    assetAmount: string;
    orderNo: string;
    expiresAtIso: string;
  }) {
    const { data, error } = await supabaseAdmin.rpc('rpc_create_p2p_order', {
      p_ad_id: params.adId,
      p_buyer_id: params.buyerId,
      p_asset_amount: params.assetAmount,
      p_order_no: params.orderNo,
      p_expires_at: params.expiresAtIso,
    });
    if (error) throw error;
    return data as string;
  }

  async rpcReleaseOrder(params: { orderId: string; actorId: string; idempotencyKey: string }) {
    const { data, error } = await supabaseAdmin.rpc('rpc_release_p2p_order', {
      p_order_id: params.orderId,
      p_actor_id: params.actorId,
      p_idempotency_key: params.idempotencyKey,
    });
    if (error) throw error;
    return data as string;
  }

  async rpcExpireOrders(limit = 100) {
    const { data, error } = await supabaseAdmin.rpc('rpc_expire_p2p_orders', { p_limit: limit });
    if (error) throw error;
    return Number(data ?? 0);
  }

  async listOrders(userId: string, role: 'BUYER' | 'SELLER', status?: string, limit = 30) {
    let query = supabaseAdmin
      .from('p2p_orders')
      .select('*')
      .eq(role === 'BUYER' ? 'buyer_id' : 'seller_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createDispute(payload: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('disputes').insert(payload).select('*').single();
    if (error) throw error;
    return data;
  }

  async getDisputeByOrder(orderId: string) {
    const { data, error } = await supabaseAdmin.from('disputes').select('*').eq('order_id', orderId).maybeSingle();
    if (error) throw error;
    return data;
  }

  async sendOrderChat(payload: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('order_chats').insert(payload).select('*').single();
    if (error) throw error;
    return data;
  }

  async listOrderChat(orderId: string, limit = 100) {
    const { data, error } = await supabaseAdmin
      .from('order_chats')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data;
  }

  async insertNotification(payload: Record<string, unknown>) {
    const { error } = await supabaseAdmin.from('notifications').insert(payload);
    if (error) throw error;
  }

  async insertAuditLog(payload: Record<string, unknown>) {
    const { error } = await supabaseAdmin.from('audit_logs').insert(payload);
    if (error) throw error;
  }
}
