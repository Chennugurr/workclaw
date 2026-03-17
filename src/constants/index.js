// import { zeroAddress } from 'viem';
import deepFreeze from '@/lib/deep-freeze';
// import { ESCROW_ABI } from './abis/escrow';
// import { TOKEN_ABI } from './abis/token';

export const CURRENCY = {
  USDC: '\u0024',
};

// export const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
// export const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_ADDRESS;

// export const CONTRACT = {
//   TOKEN: {
//     address: TOKEN_ADDRESS || zeroAddress,
//     abi: TOKEN_ABI,
//   },
//   ESCROW: {
//     address: ESCROW_ADDRESS || zeroAddress,
//     abi: ESCROW_ABI,
//   },
// };

export const TOAST_IDS = deepFreeze({
  SIWE: Symbol('siwe-toast'),
  AUTH_GUARD: Symbol('auth-guard'),
  UPDATE_PROFILE: Symbol('update-profile'),
  CREATE_ORGANIZATION: Symbol('create-organization'),
  UPDATE_ORGANIZATION: Symbol('update-organization'),
  CREATE_JOB: Symbol('create-job'),
  UPDATE_JOB: Symbol('update-job'),
  SUBMIT_PROPOSAL: Symbol('submit-proposal'),
  WITHDRAW_PROPOSAL: Symbol('withdraw-proposal'),
  UPDATE_PROPOSAL_STATUS: Symbol('update-proposal-status'),
  DEPOSIT_AND_HIRE: Symbol('deposit-and-hire'),
});
