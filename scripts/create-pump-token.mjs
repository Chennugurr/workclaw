/**
 * One-time script to create the HUMANLAYER token on pump.fun.
 *
 * Usage:
 *   TREASURY_PRIVATE_KEY='[...]' SOLANA_RPC_URL='https://...' node scripts/create-pump-token.mjs
 *
 * The script will:
 *   1. Generate a new mint keypair
 *   2. Create the token on pump.fun using createV2
 *   3. Optionally do an initial buy
 *   4. Print the mint address to set as REWARD_TOKEN_MINT
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { PumpSdk, OnlinePumpSdk } from '@pump-fun/pump-sdk';
import BN from 'bn.js';

const RPC_URL = process.env.SOLANA_RPC_URL || 'https://rpc.solanatracker.io/public';
const INITIAL_BUY_SOL = parseFloat(process.env.INITIAL_BUY_SOL || '0.1');

// Token metadata — update before running
const TOKEN_NAME = 'HumanLayer';
const TOKEN_SYMBOL = 'HLAYER';
const TOKEN_URI = ''; // Set to your metadata JSON URI (upload to IPFS/Arweave first)

function getCreatorKeypair() {
  const key = process.env.TREASURY_PRIVATE_KEY;
  if (!key) {
    console.error('Set TREASURY_PRIVATE_KEY env var (JSON byte array)');
    process.exit(1);
  }
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(key)));
}

async function main() {
  if (!TOKEN_URI) {
    console.error('Set TOKEN_URI in the script before running.');
    console.error('Upload your token metadata JSON + image to IPFS first.');
    console.error('See: https://pump.fun for metadata format.');
    process.exit(1);
  }

  const connection = new Connection(RPC_URL, 'confirmed');
  const creator = getCreatorKeypair();
  const mint = Keypair.generate();
  const sdk = new PumpSdk(connection);

  console.log('Creating HUMANLAYER token on pump.fun...');
  console.log(`  Creator: ${creator.publicKey.toBase58()}`);
  console.log(`  Mint:    ${mint.publicKey.toBase58()}`);
  console.log(`  Name:    ${TOKEN_NAME}`);
  console.log(`  Symbol:  ${TOKEN_SYMBOL}`);

  if (INITIAL_BUY_SOL > 0) {
    // Create token + initial buy in one transaction
    const global = await sdk.fetchGlobal();
    const solAmount = new BN(INITIAL_BUY_SOL * 1e9);

    const instructions = await sdk.createV2AndBuyInstructions({
      global,
      mint: mint.publicKey,
      name: TOKEN_NAME,
      symbol: TOKEN_SYMBOL,
      uri: TOKEN_URI,
      creator: creator.publicKey,
      user: creator.publicKey,
      solAmount,
      amount: sdk.getBuyTokenAmountFromSolAmount({
        global,
        bondingCurve: null,
        amount: solAmount,
      }),
      mayhemMode: false,
    });

    const tx = new Transaction().add(...instructions);
    const sig = await sendAndConfirmTransaction(connection, tx, [creator, mint]);
    console.log(`\nToken created + initial buy of ${INITIAL_BUY_SOL} SOL`);
    console.log(`  Tx: ${sig}`);
  } else {
    // Create token only
    const instruction = await sdk.createV2Instruction({
      mint: mint.publicKey,
      name: TOKEN_NAME,
      symbol: TOKEN_SYMBOL,
      uri: TOKEN_URI,
      creator: creator.publicKey,
      user: creator.publicKey,
      mayhemMode: false,
    });

    const tx = new Transaction().add(instruction);
    const sig = await sendAndConfirmTransaction(connection, tx, [creator, mint]);
    console.log(`\nToken created!`);
    console.log(`  Tx: ${sig}`);
  }

  console.log(`\n========================================`);
  console.log(`  MINT ADDRESS: ${mint.publicKey.toBase58()}`);
  console.log(`========================================`);
  console.log(`\nSet this in Railway:`);
  console.log(`  REWARD_TOKEN_MINT=${mint.publicKey.toBase58()}`);
  console.log(`\nView on pump.fun:`);
  console.log(`  https://pump.fun/coin/${mint.publicKey.toBase58()}`);
}

main().catch((e) => {
  console.error('Failed:', e);
  process.exit(1);
});
