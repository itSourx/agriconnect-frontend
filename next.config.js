const path = require('path')

module.exports = {
  trailingSlash: false,
  reactStrictMode: false,
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr'],
  },
  experimental: {
  },
  transpilePackages: ['next-auth'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
  images: {
    domains: ['localhost', 'agriconnect-bc17856a61b8.herokuapp.com'],
    unoptimized: true
  },
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }

    return config
  }
}
