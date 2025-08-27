module.exports = {
  i18n: {
    locales: ['en', 'ja'],
    defaultLocale: 'en',
  },
  fallbackLng: {
    default: ['en'],
  },
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  localePath: typeof window === 'undefined'
    ? require('path').resolve('./public/locales')
    : './public/locales',
}