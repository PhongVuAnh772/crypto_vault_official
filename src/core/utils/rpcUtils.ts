const encodeBalanceOf = (address: string) => {
  const selector = "70a08231"; // balanceOf(address)
  const addr = address.toLowerCase().replace("0x", "").padStart(64, "0");
  return "0x" + selector + addr;
};

const getERC20BalanceRPC = async (
  rpcUrl: string,
  tokenAddress: string,
  userAddress: string
): Promise<bigint> => {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [
        {
          to: tokenAddress,
          data: encodeBalanceOf(userAddress),
        },
        "latest",
      ],
    }),
  });

  const json = await res.json();

  if (!json?.result) {
    throw new Error("RPC_BALANCE_FAILED");
  }

  return BigInt(json.result);
};
