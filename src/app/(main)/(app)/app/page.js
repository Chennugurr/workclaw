'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  UserIcon,
  BriefcaseIcon,
  ArrowRightIcon,
} from 'lucide-react';

const AnimatedIcon = ({ icon: Icon, isHovered }) => (
  <motion.div
    initial={{ scale: 1, rotateY: 0 }}
    animate={{ scale: isHovered ? 1.2 : 1, rotateY: isHovered ? 180 : 0 }}
    transition={{ duration: 0.6, type: 'spring' }}
    className='text-4xl mb-6'
  >
    <Icon size={48} className='text-white/60' />
  </motion.div>
);

const DashboardCard = ({ title, description, icon: Icon, href }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className='relative overflow-hidden rounded-2xl p-8 cursor-pointer bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] glass-glow'
      whileHover={{
        scale: 1.03,
        boxShadow: '0 20px 60px rgba(139, 92, 246, 0.1), 0 0 40px rgba(0, 255, 255, 0.05)',
        y: -5,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={href}>
        <AnimatedIcon icon={Icon} isHovered={isHovered} />
        <motion.h2
          className='text-2xl font-bold mb-3 text-white'
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className='text-white/40 mb-6 text-sm'
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {description}
        </motion.p>
        <motion.div
          className='absolute bottom-4 right-4 flex items-center text-cyan-400 font-semibold text-sm'
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: isHovered ? 0 : -20, opacity: isHovered ? 1 : 0 }}
        >
          Enter <ArrowRightIcon className='ml-2' size={16} />
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default function Page() {
  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none' />
      <div className='absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-[150px] pointer-events-none' />
      <div className='relative z-10 max-w-5xl w-full'>
        <div className='text-center mb-16'>
          <h1 className='text-5xl font-bold mb-4 text-white'>
            Welcome to HumanLayer
          </h1>
          <p className='text-lg text-white/40 max-w-2xl mx-auto'>
            Choose how you want to use the platform.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <DashboardCard
            title='Contributor'
            description='Complete AI training tasks, earn SOL, and build your expertise across diverse domains.'
            icon={UserIcon}
            href='/app/contributor/dashboard'
          />
          <DashboardCard
            title='Customer'
            description='Post AI training projects, manage contributors, and get high-quality human feedback.'
            icon={BriefcaseIcon}
            href='/app/customer/dashboard'
          />
        </div>
      </div>
    </div>
  );
}
