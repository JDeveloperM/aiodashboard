/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mysten/dapp-kit', '@mysten/sui'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    return config
  }
}

module.exports = nextConfig
