'use client';

import dayjs from 'dayjs';
import pkg from '~/package.json';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ChevronDown, ChevronUp, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const RELEASE_NOTES = {
  '0.1.0': require('./versions/0.1.0.json'),
  '0.2.0': require('./versions/0.2.0.json'),
};

export default function MVPBanner() {
  const [version, setVersion] = useState(pkg.version);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showcaseIndex, setShowcaseIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleKeyPress = useCallback(
    (event) => {
      if (!isMinimized) {
        if (event.key === 'Escape') setIsMinimized(true);
        if (event.key === 'Enter') setIsExpanded((prev) => !prev);
      } else {
        if (event.ctrlKey && event.key === 'i') setIsMinimized(false);
      }
    },
    [isMinimized]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isExpanded]);

  if (!isVisible) return null;

  const currentVersion = RELEASE_NOTES[version] || RELEASE_NOTES['0.1.0'];
  const features = currentVersion?.features || [];
  const recentUpdates = currentVersion?.updates || [];
  const knownIssues = currentVersion?.knownIssues || [];
  const deprecations = currentVersion?.deprecations || [];

  const handleVersionChange = (event) => {
    setVersion(event.target.value);
  };

  return (
    <AnimatePresence key='mvp-banner'>
      <motion.div
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: isMinimized ? '110%' : 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ duration: 0.5 }}
        className={cn(
          'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[32rem] bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 rounded-xl shadow-lg',
          'z-50'
        )}
        role='alert'
        aria-live='polite'
      >
        <div className='relative z-20'>
          <motion.div
            className='absolute -top-10 -left-6 w-16 h-16 bg-blue-500 rounded-full opacity-20'
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <motion.div
            className='absolute -bottom-8 -right-8 w-20 h-20 bg-purple-500 rounded-full opacity-20'
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2, delay: 1 }}
          />
          <div
            className={cn(
              'relative bg-gray-700 bg-opacity-10 rounded-lg p-4 backdrop-blur-sm max-h-[80vh] overflow-x-hidden',
              isExpanded ? 'overflow-y-auto' : 'overflow-y-hidden'
            )}
          >
            <div className='flex justify-between items-center mb-2'>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className='text-white hover:text-blue-200 transition-colors flex items-center'
                aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
              >
                {isExpanded ? (
                  <ChevronUp className='w-5 h-5 mr-1' />
                ) : (
                  <ChevronDown className='w-5 h-5 mr-1' />
                )}
                {isExpanded ? 'Less Info' : 'More Info'}
              </motion.button>
              <div className='flex items-center space-x-2'>
                <select
                  value={version}
                  onChange={handleVersionChange}
                  className='bg-gray-700 text-white rounded px-2 py-1 text-sm'
                >
                  {Object.keys(RELEASE_NOTES).map((v) => (
                    <option key={v} value={v}>
                      v{v}
                      {v === pkg.version ? ' (current)' : ''}
                    </option>
                  ))}
                </select>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setIsMinimized(true);
                    if (isExpanded) setIsExpanded(false);
                  }}
                  className='text-white hover:text-blue-200 transition-colors'
                  aria-label='Minimize message'
                >
                  <Minimize2 className='w-5 h-5' />
                </motion.button>
              </div>
            </div>
            <div className='flex items-start'>
              <div className='mr-4 mt-1'>
                <div className='relative'>
                  <AlertCircle className='w-6 h-6' />
                  <span className='absolute -top-0.5 -right-0.5 flex h-3 w-3'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75' />
                    <span className='relative inline-flex rounded-full h-3 w-3 bg-yellow-500' />
                  </span>
                </div>
              </div>
              <div>
                <h2 className='font-bold text-xl mb-2'>
                  MVP Version{' '}
                  <code className='bg-white bg-opacity-10 px-1 py-0.5 rounded-md'>
                    v{currentVersion.version}
                  </code>
                </h2>
                <p className='text-sm mb-3 leading-snug'>
                  You&apos;re using an early version of our app. Expect frequent
                  and significant updates that may change functionality.
                </p>
                <p className='text-sm font-semibold mb-3 leading-snug'>
                  Don&apos;t worry! Your data will remain intact and carry over
                  through all updates.
                </p>
                <p className='text-sm mb-3 leading-snug'>
                  <span className='font-semibold'>Release Date:</span>{' '}
                  {dayjs(currentVersion.releaseDate).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )}
                </p>
              </div>
            </div>
            <AnimatePresence key='mvp-banner-details'>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className='mt-4 space-y-4'
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className='font-bold mb-2'>Feature Showcase</h3>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className='bg-white bg-opacity-10 rounded-lg p-3'
                    >
                      <h4 className='font-semibold'>
                        {features[showcaseIndex].name}
                      </h4>
                      <p className='text-sm'>
                        {features[showcaseIndex].description}
                      </p>
                      <div className='flex justify-between mt-2'>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setShowcaseIndex(
                              (prev) =>
                                (prev - 1 + features.length) % features.length
                            )
                          }
                          className='text-sm text-blue-200 hover:text-blue-100'
                        >
                          Previous
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setShowcaseIndex(
                              (prev) => (prev + 1) % features.length
                            )
                          }
                          className='text-sm text-blue-200 hover:text-blue-100'
                        >
                          Next
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className='font-bold mb-2'>What&apos;s New</h3>
                    <ul className='space-y-2'>
                      {recentUpdates.map((update, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.02 + index * 0.1 }}
                          className='text-sm'
                        >
                          <span className='font-semibold'>
                            {dayjs(update.date).format('YYYY-MM-DD')}:
                          </span>{' '}
                          {update.description}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                  {features && features.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className='font-bold mb-2'>Features</h3>
                      <ul className='list-disc list-inside'>
                        {currentVersion.features.map((feature, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.04 + index * 0.1 }}
                            className='text-sm'
                          >
                            {feature.name}: {feature.description}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                  {knownIssues && knownIssues.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className='font-bold mb-2'>Known Issues</h3>
                      <ul className='list-disc list-inside'>
                        {knownIssues.map((issue, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.06 + index * 0.1 }}
                            className='text-sm'
                          >
                            {issue}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                  {deprecations && deprecations.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h3 className='font-bold mb-2'>Deprecations</h3>
                      <ul className='list-disc list-inside'>
                        {deprecations.map((deprecation, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.08 + index * 0.1 }}
                            className='text-sm'
                          >
                            {deprecation}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      <AnimatePresence key='mvp-banner-minimize'>
        {isMinimized && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className='fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg cursor-pointer z-10'
            onClick={() => setIsMinimized(false)}
          >
            <AlertCircle className='w-6 h-6' />
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
