import { allowedImageDomains } from './lib/allowedDomains.js';

const remotePatterns = allowedImageDomains
  .filter((domain) => typeof domain === 'string')
  .flatMap((hostname) => {
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return [
        { protocol: 'http', hostname },
        { protocol: 'https', hostname },
      ];
    }
    return [{ protocol: 'https', hostname }];
  });

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
};

export default nextConfig;
