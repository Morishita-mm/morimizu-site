import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/apps',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/apps/:slug',
        destination: '/projects/:slug',
        permanent: true,
      },
      {
        source: '/en/apps',
        destination: '/en/projects',
        permanent: true,
      },
      {
        source: '/en/apps/:slug',
        destination: '/en/projects/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
