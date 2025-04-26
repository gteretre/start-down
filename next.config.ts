import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      // Placeholder for local images
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      // GitHub profile pictures`
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      // Google profile pictures
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // Google Drive (user content)
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'docs.google.com',
      },
      // Google Photos
      {
        protocol: 'https',
        hostname: 'photos.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // Dropbox
      {
        protocol: 'https',
        hostname: 'dl.dropboxusercontent.com',
      },
      // Microsoft OneDrive
      {
        protocol: 'https',
        hostname: 'onedrive.live.com',
      },
      // iCloud (Apple)
      {
        protocol: 'https',
        hostname: 'icloud.com',
      },
      // Imgur
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      // Flickr
      {
        protocol: 'https',
        hostname: 'live.staticflickr.com',
      },
      // Amazon S3 (generic pattern)
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
      // Dropbox (alternative)
      {
        protocol: 'https',
        hostname: 'www.dropbox.com',
      },
    ],
  },
};

export default nextConfig;
