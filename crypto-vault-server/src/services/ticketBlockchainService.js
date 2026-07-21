const { ethers } = require('ethers');
const db = require('../utils/db');
const logger = require('../utils/logger');
const auditService = require('./auditService');

/**
 * Ticket Blockchain Service
 * Handles on-chain minting, metadata upload, and blockchain-based verification.
 * Supports EVM (Ethereum, Polygon, BSC) via TicketNFT.sol contract.
 */

// ============================================================
// Configuration
// ============================================================

const SUPPORTED_CHAINS = {
  ethereum: {
    rpcUrl: process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_KEY',
    chainId: 1,
    explorer: 'https://etherscan.io'
  },
  polygon: {
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    chainId: 137,
    explorer: 'https://polygonscan.com'
  },
  bsc: {
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    chainId: 56,
    explorer: 'https://bscscan.com'
  },
  sepolia: {
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    chainId: 11155111,
    explorer: 'https://sepolia.etherscan.io'
  },
  amoy: {
    rpcUrl: process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
    chainId: 80002,
    explorer: 'https://amoy.polygonscan.com'
  }
};

// ABI for TicketNFT.sol — only the functions we use
const TICKET_NFT_ABI = [
  'function mintTicket(address to, bytes32 eventId, bytes32 ticketTypeId, string calldata seatInfo, string calldata metadataURI) external returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'event TicketMinted(uint256 indexed tokenId, address indexed to, bytes32 indexed eventId, bytes32 ticketTypeId, string seatInfo, string metadataURI)',
  'event TicketUsed(uint256 indexed tokenId, address indexed verifier, uint256 usedAt)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
];

/**
 * Get a provider for a specific chain.
 */
function getProvider(chain = 'sepolia') {
  const config = SUPPORTED_CHAINS[chain];
  if (!config) throw new Error(`Unsupported chain: ${chain}`);
  return new ethers.JsonRpcProvider(config.rpcUrl, config.chainId);
}

/**
 * Get a signer (for write operations).
 */
