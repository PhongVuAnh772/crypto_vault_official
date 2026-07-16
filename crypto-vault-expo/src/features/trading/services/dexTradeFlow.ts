import { CONFIG } from 'src/core/constants/config';

type DexStatus = 'awaiting_signature' | 'submitted' | 'pending' | 'confirmed' | 'failed' | 'reorged';

interface RunDexSwapFlowParams {
  authToken: string;
  walletAddress: string;
  chainId: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippageBps?: number;
  deadlineSec?: number;
  onStatusChange?: (status: DexStatus | string) => void;
  signTransaction: (unsignedTx: any) => Promise<string>;
}

interface DexSwapFlowResult {
  intentId: string;
  txHash?: string;
  finalStatus: DexStatus | string;
  amountOut?: string;
  amountOutMin?: string;
}

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

export const runDexSwapFlow = async ({
  authToken,
  walletAddress,
  chainId,
  tokenIn,
  tokenOut,
  amountIn,
  slippageBps = 50,
  deadlineSec = 1200,
  onStatusChange,
  signTransaction,
}: RunDexSwapFlowParams): Promise<DexSwapFlowResult> => {
  const quoteQuery = new URLSearchParams({
    chainId: String(chainId),
    tokenIn,
    tokenOut,
    amountIn,
    slippageBps: String(slippageBps),
  });

  const quoteRes = await fetch(`${CONFIG.API_BASE_URL}/api/v1/dex/quotes?${quoteQuery.toString()}`, {
    headers: authHeaders(authToken),
  });
  const quote = await quoteRes.json();
  if (!quoteRes.ok) throw new Error(quote.error || 'Quote failed');

  const routeRes = await fetch(`${CONFIG.API_BASE_URL}/api/v1/dex/routes/compute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(authToken) },
    body: JSON.stringify({ chainId, tokenIn, tokenOut, amountIn }),
  });
  const route = await routeRes.json();
  if (!routeRes.ok) throw new Error(route.error || 'Route compute failed');

  const simRes = await fetch(`${CONFIG.API_BASE_URL}/api/v1/dex/simulations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(authToken) },
    body: JSON.stringify({
      chainId,
      walletAddress,
      routeId: route.routeId,
      tokenIn,
      tokenOut,
      amountIn,
      slippageBps,
    }),
  });
  const sim = await simRes.json();
  if (!simRes.ok || sim.success === false) throw new Error(sim.error || sim.errorCode || 'Simulation failed');

  const buildRes = await fetch(`${CONFIG.API_BASE_URL}/api/v1/dex/transactions/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(authToken) },
    body: JSON.stringify({
      chainId,
      walletAddress,
      routeId: route.routeId,
      tokenIn,
      tokenOut,
      amountIn,
      slippageBps,
      deadlineSec,
    }),
  });
  const build = await buildRes.json();
  if (!buildRes.ok) throw new Error(build.error || 'Build transaction failed');

  const signedTx = await signTransaction(build.unsignedTx || {});

  const relayRes = await fetch(`${CONFIG.API_BASE_URL}/api/v1/dex/transactions/relay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(authToken) },
    body: JSON.stringify({
      intentId: build.intentId,
      signedTx,
      privateRelay: false,
    }),
  });
  const relay = await relayRes.json();
  if (!relayRes.ok) throw new Error(relay.error || 'Relay failed');

  let status: DexStatus | string = 'submitted';
  onStatusChange?.(status);
  let rounds = 0;
  while (!['confirmed', 'failed', 'reorged'].includes(status) && rounds < 8) {
    const intentRes = await fetch(`${CONFIG.API_BASE_URL}/api/v1/dex/intents/${build.intentId}`, {
      headers: authHeaders(authToken),
    });
    const intent = await intentRes.json();
    if (!intentRes.ok) break;
    status = intent.status;
    onStatusChange?.(status);
    if (['confirmed', 'failed', 'reorged'].includes(status)) break;
    await new Promise((resolve) => setTimeout(resolve, 700));
    rounds += 1;
  }

  return {
    intentId: build.intentId,
    txHash: relay.txHash,
    finalStatus: status,
    amountOut: quote.amountOut,
    amountOutMin: quote.amountOutMin,
  };
};
