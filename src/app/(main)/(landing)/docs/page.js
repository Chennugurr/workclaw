'use client';

import Link from 'next/link';
import { ChevronRight, Wallet, ClipboardCheck, Star, ShieldCheck, Layers, ArrowRight } from 'lucide-react';

const sections = [
  { id: 'what-is-humanlayer', label: 'What is HumanLayer?' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'screenings', label: 'Screenings' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'earnings', label: 'Earnings' },
  { id: 'reputation', label: 'Reputation' },
  { id: 'faq', label: 'FAQ' },
];

export default function DocsPage() {
  return (
    <div className='min-h-screen bg-[#050507] text-white'>
      {/* Nav */}
      <nav className='fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#050507]/80 backdrop-blur-xl'>
        <div className='max-w-7xl mx-auto px-6 h-14 flex items-center justify-between'>
          <Link href='/' className='flex items-center gap-2.5'>
            <img src='/logo.png' alt='HumanLayer' className='h-7 w-auto' />
            <span className='font-semibold text-sm tracking-wide'>HumanLayer</span>
          </Link>
          <div className='flex items-center gap-6 text-sm text-white/50'>
            <Link href='/' className='hover:text-white transition-colors'>Home</Link>
            <Link href='/app/contributor/opportunities' className='flex items-center gap-1.5 text-white bg-white/[0.08] border border-white/[0.12] px-3 py-1.5 rounded-md hover:bg-white/[0.12] transition-colors'>
              Open App <ArrowRight className='h-3.5 w-3.5' />
            </Link>
          </div>
        </div>
      </nav>

      <div className='max-w-7xl mx-auto px-6 pt-24 pb-24 flex gap-16'>

        {/* Sidebar */}
        <aside className='hidden lg:block w-56 shrink-0 sticky top-24 self-start'>
          <p className='text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-4'>On this page</p>
          <ul className='space-y-1'>
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className='flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors py-1'
                >
                  <ChevronRight className='h-3 w-3' />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Content */}
        <main className='flex-1 min-w-0 max-w-2xl'>

          {/* Header */}
          <div className='mb-14'>
            <div className='inline-flex items-center gap-2 text-xs font-medium text-cyan-400/80 border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 rounded-full mb-5'>
              Documentation
            </div>
            <h1 className='text-4xl font-bold mb-4 tracking-tight'>HumanLayer Docs</h1>
            <p className='text-white/60 text-lg leading-relaxed'>
              Everything you need to know about contributing to AI training on HumanLayer and earning SOL for your work.
            </p>
          </div>

          <div className='space-y-16'>

            {/* What is HumanLayer */}
            <section id='what-is-humanlayer'>
              <h2 className='text-2xl font-semibold mb-4'>What is HumanLayer?</h2>
              <div className='text-white/65 space-y-4 leading-relaxed'>
                <p>
                  HumanLayer is a platform where people get paid in SOL to help train AI models. AI companies need real humans to review, rate, and label AI-generated content — that work is what makes AI systems smarter and safer over time.
                </p>
                <p>
                  Unlike traditional platforms that pay through bank transfers that take weeks, HumanLayer pays you directly in Solana (SOL) the moment your work is complete. No bank account required. No waiting on payroll. Just connect a Solana wallet and start working.
                </p>
                <p>
                  HumanLayer is built for the web3 community. Your wallet is your identity — your work history, qualifications, and reputation are all tied to it.
                </p>
              </div>
            </section>

            <hr className='border-white/[0.06]' />

            {/* How it works */}
            <section id='how-it-works'>
              <h2 className='text-2xl font-semibold mb-6'>How it works</h2>
              <div className='space-y-5'>
                {[
                  {
                    icon: <Wallet className='h-5 w-5 text-cyan-400' />,
                    step: '1',
                    title: 'Connect your wallet',
                    desc: 'Sign in with any Solana wallet — Phantom, Solflare, or any other. No email or personal information needed.',
                  },
                  {
                    icon: <ClipboardCheck className='h-5 w-5 text-purple-400' />,
                    step: '2',
                    title: 'Pass a screening',
                    desc: 'Screenings are short qualification tests that prove your expertise in a specific area. Pass one to unlock the projects associated with it.',
                  },
                  {
                    icon: <Layers className='h-5 w-5 text-pink-400' />,
                    step: '3',
                    title: 'Apply to projects',
                    desc: 'Browse available AI training projects and apply to the ones that match your skills. Projects are added regularly across different domains.',
                  },
                  {
                    icon: <Star className='h-5 w-5 text-yellow-400' />,
                    step: '4',
                    title: 'Complete tasks and earn',
                    desc: 'Pick up tasks from your approved projects. Complete them carefully — your work directly influences how AI models behave.',
                  },
                ].map((item) => (
                  <div key={item.step} className='flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]'>
                    <div className='h-9 w-9 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0'>
                      {item.icon}
                    </div>
                    <div>
                      <p className='font-medium mb-1'>{item.title}</p>
                      <p className='text-sm text-white/55 leading-relaxed'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <hr className='border-white/[0.06]' />

            {/* Screenings */}
            <section id='screenings'>
              <h2 className='text-2xl font-semibold mb-4'>Screenings</h2>
              <div className='text-white/65 space-y-4 leading-relaxed'>
                <p>
                  Screenings are qualification tests that verify your knowledge before you can work on specific types of projects. Each screening covers a topic area — like content moderation, factuality review, or prompt evaluation.
                </p>
                <p>
                  Each screening has a set number of questions, a minimum passing score, and a maximum number of attempts. Take your time — there is no time pressure to rush through the questions.
                </p>
                <div className='bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-3 mt-2'>
                  <p className='font-medium text-white text-sm'>What to expect:</p>
                  <ul className='space-y-2 text-sm'>
                    {[
                      '10 multiple-choice questions per screening',
                      'Passing score varies by screening (typically 70–80%)',
                      'Up to 3 attempts if you don\'t pass on the first try',
                      'Passing a screening unlocks all projects that require it',
                    ].map((item) => (
                      <li key={item} className='flex items-start gap-2.5 text-white/60'>
                        <span className='text-cyan-400 mt-0.5'>–</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <hr className='border-white/[0.06]' />

            {/* Tasks */}
            <section id='tasks'>
              <h2 className='text-2xl font-semibold mb-4'>Tasks</h2>
              <div className='text-white/65 space-y-4 leading-relaxed'>
                <p>
                  Tasks are the actual work you do on HumanLayer. Each task is a structured unit of AI training work — usually taking a few minutes to complete. The most common type is a pairwise comparison, where you're shown two AI-generated responses and asked to choose the better one.
                </p>
                <p>
                  When you start a task, it's assigned to you. Complete it before the deadline to have your work counted. If you don't finish in time, the task returns to the pool for another contributor.
                </p>
                <div className='bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-3 mt-2'>
                  <p className='font-medium text-white text-sm'>Task types:</p>
                  <ul className='space-y-2 text-sm'>
                    {[
                      { name: 'Pairwise Comparison', desc: 'Choose the better of two AI responses based on accuracy, clarity, and helpfulness.' },
                      { name: 'Content Moderation', desc: 'Review AI outputs and flag content that is harmful, misleading, or policy-violating.' },
                      { name: 'Data Labeling', desc: 'Classify and annotate text or other content to build training datasets.' },
                      { name: 'Factuality Check', desc: 'Verify whether AI-generated claims are accurate and well-supported.' },
                    ].map((t) => (
                      <li key={t.name} className='text-white/60'>
                        <span className='text-white font-medium'>{t.name}</span> — {t.desc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <hr className='border-white/[0.06]' />

            {/* Earnings */}
            <section id='earnings'>
              <h2 className='text-2xl font-semibold mb-4'>Earnings</h2>
              <div className='text-white/65 space-y-4 leading-relaxed'>
                <p>
                  Every piece of work you complete on HumanLayer is rewarded in SOL, sent directly to your connected wallet. Payments happen automatically — there is no payout request, no minimum balance threshold, and no waiting period.
                </p>
                <p>
                  Each project sets its own rate. You can see the pay per task on every project listing before you apply. Your total earnings are tracked on the Earnings page in your dashboard.
                </p>
                <div className='bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-400/80'>
                  Make sure your Solana wallet is able to receive SOL. Most wallets (Phantom, Solflare) support this by default.
                </div>
              </div>
            </section>

            <hr className='border-white/[0.06]' />

            {/* Reputation */}
            <section id='reputation'>
              <h2 className='text-2xl font-semibold mb-4'>Reputation</h2>
              <div className='text-white/65 space-y-4 leading-relaxed'>
                <p>
                  Your reputation on HumanLayer is built through your work history and tied to your wallet address. It's portable — you own it, and it doesn't disappear if the platform changes.
                </p>
                <p>
                  Reputation grows when you pass screenings, complete tasks on time, and submit quality work. Higher reputation unlocks access to more projects and better-paying tasks over time.
                </p>
              </div>
            </section>

            <hr className='border-white/[0.06]' />

            {/* FAQ */}
            <section id='faq'>
              <h2 className='text-2xl font-semibold mb-6'>FAQ</h2>
              <div className='space-y-5'>
                {[
                  {
                    q: 'Do I need crypto experience to contribute?',
                    a: 'No. You just need a Solana wallet like Phantom. If you\'ve used any DeFi app before, you already know everything you need to get started.',
                  },
                  {
                    q: 'Which wallets are supported?',
                    a: 'Any Solana wallet works — Phantom, Solflare, Backpack, or any wallet that supports WalletConnect.',
                  },
                  {
                    q: 'How long do screenings take?',
                    a: 'Most screenings take 15–25 minutes. There\'s no timer per question, so you can work through them at your own pace.',
                  },
                  {
                    q: 'What happens if I fail a screening?',
                    a: 'You can retry up to the maximum attempt limit shown on the screening. Read the questions carefully — the answers are grounded in real knowledge, not trick wording.',
                  },
                  {
                    q: 'How quickly do I get paid?',
                    a: 'SOL rewards are sent to your wallet automatically when you complete qualifying work. On Solana, transfers settle in under a second.',
                  },
                  {
                    q: 'Is HumanLayer available worldwide?',
                    a: 'Yes. Because payments are on-chain in SOL, there are no geographic restrictions. Anyone with a Solana wallet can contribute.',
                  },
                  {
                    q: 'Where do the projects come from?',
                    a: 'Projects are created by AI teams who need human feedback to train and improve their models. HumanLayer is the platform connecting those teams to contributors.',
                  },
                ].map((item) => (
                  <div key={item.q} className='border border-white/[0.06] rounded-xl p-5'>
                    <p className='font-medium mb-2 text-white'>{item.q}</p>
                    <p className='text-sm text-white/55 leading-relaxed'>{item.a}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* CTA */}
          <div className='mt-16 p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center'>
            <h3 className='text-xl font-semibold mb-2'>Ready to start?</h3>
            <p className='text-white/55 text-sm mb-6'>Connect your Solana wallet and complete your first screening today.</p>
            <Link
              href='/app/contributor/screenings'
              className='inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-white/90 transition-colors'
            >
              Get started <ArrowRight className='h-4 w-4' />
            </Link>
          </div>

        </main>
      </div>
    </div>
  );
}
