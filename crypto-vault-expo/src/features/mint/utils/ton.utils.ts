import { beginCell, Cell } from "@ton/core";

export function encodeOffChainContent(content: string) {
  const data = Buffer.concat([
    Buffer.from([0x01]),
    Buffer.from(content),
  ]);

  return makeSnakeCell(data);
}

function makeSnakeCell(data: Buffer): Cell {
  const chunks: Buffer[] = [];

  while (data.length) {
    chunks.push(data.subarray(0, 127));
    data = data.subarray(127);
  }

  if (chunks.length === 1) {
    return beginCell().storeBuffer(chunks[0]).endCell();
  }

  let cur = beginCell().storeBuffer(chunks.pop()!);

  while (chunks.length) {
    cur = beginCell()
      .storeBuffer(chunks.pop()!)
      .storeRef(cur.endCell());
  }

  return cur.endCell();
}
