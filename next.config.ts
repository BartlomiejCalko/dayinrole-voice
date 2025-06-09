import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    domains: [
      // Job board domains
      'images.finncdn.no',
      'media.licdn.com',
      'media-exp1.licdn.com',
      'media-exp2.licdn.com',
      'logo.clearbit.com',
      'logos-world.net',
      'd2q79iu7y748jz.cloudfront.net',
      'workable-application-uploads.s3.amazonaws.com',
      'lever-client-logos.s3.amazonaws.com',
      'boards.greenhouse.io',
      // Company logo domains
      'cdn.jsdelivr.net',
      'avatars.githubusercontent.com',
      'www.google.com',
      'lh3.googleusercontent.com',
      // CDN domains
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      // Common company domains
      'assets.website-files.com',
      'uploads-ssl.webflow.com',
    ]
  },
};

export default nextConfig;
