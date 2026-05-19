import { P2PService } from './p2p.service';

describe('P2PService', () => {
  it('throws when asset amount is invalid', async () => {
    const service = new P2PService({} as any);
    await expect(service.createOrder('u1', { adId: 'a1', assetAmount: '0' })).rejects.toThrow();
  });

  it('calls rpc release for paid order', async () => {
    const repo = {
      getOrderById: jest.fn().mockResolvedValue({
        id: 'o1',
        order_no: 'P2P-1',
        status: 'PAID',
        seller_id: 's1',
        buyer_id: 'b1',
      }),
      rpcReleaseOrder: jest.fn().mockResolvedValue('o1'),
      insertAuditLog: jest.fn().mockResolvedValue(undefined),
      insertNotification: jest.fn().mockResolvedValue(undefined),
    };
    const service = new P2PService(repo as any);
    await service.releaseOrder('s1', { orderId: 'o1', idempotencyKey: 'idem-123456' });
    expect(repo.rpcReleaseOrder).toHaveBeenCalledWith({
      orderId: 'o1',
      actorId: 's1',
      idempotencyKey: 'idem-123456',
    });
  });
});
