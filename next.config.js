const path = require('path')

module.exports = {
  trailingSlash: true,
  reactStrictMode: false,
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr'],
  },
  experimental: {
  },
  transpilePackages: ['next-auth'],
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }

    return config
  }
}
