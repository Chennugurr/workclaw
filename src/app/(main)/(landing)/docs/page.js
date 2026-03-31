import DocPage from './DocPage';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const toc = [
  { id: 'what-is-humanlayer', label: 'What is HumanLayer?', level: 2 },
  { id: 'how-it-works', label: 'How it works', level: 2 },
  { id: 'who-is-it-for', label: 'Who is it for?', level: 2 },
];

export default function DocsIntroPage() {
  return (
    <DocPage
      title='Introduction'
      description='HumanLayer is the first crypto-native AI training platform. Get paid in SOL to help train AI models — no bank account needed.'
      toc={toc}
    >
      <h2 id='what-is-humanlayer'>What is HumanLayer?</h2>
      <p>
        AI companies need real humans to review, rate, and label AI-generated content. That human feedback
        is what makes AI systems smarter, safer, and more aligned with how people actually think and communicate.
      </p>
      <p>
        HumanLayer is the platform that connects those AI teams to contributors — people who do that work
        and get paid directly in Solana (SOL) the moment it is complete.
      </p>
      <p>
        Unlike traditional platforms that require bank accounts, lengthy onboarding, and payment delays
        that can stretch weeks, HumanLayer is built on Solana. Connect a wallet, pass a qualification,
        and start working. Payments settle in under a second.
      </p>

      <h2 id='how-it-works'>How it works</h2>
      <div className='step-grid'>
        {[
          { n: '1', t: 'Connect your wallet', d: 'Sign in with any Solana wallet. No email, no KYC, no personal information required.' },
          { n: '2', t: 'Pass a screening', d: 'Take a short qualification test to prove your expertise. Passing unlocks the projects that require it.' },
          { n: '3', t: 'Apply to projects', d: 'Browse AI training projects and apply to the ones that match your knowledge.' },
          { n: '4', t: 'Complete tasks and earn', d: 'Pick up tasks, submit your work, and receive SOL directly to your wallet.' },
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

      <h2 id='who-is-it-for'>Who is it for?</h2>
      <p>
        HumanLayer is built for the web3 community — people who already have Solana wallets and want
        to earn SOL doing meaningful knowledge work rather than trading or farming yields.
      </p>
      <p>
        If you have domain expertise in DeFi, NFTs, security, governance, or any other web3 area,
        your knowledge is exactly what AI teams need when building models that understand crypto.
      </p>

      <div className='not-prose mt-8'>
        <Link
          href='/docs/getting-started'
          className='inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors'
        >
          Get started <ArrowRight className='h-4 w-4' />
        </Link>
      </div>
    </DocPage>
  );
}
