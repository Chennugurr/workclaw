import DocPage from '../DocPage';

const faqs = [
  {
    q: 'Do I need crypto experience to contribute?',
    a: 'No. You just need a Solana wallet like Phantom. If you have used any web3 app before, you already know everything required. If not, setting up a wallet takes about two minutes.',
  },
  {
    q: 'Which wallets are supported?',
    a: 'Phantom, Solflare, Backpack, and any other Solana wallet that supports WalletConnect. Most popular Solana wallets work out of the box.',
  },
  {
    q: 'Is signing in safe? Does connecting my wallet give HumanLayer access to my funds?',
    a: 'Connecting your wallet and signing the login message does not give HumanLayer any access to your funds. Signing is a way to prove you own the wallet address — it is not a transaction and costs no gas. Nothing leaves your wallet during sign-in.',
  },
  {
    q: 'How long do screenings take?',
    a: 'Most screenings have 10 questions and take 15 to 25 minutes. There is no per-question timer, so you can work through them at your own pace.',
  },
  {
    q: 'What happens if I fail a screening?',
    a: 'You can retry up to the maximum attempt limit shown on the screening card, usually three attempts. Review the topic area before retrying. Once all attempts are used, you cannot retake that screening.',
  },
  {
    q: 'How quickly do I get paid?',
    a: 'SOL is sent to your wallet automatically when you complete qualifying work. Solana transactions settle in under a second, so the payment typically arrives almost immediately.',
  },
  {
    q: 'Is there a minimum amount before I can receive payment?',
    a: 'No. There is no minimum balance threshold. Every qualifying completion triggers a direct payment to your wallet regardless of the amount.',
  },
  {
    q: 'Is HumanLayer available worldwide?',
    a: 'Yes. Because payments are on-chain in SOL, there are no geographic restrictions or payment processor limitations. Anyone with a Solana wallet can contribute from anywhere.',
  },
  {
    q: 'How are projects added to the platform?',
    a: 'Projects come from AI teams and companies who need human feedback to train or evaluate their models. New projects are added regularly. Passing screenings ensures you are notified when relevant projects open.',
  },
  {
    q: 'Can I use multiple wallets?',
    a: 'Each wallet address is a separate account. Your reputation, earnings, and qualifications are tied to the specific wallet you sign in with. We recommend using one consistent wallet.',
  },
  {
    q: 'What if I have a problem with a task or payment?',
    a: 'Contact support through the platform. For payment issues, every transaction has an on-chain signature you can share to verify the status.',
  },
];

export default function FAQPage() {
  return (
    <DocPage
      title='FAQ'
      description='Answers to the most common questions about HumanLayer.'
    >
      <div className='space-y-0 divide-y divide-white/[0.05]'>
        {faqs.map((item) => (
          <div key={item.q} className='py-6 first:pt-0'>
            <h3 className='!mt-0 !mb-2'>{item.q}</h3>
            <p className='!mb-0'>{item.a}</p>
          </div>
        ))}
      </div>
    </DocPage>
  );
}
