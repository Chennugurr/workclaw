'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, ArrowRight, Shield, Zap, Brain, Target, Users, CheckCircle, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Task Types', href: '#task-types' },
  { name: 'For Contributors', href: '#for-contributors' },
  { name: 'For Teams', href: '#for-teams' },
  { name: 'FAQ', href: '#faq' },
];

const taskTypes = [
  {
    icon: <Target className='h-6 w-6' />,
    title: 'AI Response Rating',
    description: 'Rate and rank AI-generated responses for accuracy, helpfulness, and safety across diverse domains.',
  },
  {
    icon: <Shield className='h-6 w-6' />,
    title: 'Safety & Content Moderation',
    description: 'Classify AI outputs for harmful content, bias, misinformation, and policy violations.',
  },
  {
    icon: <Brain className='h-6 w-6' />,
    title: 'Data Labeling & Annotation',
    description: 'Label text, images, and structured data to create high-quality training datasets for AI models.',
  },
  {
    icon: <Zap className='h-6 w-6' />,
    title: 'Prompt Engineering',
    description: 'Write and refine prompts for LLMs — chatbots, coding assistants, research agents, and more.',
  },
  {
    icon: <CheckCircle className='h-6 w-6' />,
    title: 'Factuality Verification',
    description: 'Verify whether AI-generated claims are factually correct across science, math, coding, and more.',
  },
  {
    icon: <Users className='h-6 w-6' />,
    title: 'Red Team Testing',
    description: 'Test AI systems for vulnerabilities, hallucinations, jailbreaks, and unsafe behaviors.',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Connect & Qualify',
    description: 'Connect your wallet, build your expertise profile, and pass screening tests to prove your domain knowledge.',
  },
  {
    step: '02',
    title: 'Browse Opportunities',
    description: 'Find projects that match your skills — from AI evaluation to data labeling to safety testing.',
  },
  {
    step: '03',
    title: 'Complete Tasks',
    description: 'Work through structured AI training tasks at your own pace. Rate responses, classify content, verify facts.',
  },
  {
    step: '04',
    title: 'Get Paid',
    description: 'Earn SOL for every approved task. Higher quality and expertise unlock better-paying work.',
  },
];

const faqItems = [
  {
    q: 'What kind of work is available?',
    a: 'AI training tasks across many domains: rating LLM responses, labeling data, verifying facts, writing prompts, red-teaming AI systems, and more. Tasks are structured and have clear instructions and rubrics.',
  },
  {
    q: 'How do I get paid?',
    a: 'You earn per task or per hour, depending on the project. Payments are in SOL, sent directly to your wallet. Quality bonuses and streak incentives are available for consistent contributors.',
  },
  {
    q: 'Do I need coding experience?',
    a: 'Not necessarily. Many tasks require domain knowledge rather than coding skills — evaluating AI responses, labeling data, reviewing content for accuracy. Some specialized tasks (code review, technical writing) do require technical expertise.',
  },
  {
    q: 'How are screenings used?',
    a: 'Screenings are short qualification tests that verify your knowledge in specific domains (writing, coding, math, science, etc.). Passing screenings unlocks higher-paying projects that require that expertise.',
  },
  {
    q: 'What is a trust score?',
    a: 'Your trust score reflects the quality and consistency of your work. It is built from screening performance, task accuracy, reviewer feedback, and gold task benchmarks. Higher scores unlock better opportunities and higher pay tiers.',
  },
];

