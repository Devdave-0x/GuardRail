/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Strips the `X-Powered-By: Next.js` response header, which discloses the framework
  // for no benefit and is flagged by page-speed and security scanners alike.
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['viem'],
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@react-native-async-storage/async-storage': false,
      '@x402/core/client': false,
      '@x402/evm': false,
      '@x402/evm/exact/client': false,
      '@x402/evm/upto/client': false,
      '@x402/svm/exact/client': false,
    };
    return config;
  },
};

module.exports = nextConfig;
