import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

const TOKEN_DECIMALS = 6; // pump.fun tokens use 6 decimals

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
 * Expects TREASURY_PRIVATE_KEY as a JSON array of bytes, e.g. [12,34,56,...]
 */
function getTreasuryKeypair() {
  const key = process.env.TREASURY_PRIVATE_KEY;
  if (!key) throw new Error('TREASURY_PRIVATE_KEY not configured');
  try {
    const secretKey = Uint8Array.from(JSON.parse(key));
    return Keypair.fromSecretKey(secretKey);
  } catch {
    throw new Error('TREASURY_PRIVATE_KEY must be a JSON array of bytes');
  }
}

/**
 * Get the reward token mint address from environment.
 */
function getRewardMint() {
  const mint = process.env.REWARD_TOKEN_MINT;
  if (!mint) throw new Error('REWARD_TOKEN_MINT not configured');
  return new PublicKey(mint);
}

/**
 * Send token rewards to a user's wallet.
 *
 * @param {string} recipientAddress - The user's Solana wallet address
 * @param {number} tokenAmount - Number of tokens to send (whole tokens, not smallest unit)
 * @returns {Promise<{success: boolean, signature?: string, error?: string}>}
 */
export async function sendTokenReward(recipientAddress, tokenAmount = 1) {
  try {
    // Validate env vars are set
    if (!process.env.SOLANA_RPC_URL || !process.env.TREASURY_PRIVATE_KEY || !process.env.REWARD_TOKEN_MINT) {
      console.warn('[token-rewards] Reward env vars not configured, skipping token reward');
      return { success: false, error: 'Token rewards not configured' };
    }

    const connection = getConnection();
    const treasury = getTreasuryKeypair();
    const mint = getRewardMint();
    const recipient = new PublicKey(recipientAddress);

    // Amount in smallest unit (6 decimals for pump.fun tokens)
    const amount = BigInt(tokenAmount) * BigInt(10 ** TOKEN_DECIMALS);

    // Get or create the treasury's token account
    const sourceAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      treasury,
      mint,
      treasury.publicKey
    );

    // Get or create the recipient's token account
    const destinationAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      treasury, // treasury pays for account creation if needed
      mint,
      recipient
    );

    // Build transfer instruction
    const transferIx = createTransferInstruction(
      sourceAccount.address,
      destinationAccount.address,
      treasury.publicKey,
      amount
    );

    const transaction = new Transaction().add(transferIx);

    // Send and confirm
    const signature = await sendAndConfirmTransaction(connection, transaction, [treasury]);

    console.log(`[token-rewards] Sent ${tokenAmount} token(s) to ${recipientAddress} — tx: ${signature}`);
    return { success: true, signature };
  } catch (error) {
    console.error('[token-rewards] Failed to send reward:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Check if token rewards are configured.
 */
export function isRewardsConfigured() {
  return !!(
    process.env.SOLANA_RPC_URL &&
    process.env.TREASURY_PRIVATE_KEY &&
    process.env.REWARD_TOKEN_MINT
  );
}
