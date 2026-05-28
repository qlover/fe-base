/** @type {import('next-sitemap').IConfig} */
function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3100';
}

module.exports = {
  siteUrl: getSiteUrl(),
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/api', '/_next', '/static', '/favicon.ico', '*.json'],
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/', disallow: ['/api'] }]
  }
};
