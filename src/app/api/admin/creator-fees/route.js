import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../middleware';
import {
  Connection,
  Keypair,
  Transaction,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { OnlinePumpSdk } from '@pump-fun/pump-sdk';

function getConnection() {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  if (!rpcUrl) throw new Error('SOLANA_RPC_URL not configured');
  return new Connection(rpcUrl, 'confirmed');
}

function getTreasuryKeypair() {
  const key = process.env.TREASURY_PRIVATE_KEY;
  if (!key) throw new Error('TREASURY_PRIVATE_KEY not configured');
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(key)));
}

/**
 * GET /api/admin/creator-fees
 * Check the accumulated creator fee balance in the pump.fun vault.
 */
export const GET = middleware(
  requireAdmin(async () => {
    if (!process.env.SOLANA_RPC_URL || !process.env.TREASURY_PRIVATE_KEY) {
      return NextResponse.json(
        jsend.fail({ message: 'Solana env vars not configured' }),
        { status: 400 }
      );
    }

    const connection = getConnection();
    const treasury = getTreasuryKeypair();
    const sdk = new OnlinePumpSdk(connection);

    const vaultBalance = await sdk.getCreatorVaultBalanceBothPrograms(treasury.publicKey);
    const treasuryBalance = await connection.getBalance(treasury.publicKey);

    return NextResponse.json(
      jsend.success({
        creatorVault: {
          balanceLamports: vaultBalance.toNumber(),
          balanceSol: vaultBalance.toNumber() / LAMPORTS_PER_SOL,
        },
        treasury: {
          address: treasury.publicKey.toBase58(),
          balanceLamports: treasuryBalance,
          balanceSol: treasuryBalance / LAMPORTS_PER_SOL,
        },
      })
    );
  }),
  { requireAuth: true }
);

/**
 * POST /api/admin/creator-fees
 * Collect accumulated creator fees from the pump.fun vault into the treasury wallet.
 */
export const POST = middleware(
  requireAdmin(async () => {
    if (!process.env.SOLANA_RPC_URL || !process.env.TREASURY_PRIVATE_KEY) {
      return NextResponse.json(
        jsend.fail({ message: 'Solana env vars not configured' }),
        { status: 400 }
      );
    }

    const connection = getConnection();
    const treasury = getTreasuryKeypair();
    const sdk = new OnlinePumpSdk(connection);

    // Check balance first
    const balanceBefore = await sdk.getCreatorVaultBalanceBothPrograms(treasury.publicKey);
    if (balanceBefore.isZero()) {
      return NextResponse.json(
        jsend.fail({ message: 'No creator fees to collect' }),
        { status: 400 }
      );
    }

    // Build and send the collect transaction
    const instructions = await sdk.collectCoinCreatorFeeInstructions(
      treasury.publicKey
    );

    if (!instructions || instructions.length === 0) {
      return NextResponse.json(
        jsend.fail({ message: 'No collect instructions generated' }),
        { status: 400 }
      );
    }

    const transaction = new Transaction().add(...instructions);
    const signature = await sendAndConfirmTransaction(connection, transaction, [treasury]);

    // Check balance after collection
    const treasuryBalance = await connection.getBalance(treasury.publicKey);

    return NextResponse.json(
      jsend.success({
        collected: {
          lamports: balanceBefore.toNumber(),
          sol: balanceBefore.toNumber() / LAMPORTS_PER_SOL,
        },
        signature,
        treasury: {
          address: treasury.publicKey.toBase58(),
          balanceLamports: treasuryBalance,
          balanceSol: treasuryBalance / LAMPORTS_PER_SOL,
        },
      }),
      { status: 200 }
    );
  }),
  { requireAuth: true }
);
