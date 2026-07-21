const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { ethers } = require('ethers');
const ticketBlockchainService = require('./src/services/ticketBlockchainService');

/**
 * CLI Tool to Mint Testnet NFT Tickets
 * Usage:
 *   node mint_testnet_nft.js --to 0xYourWalletAddress --contract 0xContractAddress --chain sepolia
 */

async function main() {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
  };

  const toAddress = getArg('--to') || process.env.TEST_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000';
  const contractAddress = getArg('--contract') || process.env.TICKET_CONTRACT_ADDRESS;
  const chain = getArg('--chain') || 'sepolia';
  const eventName = getArg('--event') || 'CryptoVault Festival 2026';
  const seatInfo = getArg('--seat') || 'VIP Row A-12';
  const isDryRun = args.includes('--dry-run');

  console.log('====================================================');
  console.log('🚀 CryptoVault Testnet NFT Minter');
  console.log('====================================================');
  console.log(`• Chain:            ${chain.toUpperCase()}`);
  console.log(`• Target Wallet:    ${toAddress}`);
  console.log(`• Contract Address: ${contractAddress || '(Not specified)'}`);
  console.log(`• Event Name:       ${eventName}`);
  console.log(`• Seat Info:        ${seatInfo}`);
  console.log('----------------------------------------------------');

  if (!contractAddress) {
    console.log('\n⚠️  No TICKET_CONTRACT_ADDRESS found.');
    console.log('\n📌 Quick Start Instructions to Mint Testnet NFT:');
    console.log(' 1. Deploy contracts/TicketNFT.sol on Sepolia / Amoy Testnet (via Remix or Hardhat).');
    console.log(' 2. Set TICKET_MINTER_PRIVATE_KEY in crypto-vault-server/.env');
    console.log(' 3. Run this script:');
    console.log(`    node mint_testnet_nft.js --to ${toAddress === '0x0000000000000000000000000000000000000000' ? '0xYOUR_WALLET' : toAddress} --contract 0xYOUR_CONTRACT_ADDRESS --chain ${chain}\n`);
    return;
  }

  if (isDryRun) {
    console.log('ℹ️ Dry run complete. Everything is ready for actual testnet minting.');
    return;
  }

  try {
    const mockTicketId = 'ticket_' + Date.now();
    const mockEventId = 'event_crypto_vault_2026';
    const mockTicketType = 'VIP_PASS';
    const mockMetadataUri = 'ipfs://bafkreid4x6ygpy7l2327y345';

    console.log('\n⏳ Initiating Testnet Mint Transaction...');
    const result = await ticketBlockchainService.mintTicketNFT({
      ticketId: mockTicketId,
      contractAddress,
      chain,
      toAddress,
      metadataUri: mockMetadataUri,
      eventId: mockEventId,
      ticketType: mockTicketType,
      seatInfo
    });

    console.log('\n✅ NFT Minted Successfully on Testnet!');
    console.log(`• Token ID:    ${result.tokenId}`);
    console.log(`• TX Hash:     ${result.txHash}`);
    console.log(`• Block:       ${result.blockNumber}`);
    
    const explorer = chain === 'amoy' 
      ? `https://amoy.polygonscan.com/tx/${result.txHash}`
      : `https://sepolia.etherscan.io/tx/${result.txHash}`;
    console.log(`• Explorer:    ${explorer}\n`);

  } catch (err) {
    console.error('\n❌ Minting Failed:', err.message);
    if (err.message.includes('TICKET_MINTER_PRIVATE_KEY')) {
      console.log('\n👉 Fix: Add your testnet wallet private key to crypto-vault-server/.env:');
      console.log('   TICKET_MINTER_PRIVATE_KEY=0xYourPrivateKey');
    }
  }
}

main().catch(console.error);
