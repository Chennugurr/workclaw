'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserIcon, BriefcaseIcon, ArrowRightIcon } from 'lucide-react';

const AnimatedIcon = ({ icon: Icon, isHovered }) => (
  <motion.div
    initial={{ scale: 1, rotateY: 0 }}
    animate={{ scale: isHovered ? 1.2 : 1, rotateY: isHovered ? 180 : 0 }}
    transition={{ duration: 0.6, type: 'spring' }}
    className='text-4xl mb-6'
  >
    <Icon size={48} className='text-indigo-600' />
  </motion.div>
);

const DashboardCard = ({ title, description, icon: Icon, href }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className='relative overflow-hidden rounded-2xl p-8 cursor-pointer bg-white'
      style={{
        boxShadow:
          '0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.06)',
      }}
      whileHover={{
        scale: 1.05,
        boxShadow:
          '0 20px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
        y: -10,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={href}>
        <AnimatedIcon icon={Icon} isHovered={isHovered} />
        <motion.h2
          className='text-3xl font-bold mb-4 text-gray-800'
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className='text-gray-600 mb-6'
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {description}
        </motion.p>
        <motion.div
          className='absolute bottom-4 right-4 flex items-center text-indigo-600 font-semibold'
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: isHovered ? 0 : -20, opacity: isHovered ? 1 : 0 }}
        >
          Enter <ArrowRightIcon className='ml-2' size={20} />
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default function Page() {
  return (
    <div className='min-h-screen bg-white text-gray-800 flex items-center justify-center p-4 overflow-hidden'>
      <div className='relative z-10 max-w-5xl w-full'>
        <div className='text-center mb-16'>
          <h1 className='text-6xl font-extrabold mb-4 text-gray-900'>
            Dashboard Selection
          </h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto mb-8'>
            Choose your path to success. Whether you&apos;re seeking new
            opportunities or building your dream team, we&apos;ve got you
            covered.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
          <DashboardCard
            title='Candidate Portal'
            description='Explore exciting job opportunities and manage your applications with ease'
            icon={UserIcon}
            href='/app/c/dashboard'
          />
          <DashboardCard
            title='Employer Hub'
            description='Post jobs, manage applications, and find the perfect candidates for your team'
            icon={BriefcaseIcon}
            href='/app/e/dashboard'
          />
        </div>
      </div>
    </div>
  );
}
