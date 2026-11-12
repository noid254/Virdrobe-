/**
 * Account / profile / commerce API. Mounted by server.ts before the AI routes.
 * Rule of thumb: every route that returns balances, measurements, payout info,
 * email or performance data requires the signed-in owner. Only /api/profiles,
 * /api/tryons/:id and /api/feed are public, and they never include private fields.
 */
import type { Express, Request, Response, NextFunction } from 'express';
import * as store from './store';
import { ApiError } from './store';

const COOKIE = 'vd_session';

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function isHttps(req: Request) {
  return req.secure || req.headers['x-forwarded-proto'] === 'https';
}

function setSession(req: Request, res: Response, userId: string) {
  const parts = [
    `${COOKIE}=${store.createSessionToken(userId)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(store.SESSION_MAX_AGE_MS / 1000)}`,
  ];
  if (isHttps(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSession(res: Response) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

export function currentUser(req: Request) {
  return store.readSessionToken(parseCookies(req.headers.cookie)[COOKIE]);
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const u = currentUser(req);
  if (!u) return res.status(401).json({ success: false, error: 'Please sign in.' });
  (req as any).user = u;
  next();
}

// Basic brute-force protection for sign-in / sign-up.
const attempts = new Map<string, number[]>();
function throttle(key: string, max = 10, windowMs = 15 * 60_000) {
  const t = Date.now();
  const list = (attempts.get(key) || []).filter((x) => t - x < windowMs);
  if (list.length >= max) throw new ApiError(429, 'Too many attempts. Try again in a few minutes.');
  list.push(t);
  attempts.set(key, list);
}

type Handler = (req: Request, res: Response) => unknown | Promise<unknown>;
const wrap =
  (fn: Handler) =>
  async (req: Request, res: Response) => {
    try {
      const data = await fn(req, res);
      if (!res.headersSent) res.json({ success: true, data });
    } catch (e: any) {
      const status = e instanceof ApiError ? e.status : 500;
      if (status === 500) console.error('API error:', e);
      if (!res.headersSent) {
        res.status(status).json({ success: false, error: status === 500 ? 'Something went wrong.' : e.message });
      }
    }
  };

const uid = (req: Request): string => (req as any).user.id;

export function mountApi(app: Express) {
  app.set('trust proxy', 1);

  // CSRF defence in depth: browsers send Origin on cross-site POSTs.
  app.use('/api', (req, res, next) => {
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
      const origin = req.headers.origin;
      if (origin) {
        try {
          if (new URL(origin).host !== req.headers.host) {
            return res.status(403).json({ success: false, error: 'Cross-site request blocked.' });
          }
        } catch {
          return res.status(403).json({ success: false, error: 'Bad origin.' });
        }
      }
    }
    next();
  });

  // The Gemini-backed routes cost money: signed-in users only.
  for (const p of ['/api/analyze-garment', '/api/generate-cover-copy', '/api/generate-try-on', '/api/resale-description']) {
    app.use(p, requireUser);
  }

  // ---- Auth ----
  app.post(
    '/api/auth/signup',
    wrap((req, res) => {
      throttle(`signup|${req.ip}`, 30);
      const u = store.signUp(req.body || {});
      setSession(req, res, u.id);
      return store.privateUser(u);
    })
  );

  app.post(
    '/api/auth/login',
    wrap((req, res) => {
      const email = String(req.body?.email || '').toLowerCase();
      throttle(`login|${req.ip}|${email}`, 8);
      const u = store.logIn(req.body?.email, req.body?.password);
      setSession(req, res, u.id);
      return store.privateUser(u);
    })
  );

  app.post(
    '/api/auth/logout',
    wrap((_req, res) => {
      clearSession(res);
      return {};
    })
  );

  app.get(
    '/api/me',
    wrap((req) => {
      const u = currentUser(req);
      return u ? store.privateUser(u) : null;
    })
  );

  // ---- Own account (private) ----
  app.patch('/api/me', requireUser, wrap((req) => store.privateUser(store.updateProfile(uid(req), req.body))));

  app.post(
    '/api/me/roles',
    requireUser,
    wrap((req) => {
      const role = req.body?.role;
      if (role === 'affiliate') return store.privateUser(store.enableAffiliate(uid(req), req.body));
      if (role === 'seller') return store.privateUser(store.enableSeller(uid(req), req.body));
      throw new ApiError(400, 'Choose affiliate or seller.');
    })
  );

  app.post('/api/me/active-role', requireUser, wrap((req) => store.privateUser(store.setActiveRole(uid(req), req.body?.role))));

  app.get('/api/me/tryons', requireUser, wrap((req) => store.listTryOns({ creatorId: uid(req) })));
  app.get('/api/me/orders', requireUser, wrap((req) => store.myOrders(uid(req))));

  // ---- Public ----
  app.get('/api/feed', wrap(() => store.feed()));
  app.get('/api/profiles/:handle', wrap((req) => store.publicProfile(String(req.params.handle))));
  app.get('/api/tryons/:id', wrap((req) => store.getTryOn(String(req.params.id), true)));

  // ---- Try-ons & orders (signed in) ----
  app.post('/api/tryons', requireUser, wrap((req) => store.createTryOn(uid(req), req.body)));
  app.post('/api/tryon-events', requireUser, wrap((req) => store.recordTryOnServed(uid(req), String(req.body?.garmentId || ''))));
  app.post('/api/orders', requireUser, wrap((req) => store.createOrder(uid(req), req.body)));

  // ---- Seller (private) ----
  app.get('/api/seller/dashboard', requireUser, wrap((req) => store.sellerDashboard(uid(req))));
  app.post('/api/seller/listings', requireUser, wrap((req) => store.createListing(uid(req), req.body)));
  app.patch('/api/seller/listings/:id', requireUser, wrap((req) => store.updateListing(uid(req), String(req.params.id), req.body)));
  app.post('/api/seller/orders/:id/confirm', requireUser, wrap((req) => store.confirmOrder(uid(req), String(req.params.id))));
  app.post(
    '/api/seller/tokens',
    requireUser,
    wrap((req) => {
      store.topUpTokens(uid(req), req.body?.amount);
      return store.sellerDashboard(uid(req));
    })
  );

  // ---- Affiliate (private) ----
  app.get('/api/affiliate/dashboard', requireUser, wrap((req) => store.affiliateDashboard(uid(req))));
}
