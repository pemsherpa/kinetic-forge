import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

const PATH = '/__zathura_proxy_image';

function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, '');
  if (!h || h === 'localhost' || h.endsWith('.local')) return true;
  if (h === 'metadata.google.internal' || h.includes('169.254.169.254')) return true;

  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (ipv4) {
    const a = +ipv4[1]!;
    const b = +ipv4[2]!;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
  }

  if (h.includes(':')) {
    const compact = h.replace(/^::ffff:/i, '');
    if (compact === '::1' || compact === '127.0.0.1') return true;
    if (/^fe80:/i.test(h) || /^fc/i.test(h) || /^fd/i.test(h)) return true;
  }

  return false;
}

export function zathuraImageProxy(): Plugin {
  return {
    name: 'zathura-image-proxy',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith(PATH)) {
          next();
          return;
        }

        let targetStr = '';
        try {
          const u = new URL(req.url, 'http://127.0.0.1');
          targetStr = u.searchParams.get('url') ?? '';
        } catch {
          res.statusCode = 400;
          res.end('invalid query');
          return;
        }

        let target: URL;
        try {
          target = new URL(targetStr);
        } catch {
          res.statusCode = 400;
          res.end('invalid url');
          return;
        }

        if (target.protocol !== 'http:' && target.protocol !== 'https:') {
          res.statusCode = 400;
          res.end('only http(s)');
          return;
        }

        if (isBlockedHost(target.hostname)) {
          res.statusCode = 403;
          res.end('host not allowed');
          return;
        }

        try {
          const r = await fetch(target.href, {
            headers: { 'User-Agent': 'Zathura-DevImageProxy/1.0' },
            redirect: 'follow',
          });
          if (!r.ok) {
            res.statusCode = r.status;
            res.end();
            return;
          }
          const buf = Buffer.from(await r.arrayBuffer());
          const ct = r.headers.get('content-type') || 'application/octet-stream';
          res.setHeader('Content-Type', ct);
          res.setHeader('Cache-Control', 'private, max-age=300');
          res.end(buf);
        } catch {
          res.statusCode = 502;
          res.end('upstream fetch failed');
        }
      });
    },
  };
}
