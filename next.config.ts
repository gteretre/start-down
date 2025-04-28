import { allowedImageDomains } from './lib/allowedDomains';

const nextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: allowedImageDomains
      .filter((domain) => typeof domain === 'string')
      .map((hostname) => ({
        protocol: 'https',
        hostname,
      })),
  },
};

export default nextConfig;
