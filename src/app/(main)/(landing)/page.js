'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, ArrowRight, Sparkles } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';
// import { ESCROW_ADDRESS, TOKEN_ADDRESS } from '@/constants';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';

const navItems = [
  {
    name: 'Docs',
    href: 'https://gitbook.detask.tech',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
  { name: 'Individuals', href: '/app/e/candidates' },
  { name: 'Companies', href: '/app/c/employers' },
  { name: 'Post a Job', href: '/app/e/jobs/new' },
  {
    name: 'X',
    href: 'https://x.com/DetaskTech',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
  // {
  //   name: 'Contract',
  //   href: `https://etherscan.io/address/${ESCROW_ADDRESS}`,
  //   target: '_blank',
  //   rel: 'noopener noreferrer',
  // },
  // {
  //   name: 'Token',
  //   href: `https://etherscan.io/address/${TOKEN_ADDRESS}`,
  //   target: '_blank',
  //   rel: 'noopener noreferrer',
  // },
  // {
  //   name: 'Chart',
  //   href: `https://www.dextools.io/app/en/ether/pair-explorer/${TOKEN_ADDRESS}`,
  //   target: '_blank',
  //   rel: 'noopener noreferrer',
  // },
];

const MotionLink = motion(Link);

export default function Component() {
  const [scrollY, setScrollY] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    controls.start({ y: scrollY * 0.5 });
  }, [scrollY, controls]);

  return (
    <div className='bg-gradient-to-br from-white to-gray-50 w-full min-h-screen'>
      <div className='container flex flex-col justify-between relative border-x border-gray-200 px-0 z-10'>
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className='border-b border-gray-200 flex items-center w-full h-14 sticky top-0 bg-white bg-opacity-80 backdrop-blur-sm z-10'
        >
          <nav className='flex items-center justify-between px-4 md:px-10 max-w-screen w-full mx-auto'>
            <div className='flex items-center gap-x-6'>
              <MotionLink
                href='/'
                className='outline-none'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Image
                  src='/assets/images/logo/black.png'
                  alt='Detask'
                  width={124}
                  height={32}
                  className='hidden md:block'
                />
                <Image
                  src='/assets/images/logo/icon/black.png'
                  alt='Detask'
                  width={32}
                  height={32}
                  className='block md:hidden'
                />
              </MotionLink>
              <div className='hidden lg:flex items-center gap-x-2'>
                <p className='text-2xl font-light text-gray-400'>/</p>
                <div className='flex items-center gap-x-1'>
                  {navItems.map(({ name, href, ...props }) => (
                    <MotionLink
                      key={name}
                      href={href}
                      className='capitalize font-medium text-sm px-4 py-1.5 transition-all ease-in-out border border-transparent rounded-3xl hover:border-gray-300 hover:shadow-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 whitespace-nowrap'
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      {...props}
                    >
                      {name}
                    </MotionLink>
                  ))}
                </div>
              </div>
            </div>
            <div className='flex items-center gap-x-2'>
              <Button
                size='sm'
                asChild
                className='bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300'
              >
                <MotionLink
                  href='/app'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Launch App
                </MotionLink>
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant='ghost' size='icon' className='lg:hidden'>
                    <Menu className='h-6 w-6' />
                  </Button>
                </SheetTrigger>
                <SheetContent side='right'>
                  <nav className='flex flex-col gap-4'>
                    {navItems.map(({ name, href, ...props }) => (
                      <MotionLink
                        key={name}
                        href={href}
                        className='text-lg font-medium hover:text-blue-500 transition-colors duration-300'
                        whileHover={{ scale: 1.05, x: 10 }}
                        {...props}
                      >
                        {name}
                      </MotionLink>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </motion.header>

        <main>
          <section className='py-16 md:py-20 bg-gradient-to-b from-white to-gray-50'>
            <motion.div
              className='flex flex-col items-center mx-auto text-center max-w-6xl px-4'
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className='text-4xl md:text-6xl lg:text-7xl font-normal leading-tight mb-10'>
                <span className='block text-gray-400 mb-4'>
                  Blockchain-powered{' '}
                  <motion.span
                    className='italic text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    freelancing
                  </motion.span>{' '}
                  platform for{' '}
                  <motion.span
                    className='italic text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                  >
                    professionals
                  </motion.span>{' '}
                  to
                </span>
                <motion.span
                  className='inline-block max-w-3xl text-2xl md:text-4xl italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                >
                  launch projects, build portfolios, and find opportunities.
                </motion.span>
              </h1>
            </motion.div>
          </section>

          <section className='grid md:grid-cols-2 xl:grid-cols-6 border-t border-gray-200'>
            <div className='hidden xl:block' />
            {[
              {
                title: 'Candidate Portal',
                description: `Explore exciting job opportunities and manage your applications with ease`,
                image: `/assets/images/candidate.png`,
                href: '/app/c/dashboard',
              },
              {
                title: 'Employer Hub',
                description: `Post jobs, manage applications, and find the perfect candidates for your team`,
                image: `/assets/images/employer.png`,
                href: '/app/e/dashboard',
              },
            ].map((item, index) => (
              <Card
                key={index}
                className={cn(
                  'xl:col-span-2 border-0 border-gray-200 rounded-none group hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-300',
                  index === 0 ? 'border-x' : 'border-r'
                )}
              >
                <Link href={item.href}>
                  <CardContent className='p-10 flex flex-col items-center text-center gap-8'>
                    <motion.div
                      className='relative w-full h-96 overflow-hidden rounded-lg shadow-lg'
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <motion.img
                        src={item.image}
                        alt={item.title}
                        className='w-full h-full object-cover group-hover:-translate-y-5 transition-transform duration-300'
                        whileHover={{ scale: 1.1 }}
                      />
                    </motion.div>
                    <div>
                      <h3 className='text-2xl font-normal italic mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500'>
                        {item.title}
                      </h3>
                      <p className='text-gray-600'>{item.description}</p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant='ghost'
                        size='icon'
                        className='rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300'
                      >
                        <ArrowRight className='h-6 w-6' />
                      </Button>
                    </motion.div>
                  </CardContent>
                </Link>
              </Card>
            ))}
            <div className='hidden xl:block' />
          </section>
        </main>

        <footer className='py-20 border-t border-gray-200 bg-gradient-to-t from-gray-50 to-white'>
          <div className='container mx-auto text-center px-4'>
            <motion.div
              className='inline-block mb-10'
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Image
                src='/assets/images/logo/black.png'
                alt='Detask'
                width={300}
                height={80}
                className='mx-auto grayscale hover:grayscale-0 opacity-10 hover:opacity-100 transition-all duration-300'
              />
            </motion.div>
            <nav className='flex flex-wrap justify-center gap-6 mb-6'>
              {[
                'About Us',
                'Our Services',
                'Case Studies',
                'Careers',
                'Contact',
                'FAQ',
              ].map((item) => (
                <MotionLink
                  key={item}
                  href='#'
                  className='text-sm hover:underline hover:text-blue-500 transition-colors duration-300'
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {item}
                </MotionLink>
              ))}
            </nav>
            <nav className='flex flex-wrap justify-center gap-4 text-xs text-gray-500 mb-6'>
              {['Code of Conduct', 'Privacy', 'Terms & Conditions'].map(
                (item) => (
                  <MotionLink
                    key={item}
                    href='#'
                    className='hover:underline hover:text-blue-500 transition-colors duration-300'
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {item}
                  </MotionLink>
                )
              )}
            </nav>
            <motion.div
              className='flex justify-center items-center text-xs text-gray-500'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <p>&copy; {new Date().getFullYear()}</p>
              <div className='flex items-center ml-2'>
                <Image
                  src='/assets/images/logo/icon/black.png'
                  alt='Detask'
                  width={16}
                  height={16}
                />
                <p className='ml-1'>Detask.</p>
              </div>
            </motion.div>
          </div>
        </footer>
      </div>

      {/* Decorative elements */}
      <motion.div
        className='absolute top-[15%] left-[15%] w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-lg'
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      />
      <motion.div
        className='absolute top-[25%] right-[25%] w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tl from-purple-100 to-blue-100 rounded-2xl shadow-lg'
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <motion.div
        className='absolute bottom-[15%] left-[30%] w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-2xl shadow-lg opacity-50'
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <motion.div
        className='absolute top-[40%] right-[20%] w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-bl from-purple-100 to-blue-100 rounded-2xl shadow-lg'
        animate={{
          rotate: [0, -360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      />
      <motion.div
        className='absolute bottom-[25%] right-[15%] w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-3xl shadow-lg opacity-75'
        animate={{
          x: [0, 20, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <motion.div
        className='absolute top-[30%] left-[40%] w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg shadow-lg'
        animate={{
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
    </div>
  );
}
