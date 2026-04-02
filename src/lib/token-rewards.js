import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import bs58 from 'bs58';

const REWARD_AMOUNT_SOL = 0.01; // SOL per screening completion

/**
 * Get a Solana connection using the configured RPC URL.
 */
function getConnection() {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  if (!rpcUrl) throw new Error('SOLANA_RPC_URL not configured');
  return new Connection(rpcUrl, 'confirmed');
}

/**
 * Load the treasury keypair from environment variable.
 * Accepts TREASURY_PRIVATE_KEY as either:
 *   - Base58 string (e.g. "3fehaK6j...")
 *   - JSON byte array (e.g. [12,34,56,...])
 */
function getTreasuryKeypair() {
  const key = process.env.TREASURY_PRIVATE_KEY;
  if (!key) throw new Error('TREASURY_PRIVATE_KEY not configured');

  try {
    if (key.trim().startsWith('[')) {
      return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(key)));
    } else {
      return Keypair.fromSecretKey(bs58.decode(key.trim()));
    }
  } catch {
    throw new Error('TREASURY_PRIVATE_KEY must be a base58 string or JSON byte array');
  }
}

/**
 * Send SOL reward to a user's wallet for passing a screening.
 *
 * @param {string} recipientAddress - The user's Solana wallet address
 * @param {number} solAmount - Amount of SOL to send (default: REWARD_AMOUNT_SOL)
 * @returns {Promise<{success: boolean, signature?: string, amount?: number, error?: string}>}
 */
export async function sendSolReward(recipientAddress, solAmount = REWARD_AMOUNT_SOL) {
  try {
    if (!process.env.SOLANA_RPC_URL || !process.env.TREASURY_PRIVATE_KEY) {
      console.warn('[rewards] Reward env vars not configured, skipping SOL reward');
      return { success: false, error: 'Rewards not configured' };
    }

    const connection = getConnection();
    const treasury = getTreasuryKeypair();
    const recipient = new PublicKey(recipientAddress);
    const lamports = Math.round(solAmount * LAMPORTS_PER_SOL);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: treasury.publicKey,
        toPubkey: recipient,
        lamports,
      })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [treasury]);

    console.log(`[rewards] Sent ${solAmount} SOL to ${recipientAddress} — tx: ${signature}`);
    return { success: true, signature, amount: solAmount };
  } catch (error) {
    console.error('[rewards] Failed to send SOL reward:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Check if rewards are configured.
 */
export function isRewardsConfigured() {
  return !!(process.env.SOLANA_RPC_URL && process.env.TREASURY_PRIVATE_KEY);
}
