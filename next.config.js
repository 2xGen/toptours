/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  async redirects() {
    return [
      // Redirect old blog subdomain to travel-guides
      {
        source: '/blog',
        destination: '/travel-guides',
        permanent: true,
      },
      {
        source: '/blog/:path*',
        destination: '/travel-guides/:path*',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ]
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src'),
    }
    return config
  }
}

module.exports = nextConfig
