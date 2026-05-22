import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/history/', '/auth-js-test/'],
    },
    sitemap: 'https://resumebuilderai.in/sitemap.xml',
  }
}
