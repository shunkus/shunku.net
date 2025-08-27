import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  i18n: {
    locales: ['en', 'ja', 'ko', 'zh', 'es', 'fr'],
    defaultLocale: 'en',
  },
};

export default nextConfig;
