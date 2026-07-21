const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { ethers } = require('ethers');

/**
 * Script to compile and deploy TicketNFT.sol to Sepolia or Amoy Testnet
 */

async function main() {
  console.log('====================================================');
  console.log('🚀 CryptoVault Smart Contract Deployer');
  console.log('====================================================');

  const privateKey = process.env.TICKET_MINTER_PRIVATE_KEY;
  const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

  if (!privateKey || privateKey.includes('your_testnet_private_key')) {
    console.error('\n❌ Error: TICKET_MINTER_PRIVATE_KEY is missing or invalid in .env!');
    console.log('\n👉 Please set your Private Key in crypto-vault-server/.env:');
    console.log('   TICKET_MINTER_PRIVATE_KEY=0xYourWalletPrivateKey\n');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`• Deployer Wallet:  ${wallet.address}`);
  console.log(`• Network RPC:      ${rpcUrl}`);

  const balance = await provider.getBalance(wallet.address);
  const balanceETH = ethers.formatEther(balance);
  console.log(`• Wallet Balance:   ${balanceETH} Sepolia ETH`);

  if (balance === 0n) {
    console.error('\n❌ Wallet balance is 0 ETH! Please get Sepolia testnet ETH from a faucet first.');
    process.exit(1);
  }

  console.log('\n⏳ Compiling TicketNFT.sol contract...');
  const solc = require('solc');

  const contractPath = path.join(__dirname, '../contracts/TicketNFT.sol');
  const contractSource = fs.readFileSync(contractPath, 'utf8');

  function findImports(importPath) {
    if (importPath.startsWith('@openzeppelin/')) {
      const fullPath = path.join(__dirname, 'node_modules', importPath);
      return { contents: fs.readFileSync(fullPath, 'utf8') };
    }
    return { error: 'File not found' };
  }

  const input = {
    language: 'Solidity',
    sources: {
      'TicketNFT.sol': {
        content: contractSource,
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  if (output.errors) {
    const fatalErrors = output.errors.filter(e => e.severity === 'error');
    if (fatalErrors.length > 0) {
      console.error('\n❌ Compilation Errors:', fatalErrors);
      process.exit(1);
    }
  }

  const contractOutput = output.contracts['TicketNFT.sol']['TicketNFT'];
  const abi = contractOutput.abi;
  const bytecode = contractOutput.evm.bytecode.object;

  console.log('✅ Compilation successful!');
  console.log('⏳ Deploying TicketNFT contract to Sepolia Testnet...');

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  // Constructor params: name, symbol, admin, feeReceiver, feeBps
  const contract = await factory.deploy(
    "CryptoVault Ticket NFT",
    "CVT",
    wallet.address,
    wallet.address,
    250 // 2.5% fee
  );

  console.log(`• Deployment TX Hash: ${contract.deploymentTransaction().hash}`);
  console.log('⏳ Waiting for block confirmation...');

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log('\n🎉 SMART CONTRACT DEPLOYED SUCCESSFULLY!');
  console.log(`• Contract Address: ${contractAddress}`);
  console.log(`• Etherscan Link:   https://sepolia.etherscan.io/address/${contractAddress}`);

  // Automatically update .env file with contract address
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('TICKET_CONTRACT_ADDRESS=')) {
    envContent = envContent.replace(/TICKET_CONTRACT_ADDRESS=.*/, `TICKET_CONTRACT_ADDRESS=${contractAddress}`);
  } else {
    envContent += `\nTICKET_CONTRACT_ADDRESS=${contractAddress}\n`;
  }
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated TICKET_CONTRACT_ADDRESS in crypto-vault-server/.env');
}

main().catch((err) => {
  console.error('\n❌ Deployment failed:', err);
  process.exit(1);
});
