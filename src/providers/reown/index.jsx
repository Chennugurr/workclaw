import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaLocalnet } from '@reown/appkit/networks';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

// 0. Set up Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

// 1. Get projectId from https://cloud.reown.com
const nextPublicProjectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const defaultProjectId = 'b56e18d47c72ab683b10814fe9495694'; // this is a public projectId only to use on localhost
const projectId = nextPublicProjectId || defaultProjectId;

if (!projectId) {
  throw new Error('Project ID is not defined');
}

// 2. Create a metadata object - optional
const metadata = {
  name: 'Workclaw',
  description: 'AI Training Work Platform',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://workclaw-production.up.railway.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

// 3. Define networks
const networks = [solana];
if (process.env.NODE_ENV === 'development') {
  networks.push(solanaLocalnet);
}

// 4. Create modal
export const appkit = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

export default function AppKitProvider({ children }) {
  return children;
}