function GlassCard({ children, className, hover = true }) {
  return (
    <div className={cn(
      'bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl',
      hover && 'hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300',
      className
    )}>
      {children}
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className='border-b border-white/[0.08]'>
      <button
        onClick={() => setOpen(!open)}
        className='w-full flex items-center justify-between py-5 text-left'
      >
        <span className='text-lg font-medium text-white/90'>{q}</span>
        <ChevronDown className={cn('h-5 w-5 text-white/40 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className='pb-5 text-white/50 leading-relaxed'
        >
          {a}
        </motion.p>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className='w-full min-h-screen text-white selection:bg-purple-500/30'>
      {/* Header */}
      <header className='sticky top-0 z-50 border-b border-white/[0.06] bg-[#050508]/80 backdrop-blur-2xl'>
        <nav className='container mx-auto flex items-center justify-between px-4 md:px-8 h-16'>
          <Link href='/' className='flex items-center gap-2'>
            <Image src='/images/brand/logo.png' alt='HumanLayer' width={32} height={32} className='rounded-md' />
            <Image src='/images/brand/wordmark-light.png' alt='HumanLayer' width={120} height={28} className='hidden sm:block' />
          </Link>

          <div className='hidden lg:flex items-center gap-x-8'>
            {navItems.map(({ name, href }) => (
              <a
                key={name}
                href={href}
                className='text-sm font-medium text-white/50 hover:text-white transition-colors'
              >
                {name}
              </a>
            ))}
          </div>

          <div className='flex items-center gap-x-3'>
            <Button size='sm' variant='outline' asChild className='border-white/10 text-white/70 hover:bg-white/5 hover:text-white bg-transparent'>
              <Link href='/app'>Sign In</Link>
            </Button>
            <Button size='sm' asChild className='bg-white text-black hover:bg-white/90'>
              <Link href='/app'>Get Started</Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant='ghost' size='icon' className='lg:hidden text-white/70 hover:text-white hover:bg-white/5'>
                  <Menu className='h-5 w-5' />
                </Button>
              </SheetTrigger>
              <SheetContent side='right' className='bg-[#0a0a0f] border-white/10'>
                <nav className='flex flex-col gap-4 mt-8'>
                  {navItems.map(({ name, href }) => (
                    <a key={name} href={href} className='text-lg font-medium text-white/70 hover:text-white'>
                      {name}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className='relative py-28 md:py-40 overflow-hidden'>
          {/* Background image */}
          <div className='absolute inset-0 flex justify-center items-center pointer-events-none'>
            <div className='relative' style={{ animation: 'float 8s ease-in-out infinite' }}>
              <Image src='/images/brand/hero-vitruvian.png' alt='' width={700} height={700} className='object-contain opacity-[0.15]' priority />
              {/* Glow behind image */}
              <div className='absolute inset-0 bg-gradient-radial from-purple-500/20 via-transparent to-transparent blur-3xl' />
            </div>
          </div>
          {/* Gradient orbs */}
          <div className='absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none' />
          <div className='absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none' />

          <div className='container mx-auto px-4 md:px-8 text-center max-w-4xl relative z-10'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className='text-sm font-semibold text-cyan-400/80 uppercase tracking-[0.2em] mb-6'>
                The First Crypto-Native AI Training Platform
              </p>
              <h1 className='text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-8'>
                <span className='glitch-text' data-text='Earn money'>Earn money</span>
                <br />
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400'>
                  training AI
                </span>
              </h1>
              <p className='text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed'>
                Complete structured AI training tasks — labeling, ranking, reviewing, red-teaming — earn SOL, and build a verified on-chain reputation.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button size='lg' asChild className='bg-white text-black hover:bg-white/90 text-base px-8 h-12'>
                  <Link href='/app'>
                    Start Earning <ArrowRight className='ml-2 h-5 w-5' />
                  </Link>
                </Button>
                <Button size='lg' variant='outline' asChild className='border-white/15 text-white/70 hover:bg-white/5 hover:text-white text-base px-8 h-12 bg-transparent'>
                  <a href='#how-it-works'>Learn More</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className='border-y border-white/[0.06] bg-white/[0.02]'>
          <div className='container mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
            {[
              { label: 'Task Types', value: '14+' },
              { label: 'Expertise Domains', value: '20+' },
              { label: 'Languages', value: '16+' },
              { label: 'Payment', value: 'SOL' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className='text-3xl font-bold text-white'>{value}</p>
                <p className='text-sm text-white/40 mt-1'>{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id='how-it-works' className='relative py-28 overflow-hidden'>
          <div className='absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block'>
            <Image src='/images/brand/face-polygon-dark.png' alt='' width={450} height={450} className='opacity-20' />
          </div>
          <div className='absolute left-0 top-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none' />

          <div className='container mx-auto px-4 md:px-8 max-w-5xl relative z-10'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-5xl font-bold text-white mb-4'>How it works</h2>
              <p className='text-lg text-white/40 max-w-2xl mx-auto'>
                From sign-up to payout in four steps. Work remotely, on your own schedule.
              </p>
            </div>
            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {howItWorks.map(({ step, title, description }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard className='p-6 glass-glow h-full'>
                    <p className='text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 mb-4'>{step}</p>
                    <h3 className='text-lg font-semibold text-white mb-2'>{title}</h3>
                    <p className='text-white/40 text-sm leading-relaxed'>{description}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Task Types */}
        <section id='task-types' className='py-28 bg-white/[0.01]'>
          <div className='container mx-auto px-4 md:px-8 max-w-6xl'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-5xl font-bold text-white mb-4'>Types of work</h2>
              <p className='text-lg text-white/40 max-w-2xl mx-auto'>
                Structured AI training tasks across diverse domains. Each task has clear instructions, rubrics, and examples.
              </p>
            </div>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {taskTypes.map(({ icon, title, description }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <GlassCard className='p-6 glass-glow h-full'>
                    <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/[0.08] flex items-center justify-center mb-4 text-cyan-400'>
                      {icon}
                    </div>
                    <h3 className='text-lg font-semibold text-white mb-2'>{title}</h3>
                    <p className='text-white/40 text-sm leading-relaxed'>{description}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* For Contributors */}
        <section id='for-contributors' className='relative py-28 overflow-hidden'>
          <div className='absolute right-0 bottom-0 pointer-events-none hidden lg:block'>
            <Image src='/images/brand/figure-colorful-dark.png' alt='' width={350} height={350} className='opacity-30' />
          </div>
          <div className='absolute right-20 top-20 w-64 h-64 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none' />

          <div className='container mx-auto px-4 md:px-8 max-w-5xl relative z-10'>
            <div className='grid md:grid-cols-2 gap-16 items-center'>
              <div>
                <p className='text-sm font-semibold text-cyan-400/80 uppercase tracking-[0.15em] mb-4'>For Contributors</p>
                <h2 className='text-3xl md:text-4xl font-bold text-white mb-6'>
                  Get paid for your expertise
                </h2>
                <ul className='space-y-4'>
                  {[
                    'Work remotely on your own schedule',
                    'Earn SOL for every approved task',
                    'Pass screenings to unlock better-paying work',
                    'Build a verified reputation in AI training',
                    'Quality bonuses for consistent high performers',
                    'Multiple expertise tracks: writing, coding, math, science, and more',
                  ].map((item) => (
                    <li key={item} className='flex items-start gap-3'>
                      <CheckCircle className='h-5 w-5 text-cyan-400/70 mt-0.5 flex-shrink-0' />
                      <span className='text-white/60'>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button size='lg' asChild className='mt-8 bg-white text-black hover:bg-white/90'>
                  <Link href='/app'>
                    Apply as Contributor <ArrowRight className='ml-2 h-5 w-5' />
                  </Link>
                </Button>
              </div>
              <GlassCard className='p-8 glass-glow neon-border'>
                <h3 className='text-lg font-semibold text-white mb-4'>Areas of Expertise</h3>
                <div className='flex flex-wrap gap-2'>
                  {[
                    'Creative Writing', 'Technical Writing', 'Mathematics', 'Science',
                    'Coding', 'Data Analysis', 'Research', 'Linguistics',
                    'Moderation', 'Prompt Engineering', 'Red Teaming',
                    'Medicine', 'Law', 'Finance', 'Education', 'Philosophy',
                  ].map((tag) => (
                    <span key={tag} className='px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full text-sm text-white/60 hover:text-white/80 hover:border-white/20 transition-all'>
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* For Teams */}
        <section id='for-teams' className='relative py-28 overflow-hidden'>
          <div className='absolute left-0 bottom-0 pointer-events-none hidden lg:block'>
            <Image src='/images/brand/vitruvian-sphere.png' alt='' width={400} height={400} className='opacity-15' />
          </div>
          <div className='absolute left-20 bottom-20 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none' />

          <div className='container mx-auto px-4 md:px-8 max-w-5xl relative z-10'>
            <div className='grid md:grid-cols-2 gap-16 items-center'>
              <GlassCard className='p-8 glass-glow order-2 md:order-1'>
                <h3 className='text-lg font-semibold text-white mb-4'>Who uses HumanLayer</h3>
                <ul className='space-y-3'>
                  {[
                    'AI labs fine-tuning foundation models',
                    'Startups building LLM-powered products',
                    'Enterprises training domain-specific AI',
                    'Research teams evaluating model safety',
                    'Companies building AI assistants and agents',
                    'Teams needing high-quality labeled datasets',
                    'Organizations improving AI accuracy and reliability',
                  ].map((item) => (
                    <li key={item} className='flex items-start gap-3'>
                      <div className='h-1.5 w-1.5 rounded-full bg-purple-400/60 mt-2 flex-shrink-0' />
                      <span className='text-white/50 text-sm'>{item}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
              <div className='order-1 md:order-2'>
                <p className='text-sm font-semibold text-purple-400/80 uppercase tracking-[0.15em] mb-4'>For Organizations</p>
                <h2 className='text-3xl md:text-4xl font-bold text-white mb-6'>
                  Train your AI with qualified human experts
                </h2>
                <p className='text-white/50 mb-6 leading-relaxed'>
                  Post structured AI training projects. Get high-quality human feedback from screened contributors with verified domain expertise.
                </p>
                <ul className='space-y-3 mb-8'>
                  {[
                    'Screened contributor pool with verified expertise',
                    'Quality assurance with gold tasks and consensus scoring',
                    'Structured task types — no custom tooling needed',
                    'Pay per task or per hour, in SOL',
                  ].map((item) => (
                    <li key={item} className='flex items-start gap-3'>
                      <CheckCircle className='h-5 w-5 text-purple-400/70 mt-0.5 flex-shrink-0' />
                      <span className='text-white/60 text-sm'>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button size='lg' variant='outline' asChild className='border-white/15 text-white/70 hover:bg-white/5 hover:text-white bg-transparent'>
                  <Link href='/app'>
                    Post a Project <ArrowRight className='ml-2 h-5 w-5' />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id='faq' className='relative py-28 overflow-hidden'>
          <div className='absolute right-0 top-0 pointer-events-none hidden lg:block'>
            <Image src='/images/brand/figure-colorful-circle.png' alt='' width={250} height={250} className='opacity-10' />
          </div>
          <div className='container mx-auto px-4 md:px-8 max-w-3xl relative z-10'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-5xl font-bold text-white mb-4'>Frequently asked questions</h2>
            </div>
            <GlassCard className='px-8 glass-glow' hover={false}>
              {faqItems.map(({ q, a }) => (
                <FAQItem key={q} q={q} a={a} />
              ))}
            </GlassCard>
          </div>
        </section>

        {/* CTA */}
        <section className='relative py-28 overflow-hidden'>
          {/* Large glitch head background */}
          <div className='absolute inset-0 flex justify-center items-center pointer-events-none'>
            <Image src='/images/brand/head-glitch.png' alt='' width={700} height={700} className='object-contain opacity-25' />
            <div className='absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-[#050508]' />
          </div>
          {/* Glow orbs */}
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none' />
          <div className='absolute top-1/2 left-1/3 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none' />

          <div className='container mx-auto px-4 md:px-8 text-center max-w-3xl relative z-10'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
                Ready to start earning?
              </h2>
              <p className='text-lg text-white/40 mb-10'>
                Connect your wallet, pass a screening, and start completing paid AI training tasks today.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button size='lg' asChild className='bg-white text-black hover:bg-white/90 text-base px-8 h-12'>
                  <Link href='/app'>
                    Start as Contributor <ArrowRight className='ml-2 h-5 w-5' />
                  </Link>
                </Button>
                <Button size='lg' variant='outline' asChild className='border-white/15 text-white/70 hover:bg-white/5 hover:text-white text-base px-8 h-12 bg-transparent'>
                  <Link href='/app'>
                    Post a Project
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='border-t border-white/[0.06] py-12'>
        <div className='container mx-auto px-4 md:px-8'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
            <div className='flex items-center gap-6'>
              <Link href='/' className='flex items-center gap-2'>
                <Image src='/images/brand/logo.png' alt='HumanLayer' width={24} height={24} className='rounded-sm' />
                <Image src='/images/brand/wordmark-light.png' alt='HumanLayer' width={100} height={24} />
              </Link>
              <nav className='flex gap-6'>
                {['Terms', 'Privacy', 'Trust & Safety'].map((item) => (
                  <a key={item} href='#' className='text-sm text-white/30 hover:text-white/60 transition-colors'>
                    {item}
                  </a>
                ))}
              </nav>
            </div>
            <p className='text-sm text-white/30'>
              &copy; {new Date().getFullYear()} HumanLayer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
