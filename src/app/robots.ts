import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://creatorin.my.id';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin',
        '/admin/',
        '/chat',
        '/contracts',
        '/dashboard/',
        '/invoice/',
        '/notifications',
        '/profile',
        '/settings',
        '/wallet',
        '/auth/callback',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
