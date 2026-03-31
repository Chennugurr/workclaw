import DocPage from '../DocPage';

const toc = [
  { id: 'before-you-begin', label: 'Before you begin', level: 2 },
  { id: 'create-your-account', label: 'Create your account', level: 2 },
  { id: 'complete-your-profile', label: 'Complete your profile', level: 2 },
  { id: 'take-your-first-screening', label: 'Take your first screening', level: 2 },
  { id: 'next-steps', label: 'Next steps', level: 2 },
];

export default function GettingStartedPage() {
  return (
    <DocPage
      title='Getting Started'
      description='Everything you need to go from zero to your first completed task on HumanLayer.'
      toc={toc}
    >
      <h2 id='before-you-begin'>Before you begin</h2>
      <p>You only need one thing to use HumanLayer:</p>
      <ul>
        <li>A Solana wallet — Phantom, Solflare, Backpack, or any WalletConnect-compatible wallet</li>
      </ul>
      <p>
        No email address, no bank account, and no identity verification required. Your wallet address
        is your account.
      </p>
      <div className='callout callout-info'>
        If you do not have a Solana wallet yet, download Phantom at phantom.app. It takes about two
        minutes to set up and is free.
      </div>

      <h2 id='create-your-account'>Create your account</h2>
      <div className='step-grid'>
        {[
          { n: '1', t: 'Go to humanlayer.cloud', d: 'Open the app and click "Connect Wallet" in the top right corner.' },
          { n: '2', t: 'Select your wallet', d: 'Choose your wallet from the list. The modal will prompt your wallet extension to connect.' },
          { n: '3', t: 'Sign the message', d: 'Your wallet will ask you to sign a message. This is not a transaction — it does not cost gas and nothing leaves your wallet. It is just a way to prove you own the address.' },
          { n: '4', t: 'You are in', d: 'Once signed, your account is created and you land on the contributor dashboard.' },
        ].map((s) => (
          <div key={s.n} className='step'>
            <div className='step-num'>{s.n}</div>
            <div>
              <p className='font-medium text-white text-sm mb-1'>{s.t}</p>
              <p className='text-sm text-white/50 leading-relaxed !mb-0'>{s.d}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 id='complete-your-profile'>Complete your profile</h2>
      <p>
        After connecting, head to your Profile page. Adding your areas of expertise and a short
        bio helps project owners understand your background when reviewing applications.
      </p>
      <p>
        This step is optional but recommended — especially if you plan to apply to specialized
        projects that require demonstrated knowledge in a specific domain.
      </p>

      <h2 id='take-your-first-screening'>Take your first screening</h2>
      <p>
        Go to the Screenings page. You will see the available qualification tests. Each one takes
        15 to 25 minutes and covers a specific knowledge area.
      </p>
      <p>
        Pick the screening that best matches your background and click Start. Answer carefully —
        there is no time pressure per question, so read each one fully before selecting your answer.
      </p>
      <div className='callout callout-warn'>
        You have a limited number of attempts per screening, usually three. Do not rush. Take the
        time to think through each answer.
      </div>

      <h2 id='next-steps'>Next steps</h2>
      <ul>
        <li>Read the Screenings guide to understand how qualifications work</li>
        <li>Browse Opportunities to see what projects are available</li>
        <li>Check the Earnings page to understand how SOL payouts work</li>
      </ul>
    </DocPage>
  );
}
