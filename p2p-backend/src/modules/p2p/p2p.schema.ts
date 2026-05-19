import { z } from 'zod';

export const CreateAdSchema = z.object({
  walletAssetId: z.string().uuid(),
  paymentMethodId: z.string().uuid().optional(),
  assetCode: z.string().min(2),
  networkCode: z.string().min(2),
  fiatCode: z.string().min(2),
  price: z.string(),
  minFiatAmount: z.string(),
  maxFiatAmount: z.string(),
  totalAssetAmount: z.string(),
  paymentWindowMinutes: z.number().int().min(5).max(60).default(15),
  terms: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  adId: z.string().uuid(),
  assetAmount: z.string(),
});

export const MarkPaidSchema = z.object({
  proofUrl: z.string().url(),
});

export const ReleaseOrderSchema = z.object({
  idempotencyKey: z.string().min(8),
});

export const ListAdsSchema = z.object({
  assetCode: z.string().optional(),
  fiatCode: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const ListOrdersSchema = z.object({
  role: z.enum(['BUYER', 'SELLER']).default('BUYER'),
  status: z
    .enum(['PENDING_PAYMENT', 'PAID', 'RELEASED', 'CANCELLED', 'EXPIRED', 'DISPUTED'])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const OrderIdParamSchema = z.object({
  orderId: z.string().uuid(),
});

export const OpenDisputeSchema = z.object({
  orderId: z.string().uuid().optional(),
  reason: z.string().min(3).max(500),
});

export const SendOrderChatSchema = z.object({
  orderId: z.string().uuid(),
  message: z.string().min(1).max(2000),
  messageType: z.string().default('TEXT'),
  attachmentUrl: z.string().url().optional(),
});
