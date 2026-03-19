/**
 * AXIVA Cloudflare Worker — SEO Prerendering via Prerender.io
 * 
 * Detects search engine bots and proxies requests to Prerender.io
 * which returns the fully-rendered SPA HTML for crawlers.
 * Normal users get the SPA as usual.
 * 
 * SETUP:
 * 1. Go to Cloudflare Dashboard → Workers & Pages → Create Worker
 * 2. Paste this code
 * 3. Add environment variable: PRERENDER_TOKEN = your prerender.io token
 * 4. Add route: axiva.ai/* → this worker
 * 5. Deploy
 */

const PRERENDER_URL = 'https://service.prerender.io/';

// Bot user agents to detect
const BOT_AGENTS = [
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'slurp',
  'baiduspider', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
  'whatsapp', 'telegrambot', 'applebot', 'discordbot', 'semrushbot',
  'ahrefsbot', 'dotbot', 'rogerbot', 'embedly', 'quora link preview',
  'outbrain', 'pinterest', 'slack', 'vkshare', 'w3c_validator',
  'redditbot', 'sogou', 'exabot', 'ia_archiver', 'archive.org_bot',
  'petalbot', 'gptbot', 'chatgpt-user', 'claudebot', 'anthropic-ai',
  'perplexitybot', 'cohere-ai', 'bytespider',
];

// Extensions that should never be prerendered
const IGNORED_EXTENSIONS = [
  '.js', '.css', '.xml', '.less', '.png', '.jpg', '.jpeg', '.gif',
  '.pdf', '.doc', '.txt', '.ico', '.rss', '.zip', '.mp3', '.rar',
  '.exe', '.wmv', '.avi', '.ppt', '.mpg', '.mpeg', '.tif', '.wav',
  '.mov', '.psd', '.ai', '.xls', '.mp4', '.m4a', '.swf', '.dat',
  '.dmg', '.iso', '.flv', '.m4v', '.torrent', '.ttf', '.woff',
  '.woff2', '.svg', '.webp', '.webm', '.avif',
];

function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_AGENTS.some(bot => ua.includes(bot));
}

function hasIgnoredExtension(pathname) {
  const ext = pathname.toLowerCase().split('.').pop();
  return ext ? IGNORED_EXTENSIONS.includes(`.${ext}`) : false;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';

    // Skip prerendering for non-bot requests, static assets, and non-GET methods
    if (
      request.method !== 'GET' ||
      !isBot(userAgent) ||
      hasIgnoredExtension(url.pathname)
    ) {
      return fetch(request);
    }

    // Proxy to Prerender.io
    const prerenderToken = env.PRERENDER_TOKEN || '';
    const prerenderUrl = `${PRERENDER_URL}${url.toString()}`;

    try {
      const prerenderResponse = await fetch(prerenderUrl, {
        headers: {
          'X-Prerender-Token': prerenderToken,
          'User-Agent': userAgent,
        },
        redirect: 'manual',
      });

      // If prerender.io fails, fall back to origin
      if (!prerenderResponse.ok && prerenderResponse.status !== 301 && prerenderResponse.status !== 302) {
        console.log(`Prerender.io returned ${prerenderResponse.status}, falling back to origin`);
        return fetch(request);
      }

      // Return the prerendered response with cache headers
      const response = new Response(prerenderResponse.body, {
        status: prerenderResponse.status,
        headers: prerenderResponse.headers,
      });

      response.headers.set('X-Prerendered', 'true');
      response.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');

      return response;
    } catch (err) {
      console.error('Prerender.io error:', err.message);
      // Fall back to origin on any error
      return fetch(request);
    }
  },
};
