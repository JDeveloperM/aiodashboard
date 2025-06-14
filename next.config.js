/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mysten/dapp-kit', '@mysten/sui', '@mysten/walrus', '@mysten/walrus-wasm'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }

    // Handle WASM files for Walrus
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    return config
  }
}

module.exports = nextConfig
