import { nanoid } from 'nanoid';
import {
  useAppKitProvider,
  useAppKitAccount,
  useAppKitNetwork,
} from '@reown/appkit/react';
import { SiwsMessage } from '@/lib/siws';

export default function useSIWS() {
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider('solana');
  const { address, isConnected } = useAppKitAccount();

  const generateMessage = () => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }
    return new SiwsMessage({
      domain: window.location.host,
      address,
      statement: `Sign in with Solana to access Workclaw. This action will not trigger any blockchain transactions or incur any gas fees`,
      uri: window.location.origin,
      version: '1',
      chainId: chainId,
      nonce: nanoid(8),
      issuedAt: new Date().toISOString(),
    });
  };

  const signMessage = async () => {
    const message = generateMessage();
    const signature = await walletProvider.signMessage(message.prepare());
    const token = message.token(signature);
    return { message, signature, token };
  };

  return {
    generateMessage,
    signMessage,
  };
}
