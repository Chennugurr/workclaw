/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    'jsonwebtoken',
    'ua-parser-js',
    'tweetnacl',
    'bs58',
    'base-x',
    '@solana/web3.js',
    '@pump-fun/pump-sdk',
    '@pump-fun/pump-swap-sdk',
    '@coral-xyz/anchor',
  ],
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  turbopack: {
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
};

export default nextConfig;
