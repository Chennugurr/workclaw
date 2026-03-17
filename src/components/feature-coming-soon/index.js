import Image from 'next/image';
import Icon from './icon.svg';

export default function FeatureComingSoon() {
  return (
    <div className='rounded-lg border border-gray-200 p-8 flex flex-col items-center justify-center min-h-[400px]'>
      <Image src={Icon} alt='Icon' className='mb-6' />

      <h2 className='text-xl font-semibold mb-2 text-center'>
        This feature is coming soon
      </h2>
      <p className='text-gray-500 mb-6 text-center max-w-md'>
        We&apos;re working on some exciting new features to improve your
        experience. Stay tuned!
      </p>
    </div>
  );
}