function getSigner(chain = 'sepolia') {
  const privateKey = process.env.TICKET_MINTER_PRIVATE_KEY;
  if (!privateKey) throw new Error('TICKET_MINTER_PRIVATE_KEY not set');
  const provider = getProvider(chain);
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Get a contract instance.
 */
function getContract(contractAddress, chain = 'sepolia', writable = false) {
  const signerOrProvider = writable ? getSigner(chain) : getProvider(chain);
  return new ethers.Contract(contractAddress, TICKET_NFT_ABI, signerOrProvider);
}

// ============================================================
// Minting
// ============================================================

/**
 * Mint a ticket NFT on-chain and update the DB record.
 * 
 * @param {Object} params
 * @param {string} params.ticketId       - DB ticket UUID
 * @param {string} params.contractAddress - TicketNFT contract address
 * @param {string} params.chain          - Chain name (e.g. 'sepolia')
 * @param {string} params.toAddress      - Owner wallet address
 * @param {string} params.metadataUri    - IPFS metadata URI
 * @param {string} params.eventId        - Event UUID (hashed to bytes32)
 * @param {string} params.ticketType     - Ticket type name (hashed to bytes32)
 * @param {string} params.seatInfo       - Seat information
 * @returns {Object} { tokenId, txHash, blockNumber }
 */
async function mintTicketNFT({
  ticketId,
  contractAddress,
  chain = 'sepolia',
  toAddress,
  metadataUri,
  eventId,
  ticketType,
  seatInfo = ''
}) {
  try {
    logger.info(`[BLOCKCHAIN] Minting NFT for ticket ${ticketId} on ${chain}...`);

    const contract = getContract(contractAddress, chain, true);

    // Convert UUIDs to bytes32
    const eventIdHash = ethers.id(eventId);
    const ticketTypeHash = ethers.id(ticketType);

    // Issue the ticket on-chain using exact contract signature
    const tx = await contract.mintTicket(
      toAddress,
      eventIdHash,
      ticketTypeHash,
      seatInfo || '',
      metadataUri || ''
    );

    logger.info(`[BLOCKCHAIN] TX submitted: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait(1);
    
    // Extract tokenId from the TicketMinted event
    const ticketMintedEvent = receipt.logs.find(
      (log) => {
        try {
          const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
          return parsed?.name === 'TicketMinted';
        } catch {
          return false;
        }
      }
    );

    let tokenId = null;
    if (ticketMintedEvent) {
      const parsed = contract.interface.parseLog({ 
        topics: ticketMintedEvent.topics, 
        data: ticketMintedEvent.data 
      });
      tokenId = parsed.args.tokenId.toString();
    }

    // Update DB record with on-chain data if DB table exists
    try {
      await db.query(
        `UPDATE tickets SET 
           token_id = $1, contract_address = $2, chain_id = $3,
           mint_tx_hash = $4, metadata_uri = $5, updated_at = NOW()
         WHERE id = $6`,
        [
          tokenId ? parseInt(tokenId) : null,
          contractAddress,
          String(SUPPORTED_CHAINS[chain].chainId),
          tx.hash,
          metadataUri,
          ticketId
        ]
      );

      await auditService.log({
        actorType: 'SYSTEM',
        action: 'ticket.mint',
        resourceType: 'ticket',
        resourceId: ticketId,
        description: `Minted NFT tokenId=${tokenId} on ${chain}`,
        details: { txHash: tx.hash, tokenId, chain, contractAddress }
      });
    } catch (dbErr) {
      logger.warn(`[BLOCKCHAIN] DB update skipped for ticket ${ticketId}: ${dbErr.message}`);
    }

    logger.info(`[BLOCKCHAIN] Minted tokenId=${tokenId} for ticket ${ticketId}`);

    return {
      tokenId,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      contractAddress,
      chain,
      explorerUrl: `${SUPPORTED_CHAINS[chain].explorer}/tx/${tx.hash}`
    };
  } catch (err) {
    logger.error(`[BLOCKCHAIN] Mint error for ticket ${ticketId}:`, err);
    throw new Error(`NFT minting failed: ${err.message}`);
  }
}

/**
 * Verify a ticket on-chain (read-only).
 */
async function verifyOnChain(contractAddress, tokenId, chain = 'sepolia') {
  try {
    const contract = getContract(contractAddress, chain, false);
    const result = await contract.verifyTicket(tokenId);

    return {
      owner: result[0],
      eventId: result[1],
      ticketType: result[2],
      isUsed: result[3],
      seatInfo: result[4],
      issueTimestamp: Number(result[5])
    };
  } catch (err) {
    logger.error(`[BLOCKCHAIN] Verify error for tokenId ${tokenId}:`, err);
    throw new Error(`On-chain verification failed: ${err.message}`);
  }
}

/**
 * Mark a ticket as used on-chain.
 */
async function markUsedOnChain(contractAddress, tokenId, chain = 'sepolia') {
  try {
    const contract = getContract(contractAddress, chain, true);
    const tx = await contract.markTicketUsed(tokenId);
    const receipt = await tx.wait(1);

    logger.info(`[BLOCKCHAIN] Marked tokenId=${tokenId} as used, tx=${tx.hash}`);
    return { txHash: tx.hash, blockNumber: receipt.blockNumber };
  } catch (err) {
    logger.error(`[BLOCKCHAIN] Mark used error for tokenId ${tokenId}:`, err);
    throw new Error(`On-chain mark-used failed: ${err.message}`);
  }
}

/**
 * Check the on-chain owner of a token.
 */
async function getTokenOwner(contractAddress, tokenId, chain = 'sepolia') {
  const contract = getContract(contractAddress, chain, false);
  return await contract.ownerOf(tokenId);
}

module.exports = {
  mintTicketNFT,
  verifyOnChain,
  markUsedOnChain,
  getTokenOwner,
  getProvider,
  getContract,
  SUPPORTED_CHAINS
};
