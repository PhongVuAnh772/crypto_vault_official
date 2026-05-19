const express = require('express');
const crypto = require('crypto');
const db = require('../utils/db');
const { JWT_SECRET } = require('../middlewares/authMiddleware');
const jwt = require('jsonwebtoken');

const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET_NFT = process.env.SUPABASE_BUCKET_NFT || 'nft-assets';
const TON_NETWORK = process.env.TON_NETWORK || 'testnet';
const TON_API_KEY = process.env.TON_API_KEY || '';

const normalizeAddress = (address) => String(address || '').trim();

const getUserFromRequest = (req) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

const requireAuth = (req, res, next) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
};

let schemaReady = false;
const ensureSchema = async () => {
  if (schemaReady) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS marketplace_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      wallet_address TEXT UNIQUE NOT NULL,
      username TEXT,
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS marketplace_nfts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nft_address TEXT UNIQUE,
      collection_address TEXT,
      owner_address TEXT,
      name TEXT,
      description TEXT,
      image_url TEXT,
      metadata_url TEXT,
      attributes JSONB DEFAULT '[]'::jsonb,
      status TEXT DEFAULT 'pending',
      tx_hash TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS marketplace_auctions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      auction_contract_address TEXT UNIQUE,
      nft_address TEXT NOT NULL,
      seller_address TEXT NOT NULL,
      current_bidder TEXT,
      start_price NUMERIC NOT NULL,
      current_price NUMERIC DEFAULT 0,
      min_bid_step NUMERIC DEFAULT 0,
      start_time TIMESTAMPTZ,
      end_time TIMESTAMPTZ NOT NULL,
      status TEXT DEFAULT 'pending',
      tx_hash TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS marketplace_bids (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      auction_id UUID REFERENCES marketplace_auctions(id),
      bidder_address TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      tx_hash TEXT UNIQUE,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS marketplace_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      wallet_address TEXT,
      tx_hash TEXT UNIQUE,
      type TEXT,
      status TEXT DEFAULT 'pending',
      payload JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_marketplace_nfts_owner ON marketplace_nfts(owner_address, updated_at DESC);`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_marketplace_auctions_status_end ON marketplace_auctions(status, end_time DESC);`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_marketplace_bids_auction_created ON marketplace_bids(auction_id, created_at DESC);`);
  schemaReady = true;
};

const uploadToSupabaseStorage = async ({ path, contentType, bodyBuffer }) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  const endpoint = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET_NFT}/${path}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: bodyBuffer,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Storage upload failed: ${text}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET_NFT}/${path}`;
};

const fetchTonNft = async (nftAddress, network) => {
  const finalNetwork = network === 'mainnet' || network === 'testnet' ? network : TON_NETWORK;
  const baseUrl = finalNetwork === 'mainnet' ? 'https://tonapi.io' : 'https://testnet.tonapi.io';
  const res = await fetch(`${baseUrl}/v2/nfts/${nftAddress}`, {
    headers: TON_API_KEY ? { Authorization: `Bearer ${TON_API_KEY}` } : {},
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TON API error: ${text}`);
  }
  return res.json();
};

router.get('/health', async (_req, res) => {
  await ensureSchema();
  res.json({ ok: true, service: 'marketplace' });
});

router.post('/auth/wallet-login', async (req, res) => {
  try {
    await ensureSchema();
    const { wallet_address, username, avatar_url } = req.body || {};
    const walletAddress = normalizeAddress(wallet_address);
    if (!walletAddress) return res.status(400).json({ error: 'wallet_address is required' });

    const userRes = await db.query(
      `INSERT INTO marketplace_users (wallet_address, username, avatar_url)
       VALUES ($1, $2, $3)
       ON CONFLICT (wallet_address)
       DO UPDATE SET username = COALESCE(EXCLUDED.username, marketplace_users.username),
                     avatar_url = COALESCE(EXCLUDED.avatar_url, marketplace_users.avatar_url)
       RETURNING *`,
      [walletAddress, username || null, avatar_url || null],
    );

    const appUser = userRes.rows[0];
    const token = jwt.sign({ id: appUser.id, wallet_address: appUser.wallet_address, role: 'user' }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: appUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upload/nft-image', requireAuth, async (req, res) => {
  try {
    const { fileName, contentType, base64Data } = req.body || {};
    if (!base64Data) return res.status(400).json({ error: 'base64Data is required' });
    const safeName = String(fileName || `${Date.now()}.png`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const wallet = normalizeAddress(req.user.wallet_address);
    const path = `images/${wallet}/${Date.now()}-${safeName}`;
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const imageUrl = await uploadToSupabaseStorage({
      path,
      contentType: contentType || 'image/png',
      bodyBuffer: imageBuffer,
    });
    res.json({ image_url: imageUrl, path });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/nfts/metadata', requireAuth, async (req, res) => {
  try {
    const { name, description, image_url, attributes } = req.body || {};
    if (!name || !image_url) return res.status(400).json({ error: 'name and image_url are required' });
    const wallet = normalizeAddress(req.user.wallet_address);
    const metadata = {
      name: String(name),
      description: String(description || ''),
      image: String(image_url),
      attributes: Array.isArray(attributes) ? attributes : [],
    };
    const path = `metadata/${wallet}/${Date.now()}-${crypto.randomUUID()}.json`;
    const metadataUrl = await uploadToSupabaseStorage({
      path,
      contentType: 'application/json',
      bodyBuffer: Buffer.from(JSON.stringify(metadata), 'utf8'),
    });
    res.json({ metadata_url: metadataUrl, metadata });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/nfts', requireAuth, async (req, res) => {
  try {
    await ensureSchema();
    const { nft_address, collection_address, owner_address, name, description, image_url, metadata_url, status, tx_hash, attributes } = req.body || {};
    const ownerAddress = normalizeAddress(owner_address || req.user.wallet_address);
    const insertRes = await db.query(
      `INSERT INTO marketplace_nfts
      (nft_address, collection_address, owner_address, name, description, image_url, metadata_url, status, tx_hash, attributes, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,NOW())
      ON CONFLICT (nft_address)
      DO UPDATE SET owner_address = EXCLUDED.owner_address,
                    collection_address = COALESCE(EXCLUDED.collection_address, marketplace_nfts.collection_address),
                    name = COALESCE(EXCLUDED.name, marketplace_nfts.name),
                    description = COALESCE(EXCLUDED.description, marketplace_nfts.description),
                    image_url = COALESCE(EXCLUDED.image_url, marketplace_nfts.image_url),
                    metadata_url = COALESCE(EXCLUDED.metadata_url, marketplace_nfts.metadata_url),
                    status = COALESCE(EXCLUDED.status, marketplace_nfts.status),
                    tx_hash = COALESCE(EXCLUDED.tx_hash, marketplace_nfts.tx_hash),
                    attributes = COALESCE(EXCLUDED.attributes, marketplace_nfts.attributes),
                    updated_at = NOW()
      RETURNING *`,
      [
        nft_address || null,
        collection_address || null,
        ownerAddress,
        name || null,
        description || null,
        image_url || null,
        metadata_url || null,
        status || 'pending',
        tx_hash || null,
        JSON.stringify(Array.isArray(attributes) ? attributes : []),
      ],
    );
    res.json(insertRes.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/nfts', async (req, res) => {
  try {
    await ensureSchema();
    const ownerAddress = normalizeAddress(req.query.owner_address);
    const result = ownerAddress
      ? await db.query(`SELECT * FROM marketplace_nfts WHERE owner_address = $1 ORDER BY updated_at DESC`, [ownerAddress])
      : await db.query(`SELECT * FROM marketplace_nfts ORDER BY updated_at DESC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/nfts/:id', requireAuth, async (req, res) => {
  try {
    await ensureSchema();
    const { status, tx_hash, nft_address, owner_address, collection_address } = req.body || {};
    const result = await db.query(
      `UPDATE marketplace_nfts
       SET status = COALESCE($1, status),
           tx_hash = COALESCE($2, tx_hash),
           nft_address = COALESCE($3, nft_address),
           owner_address = COALESCE($4, owner_address),
           collection_address = COALESCE($5, collection_address),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [status || null, tx_hash || null, nft_address || null, owner_address || null, collection_address || null, req.params.id],
    );
    if (!result.rowCount) return res.status(404).json({ error: 'NFT not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/auctions', async (req, res) => {
  try {
    await ensureSchema();
    const status = req.query.status ? String(req.query.status) : null;
    const result = status
      ? await db.query(`SELECT * FROM marketplace_auctions WHERE status = $1 ORDER BY created_at DESC`, [status])
      : await db.query(`SELECT * FROM marketplace_auctions ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/auctions/:id', async (req, res) => {
  try {
    await ensureSchema();
    const result = await db.query(`SELECT * FROM marketplace_auctions WHERE id = $1`, [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Auction not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auctions', requireAuth, async (req, res) => {
  try {
    await ensureSchema();
    const { auction_contract_address, nft_address, seller_address, start_price, min_bid_step, end_time, tx_hash, status } = req.body || {};
    if (!nft_address || !seller_address || !start_price || !end_time) {
      return res.status(400).json({ error: 'nft_address, seller_address, start_price, end_time are required' });
    }
    const nftRes = await db.query(`SELECT * FROM marketplace_nfts WHERE nft_address = $1 LIMIT 1`, [nft_address]);
    if (!nftRes.rowCount) return res.status(404).json({ error: 'NFT not found in cache' });
    const nft = nftRes.rows[0];
    if (normalizeAddress(nft.owner_address) !== normalizeAddress(seller_address)) {
      return res.status(400).json({ error: 'NFT is not owned by seller_address' });
    }
    const inserted = await db.query(
      `INSERT INTO marketplace_auctions
      (auction_contract_address, nft_address, seller_address, start_price, current_price, min_bid_step, start_time, end_time, status, tx_hash, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,NOW(),$7,$8,$9,NOW())
      RETURNING *`,
      [
        auction_contract_address || null,
        nft_address,
        normalizeAddress(seller_address),
        start_price,
        0,
        min_bid_step || 0,
        end_time,
        status || 'pending',
        tx_hash || null,
      ],
    );
    res.json(inserted.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/auctions/:id', requireAuth, async (req, res) => {
  try {
    await ensureSchema();
    const { status, tx_hash, auction_contract_address, current_price, current_bidder } = req.body || {};
    const updated = await db.query(
      `UPDATE marketplace_auctions
       SET status = COALESCE($1, status),
           tx_hash = COALESCE($2, tx_hash),
           auction_contract_address = COALESCE($3, auction_contract_address),
           current_price = COALESCE($4, current_price),
           current_bidder = COALESCE($5, current_bidder),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [status || null, tx_hash || null, auction_contract_address || null, current_price || null, current_bidder || null, req.params.id],
    );
    if (!updated.rowCount) return res.status(404).json({ error: 'Auction not found' });
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/bids', requireAuth, async (req, res) => {
  try {
    await ensureSchema();
    const { auction_id, bidder_address, amount, tx_hash } = req.body || {};
    if (!auction_id || !bidder_address || !amount) return res.status(400).json({ error: 'auction_id, bidder_address, amount are required' });
    const auctionRes = await db.query(`SELECT * FROM marketplace_auctions WHERE id = $1`, [auction_id]);
    if (!auctionRes.rowCount) return res.status(404).json({ error: 'Auction not found' });
    const auction = auctionRes.rows[0];

    if (auction.status === 'finished' || auction.status === 'cancelled') return res.status(400).json({ error: 'Auction is not active' });
    if (new Date(auction.end_time).getTime() <= Date.now()) return res.status(400).json({ error: 'Auction ended' });

    const bidAmount = Number(amount);
    const currentPrice = Number(auction.current_price || 0);
    const startPrice = Number(auction.start_price || 0);
    const minStep = Number(auction.min_bid_step || 0);
    if (!Number.isFinite(bidAmount) || bidAmount <= 0) return res.status(400).json({ error: 'Invalid bid amount' });

    if (currentPrice > 0) {
      if (bidAmount < currentPrice + minStep) return res.status(400).json({ error: 'Bid too low: must be >= current_price + min_bid_step' });
    } else if (bidAmount < startPrice) {
      return res.status(400).json({ error: 'Bid too low: must be >= start_price' });
    }

    const bidInsert = await db.query(
      `INSERT INTO marketplace_bids (auction_id, bidder_address, amount, tx_hash, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [auction_id, normalizeAddress(bidder_address), bidAmount, tx_hash || null, 'pending'],
    );
    await db.query(
      `UPDATE marketplace_auctions
       SET current_price = $1, current_bidder = $2, status = CASE WHEN status = 'pending' THEN 'active' ELSE status END, updated_at = NOW()
       WHERE id = $3`,
      [bidAmount, normalizeAddress(bidder_address), auction_id],
    );

    res.json(bidInsert.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/auctions/:id/bids', async (req, res) => {
  try {
    await ensureSchema();
    const bids = await db.query(`SELECT * FROM marketplace_bids WHERE auction_id = $1 ORDER BY created_at DESC`, [req.params.id]);
    res.json(bids.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sync/nft/:nft_address', requireAuth, async (req, res) => {
  try {
    await ensureSchema();
    const nftAddress = normalizeAddress(req.params.nft_address);
    const network = String(req.body?.network || req.query?.network || TON_NETWORK).toLowerCase();
    const chainNft = await fetchTonNft(nftAddress, network);
    const ownerAddress = normalizeAddress(chainNft?.owner?.address || '');
    const content = chainNft?.metadata || {};
    const imageUrl = content.image || chainNft?.previews?.[chainNft.previews.length - 1]?.url || null;
    const metadataUrl = chainNft?.metadata_url || null;
    const collectionAddress = normalizeAddress(chainNft?.collection?.address || null);

    const result = await db.query(
      `INSERT INTO marketplace_nfts (nft_address, collection_address, owner_address, name, description, image_url, metadata_url, status, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       ON CONFLICT (nft_address)
       DO UPDATE SET collection_address = EXCLUDED.collection_address,
                     owner_address = EXCLUDED.owner_address,
                     name = COALESCE(EXCLUDED.name, marketplace_nfts.name),
                     description = COALESCE(EXCLUDED.description, marketplace_nfts.description),
                     image_url = COALESCE(EXCLUDED.image_url, marketplace_nfts.image_url),
                     metadata_url = COALESCE(EXCLUDED.metadata_url, marketplace_nfts.metadata_url),
                     status = 'minted',
                     updated_at = NOW()
       RETURNING *`,
      [
        nftAddress,
        collectionAddress,
        ownerAddress,
        content.name || null,
        content.description || null,
        imageUrl,
        metadataUrl,
        ownerAddress ? 'minted' : 'pending',
      ],
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sync/auction/:auction_contract_address', requireAuth, async (req, res) => {
  try {
    await ensureSchema();
    const contractAddress = normalizeAddress(req.params.auction_contract_address);
    const auctionRes = await db.query(`SELECT * FROM marketplace_auctions WHERE auction_contract_address = $1 LIMIT 1`, [contractAddress]);
    if (!auctionRes.rowCount) return res.status(404).json({ error: 'Auction not found in cache' });
    const auction = auctionRes.rows[0];

    const now = Date.now();
    const end = new Date(auction.end_time).getTime();
    let status = auction.status;
    if (status !== 'finished' && status !== 'cancelled') {
      status = end <= now ? 'ended' : (Number(auction.current_price || 0) > 0 ? 'active' : 'pending');
    }
    const updated = await db.query(
      `UPDATE marketplace_auctions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, auction.id],
    );
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
