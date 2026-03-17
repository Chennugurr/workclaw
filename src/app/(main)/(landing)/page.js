'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, ArrowRight, Shield, Zap, DollarSign, Brain, Target, Users, CheckCircle, ChevronDown } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';

const navItems = [
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Task Types', href: '#task-types' },
  { name: 'For Contributors', href: '#for-contributors' },
  { name: 'For Teams', href: '#for-teams' },
  { name: 'FAQ', href: '#faq' },
];

const MotionLink = motion(Link);

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
    description: 'Earn USDC for every approved task. Higher quality and expertise unlock better-paying work.',
  },
];

const faqItems = [
  {
    q: 'What kind of work is available?',
    a: 'AI training tasks across many domains: rating LLM responses, labeling data, verifying facts, writing prompts, red-teaming AI systems, and more. Tasks are structured and have clear instructions and rubrics.',
  },
  {
    q: 'How do I get paid?',
    a: 'You earn per task or per hour, depending on the project. Payments are in USDC, sent directly to your wallet. Quality bonuses and streak incentives are available for consistent contributors.',
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

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className='border-b border-gray-200'>
      <button
        onClick={() => setOpen(!open)}
        className='w-full flex items-center justify-between py-5 text-left'
      >
        <span className='text-lg font-medium text-gray-900'>{q}</span>
        <ChevronDown className={cn('h-5 w-5 text-gray-500 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className='pb-5 text-gray-600 leading-relaxed'
        >
          {a}
        </motion.p>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className='bg-white w-full min-h-screen'>
      {/* Header */}
      <header className='border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-sm z-50'>
        <nav className='container mx-auto flex items-center justify-between px-4 md:px-8 h-16'>
          <Link href='/' className='text-2xl font-bold text-gray-900 tracking-tight'>
            workclaw
          </Link>

          <div className='hidden lg:flex items-center gap-x-8'>
            {navItems.map(({ name, href }) => (
              <a
                key={name}
                href={href}
                className='text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'
              >
                {name}
              </a>
            ))}
          </div>

          <div className='flex items-center gap-x-3'>
            <Button size='sm' variant='outline' asChild>
              <Link href='/app'>Sign In</Link>
            </Button>
            <Button size='sm' asChild className='bg-gray-900 hover:bg-gray-800'>
              <Link href='/app'>Get Started</Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant='ghost' size='icon' className='lg:hidden'>
                  <Menu className='h-5 w-5' />
                </Button>
              </SheetTrigger>
              <SheetContent side='right'>
                <nav className='flex flex-col gap-4 mt-8'>
                  {navItems.map(({ name, href }) => (
                    <a key={name} href={href} className='text-lg font-medium text-gray-700 hover:text-gray-900'>
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
        <section className='py-24 md:py-32'>
          <div className='container mx-auto px-4 md:px-8 text-center max-w-4xl'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className='text-sm font-semibold text-gray-500 uppercase tracking-widest mb-6'>
                Human Intelligence Platform
              </p>
              <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] mb-8'>
                Earn money{' '}
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-gray-400'>
                  training AI
                </span>
              </h1>
              <p className='text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed'>
                Complete structured AI training tasks — labeling, ranking, reviewing, red-teaming — earn USDC, and build a verified reputation.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button size='lg' asChild className='bg-gray-900 hover:bg-gray-800 text-base px-8'>
                  <Link href='/app'>
                    Start Earning <ArrowRight className='ml-2 h-5 w-5' />
                  </Link>
                </Button>
                <Button size='lg' variant='outline' asChild className='text-base px-8'>
                  <a href='#how-it-works'>Learn More</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className='border-y border-gray-200 bg-gray-50'>
          <div className='container mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
            {[
              { label: 'Task Types', value: '14+' },
              { label: 'Expertise Domains', value: '20+' },
              { label: 'Languages', value: '16+' },
              { label: 'Payment', value: 'USDC' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className='text-3xl font-bold text-gray-900'>{value}</p>
                <p className='text-sm text-gray-500 mt-1'>{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id='how-it-works' className='py-24'>
          <div className='container mx-auto px-4 md:px-8 max-w-5xl'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>How it works</h2>
              <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
                From sign-up to payout in four steps. Work remotely, on your own schedule.
              </p>
            </div>
            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
              {howItWorks.map(({ step, title, description }) => (
                <div key={step} className='relative'>
                  <p className='text-5xl font-bold text-gray-100 mb-4'>{step}</p>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
                  <p className='text-gray-600 text-sm leading-relaxed'>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Task Types */}
        <section id='task-types' className='py-24 bg-gray-50'>
          <div className='container mx-auto px-4 md:px-8 max-w-6xl'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>Types of work</h2>
              <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
                Structured AI training tasks across diverse domains. Each task has clear instructions, rubrics, and examples.
              </p>
            </div>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {taskTypes.map(({ icon, title, description }) => (
                <Card key={title} className='border border-gray-200 shadow-none hover:shadow-md transition-shadow'>
                  <CardContent className='p-6'>
                    <div className='h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4 text-gray-700'>
                      {icon}
                    </div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
                    <p className='text-gray-600 text-sm leading-relaxed'>{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* For Contributors */}
        <section id='for-contributors' className='py-24'>
          <div className='container mx-auto px-4 md:px-8 max-w-5xl'>
            <div className='grid md:grid-cols-2 gap-16 items-center'>
              <div>
                <p className='text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4'>For Contributors</p>
                <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
                  Get paid for your expertise
                </h2>
                <ul className='space-y-4'>
                  {[
                    'Work remotely on your own schedule',
                    'Earn USDC for every approved task',
                    'Pass screenings to unlock better-paying work',
                    'Build a verified reputation in AI training',
                    'Quality bonuses for consistent high performers',
                    'Multiple expertise tracks: writing, coding, math, science, and more',
                  ].map((item) => (
                    <li key={item} className='flex items-start gap-3'>
                      <CheckCircle className='h-5 w-5 text-green-600 mt-0.5 flex-shrink-0' />
                      <span className='text-gray-700'>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button size='lg' asChild className='mt-8 bg-gray-900 hover:bg-gray-800'>
                  <Link href='/app'>
                    Apply as Contributor <ArrowRight className='ml-2 h-5 w-5' />
                  </Link>
                </Button>
              </div>
              <div className='bg-gray-50 rounded-2xl p-8 border border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Areas of Expertise</h3>
                <div className='flex flex-wrap gap-2'>
                  {[
                    'Creative Writing', 'Technical Writing', 'Mathematics', 'Science',
                    'Coding', 'Data Analysis', 'Research', 'Linguistics',
                    'Moderation', 'Prompt Engineering', 'Red Teaming',
                    'Medicine', 'Law', 'Finance', 'Education', 'Philosophy',
                  ].map((tag) => (
                    <span key={tag} className='px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700'>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Teams */}
        <section id='for-teams' className='py-24 bg-gray-50'>
          <div className='container mx-auto px-4 md:px-8 max-w-5xl'>
            <div className='grid md:grid-cols-2 gap-16 items-center'>
              <div className='bg-white rounded-2xl p-8 border border-gray-200 order-2 md:order-1'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Who uses Workclaw</h3>
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
                      <div className='h-2 w-2 rounded-full bg-gray-400 mt-2 flex-shrink-0' />
                      <span className='text-gray-700 text-sm'>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className='order-1 md:order-2'>
                <p className='text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4'>For Organizations</p>
                <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
                  Train your AI with qualified human experts
                </h2>
                <p className='text-gray-600 mb-6 leading-relaxed'>
                  Post structured AI training projects. Get high-quality human feedback from screened contributors with verified domain expertise.
                </p>
                <ul className='space-y-3 mb-8'>
                  {[
                    'Screened contributor pool with verified expertise',
                    'Quality assurance with gold tasks and consensus scoring',
                    'Structured task types — no custom tooling needed',
                    'Pay per task or per hour, in USDC',
                  ].map((item) => (
                    <li key={item} className='flex items-start gap-3'>
                      <CheckCircle className='h-5 w-5 text-green-600 mt-0.5 flex-shrink-0' />
                      <span className='text-gray-700 text-sm'>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button size='lg' variant='outline' asChild>
                  <Link href='/app'>
                    Post a Project <ArrowRight className='ml-2 h-5 w-5' />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id='faq' className='py-24'>
          <div className='container mx-auto px-4 md:px-8 max-w-3xl'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>Frequently asked questions</h2>
            </div>
            <div>
              {faqItems.map(({ q, a }) => (
                <FAQItem key={q} q={q} a={a} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className='py-24 bg-gray-900'>
          <div className='container mx-auto px-4 md:px-8 text-center max-w-3xl'>
            <h2 className='text-3xl md:text-4xl font-bold text-white mb-6'>
              Ready to start earning?
            </h2>
            <p className='text-lg text-gray-400 mb-10'>
              Connect your wallet, pass a screening, and start completing paid AI training tasks today.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button size='lg' asChild className='bg-white text-gray-900 hover:bg-gray-100 text-base px-8'>
                <Link href='/app'>
                  Start as Contributor <ArrowRight className='ml-2 h-5 w-5' />
                </Link>
              </Button>
              <Button size='lg' variant='outline' asChild className='border-gray-600 text-gray-300 hover:bg-gray-800 text-base px-8'>
                <Link href='/app'>
                  Post a Project
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='border-t border-gray-200 py-12'>
        <div className='container mx-auto px-4 md:px-8'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
            <div className='flex items-center gap-6'>
              <span className='text-lg font-bold text-gray-900'>workclaw</span>
              <nav className='flex gap-6'>
                {['Terms', 'Privacy', 'Trust & Safety'].map((item) => (
                  <a key={item} href='#' className='text-sm text-gray-500 hover:text-gray-700'>
                    {item}
                  </a>
                ))}
              </nav>
            </div>
            <p className='text-sm text-gray-500'>
              &copy; {new Date().getFullYear()} Workclaw. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
