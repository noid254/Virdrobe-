/**
 * Virdrobe account + commerce store.
 * File-backed JSON database (no extra dependencies) + scrypt password hashing
 * + HMAC signed session tokens. Everything the API needs lives in this file so
 * it can be tested without Express.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { discoverMarketGarments, initialMagazineCovers } from '../src/data/mockDatabase';

export type Role = 'client' | 'affiliate' | 'seller';
export const ALL_ROLES: Role[] = ['client', 'affiliate', 'seller'];

export interface ProfileInfo {
  displayName: string;
  avatarUrl: string;
  bio: string;
  city: string;
  country: string;
  instagram: string;
  tiktok: string;
  website: string;
}

export interface SellerInfo {
  shopName: string;
  tagline: string;
  description: string;
  category: string; // e.g. "Vintage curator"
  address: string;
  city: string;
  country: string;
  openingHours: string;
  returnsPolicy: string;
  shippingInfo: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  website: string;
  instagram: string;
  logoUrl: string;
  bannerUrl: string;
  defaultCommissionRate: number; // 0..0.5, what affiliates earn
  tokenBalance: number;
  tryOnsServed: number;
  verified: boolean;
  createdAt: string;
}

export interface AffiliateInfo {
  registeredAt: string;
  code: string;
  payoutMethod: string; // "mpesa" | "bank" | "paypal"
  payoutDetails: string; // private
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  handle: string;
  roles: Role[];
  activeRole: Role;
  profile: ProfileInfo;
  fit?: unknown; // private measurements (UserFitProfile)
  twin?: unknown; // private digital twin
  closet?: unknown[]; // private wardrobe
  affiliate?: AffiliateInfo;
  seller?: SellerInfo;
}

export interface ListingRecord {
  id: string; // garment id
  sellerId: string;
  garment: any; // Garment
  cover?: any; // MagazineCover
  commissionRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TryOnRecord {
  id: string;
  creatorId: string;
  garmentId: string;
  cover: any; // MagazineCover (creator cover)
  caption: string;
  views: number;
  createdAt: string;
}

export interface OrderRecord {
  id: string;
  garmentId: string;
  garmentTitle: string;
  sellerId: string | null;
  buyerId: string;
  tryOnId: string | null;
  affiliateId: string | null;
  total: number;
  commissionRate: number;
  commission: number;
  status: 'pending' | 'cleared';
  shopperCity: string;
  createdAt: string;
}

export interface TokenTx {
  id: string;
  sellerId: string;
  type: 'try_on_deduction' | 'pack_purchase' | 'welcome_bonus';
  amount: number;
  description: string;
  shopperId?: string;
  garmentTitle?: string;
  createdAt: string;
}

interface Database {
  users: UserRecord[];
  listings: ListingRecord[];
  tryOns: TryOnRecord[];
  orders: OrderRecord[];
  tokenTx: TokenTx[];
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------
const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SECRET_FILE = path.join(DATA_DIR, 'session-secret');

let db: Database | null = null;

function load(): Database {
  if (db) return db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as Database;
  } else {
    db = { users: [], listings: [], tryOns: [], orders: [], tokenTx: [] };
  }
  return db;
}

function save() {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db), { mode: 0o600 });
  fs.renameSync(tmp, DB_FILE);
}

/** Test helper: forget the in-memory copy so a new DATA_DIR is read. */
export function _resetForTests() {
  db = null;
  recentServed.clear();
  secretCache = null;
}

const uid = (prefix: string) => `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
const now = () => new Date().toISOString();
const round2 = (n: number) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
function text(v: unknown, max = 300): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

function url(v: unknown): string {
  const s = text(v, 1_000_000);
  if (!s) return '';
  if (/^https?:\/\//i.test(s) || /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(s)) return s;
  return '';
}

function clampRate(v: unknown, fallback = 0.1): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(0.5, Math.max(0, Math.round(n * 1000) / 1000));
}

function slug(s: string) {
  return (
    s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24) || 'user'
  );
}

function newHandle(name: string) {
  const d = load();
  for (let i = 0; i < 20; i++) {
    const h = `${slug(name)}-${crypto.randomBytes(2).toString('hex')}`;
    if (!d.users.some((u) => u.handle === h)) return h;
  }
  return `${slug(name)}-${Date.now().toString(36)}`;
}

// ---------------------------------------------------------------------------
// Passwords and sessions
// ---------------------------------------------------------------------------
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, keyHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

let secretCache: Buffer | null = null;
function secret(): Buffer {
  if (secretCache) return secretCache;
  if (process.env.SESSION_SECRET) {
    secretCache = Buffer.from(process.env.SESSION_SECRET);
    return secretCache;
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SECRET_FILE)) {
    fs.writeFileSync(SECRET_FILE, crypto.randomBytes(48).toString('hex'), { mode: 0o600 });
  }
  secretCache = Buffer.from(fs.readFileSync(SECRET_FILE, 'utf8'));
  return secretCache;
}

const SESSION_DAYS = 30;

export function createSessionToken(userId: string): string {
  const exp = Date.now() + SESSION_DAYS * 86400_000;
  const body = `${userId}.${exp}`;
  const sig = crypto.createHmac('sha256', secret()).update(body).digest('hex');
  return `${body}.${sig}`;
}

export function readSessionToken(token: string | undefined): UserRecord | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [userId, expStr, sig] = parts;
  if (!/^[0-9a-f]{64}$/.test(sig)) return null;
  const expected = crypto.createHmac('sha256', secret()).update(`${userId}.${expStr}`).digest('hex');
  const a = Buffer.from(sig, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Number(expStr) < Date.now()) return null;
  return load().users.find((u) => u.id === userId) || null;
}

export const SESSION_MAX_AGE_MS = SESSION_DAYS * 86400_000;

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function emptyProfile(displayName: string): ProfileInfo {
  return {
    displayName,
    avatarUrl: '',
    bio: '',
    city: '',
    country: 'Kenya',
    instagram: '',
    tiktok: '',
    website: '',
  };
}

export function signUp(input: { email: unknown; password: unknown; name: unknown; role?: unknown }): UserRecord {
  const email = text(input.email, 200).toLowerCase();
  const password = typeof input.password === 'string' ? input.password : '';
  const name = text(input.name, 60);
  if (!EMAIL_RE.test(email)) throw new ApiError(400, 'Enter a valid email address.');
  if (password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters.');
  if (password.length > 200) throw new ApiError(400, 'Password is too long.');
  if (name.length < 2) throw new ApiError(400, 'Enter your name.');
  const d = load();
  if (d.users.some((u) => u.email === email)) {
    throw new ApiError(409, 'An account with this email already exists. Sign in instead.');
  }
  const user: UserRecord = {
    id: uid('usr'),
    email,
    passwordHash: hashPassword(password),
    createdAt: now(),
    handle: newHandle(name),
    roles: ['client'],
    activeRole: 'client',
    profile: emptyProfile(name),
  };
  d.users.push(user);
  save();
  // Optional starting role chosen on the sign-up form.
  const wanted = input.role;
  if (wanted === 'affiliate') enableAffiliate(user.id, {});
  return load().users.find((u) => u.id === user.id)!;
}

export function logIn(emailRaw: unknown, password: unknown): UserRecord {
  const email = text(emailRaw, 200).toLowerCase();
  const user = load().users.find((u) => u.email === email);
  // Always run a hash to keep timing similar for unknown emails.
  const stored = user?.passwordHash || 'scrypt$00$00';
  let ok = false;
  try {
    ok = typeof password === 'string' && verifyPassword(password, stored);
  } catch {
    ok = false;
  }
  if (!user || !ok) throw new ApiError(401, 'Incorrect email or password.');
  return user;
}

export function getUser(id: string): UserRecord | null {
  return load().users.find((u) => u.id === id) || null;
}

export function getUserByHandle(handle: string): UserRecord | null {
  return load().users.find((u) => u.handle === handle) || null;
}

/** Everything the signed-in person may see about THEIR OWN account. */
export function privateUser(u: UserRecord) {
  return {
    id: u.id,
    email: u.email,
    handle: u.handle,
    roles: u.roles,
    activeRole: u.activeRole,
    profile: u.profile,
    fit: u.fit ?? null,
    twin: u.twin ?? null,
    closet: u.closet ?? [],
    affiliate: u.affiliate ?? null,
    seller: u.seller ? { ...u.seller } : null,
    createdAt: u.createdAt,
  };
}

export function setActiveRole(userId: string, role: unknown): UserRecord {
  const u = mustUser(userId);
  if (!ALL_ROLES.includes(role as Role) || !u.roles.includes(role as Role)) {
    throw new ApiError(400, 'You have not enabled that role yet.');
  }
  u.activeRole = role as Role;
  save();
  return u;
}

function mustUser(id: string): UserRecord {
  const u = getUser(id);
  if (!u) throw new ApiError(401, 'Please sign in.');
  return u;
}

export function updateProfile(userId: string, input: any): UserRecord {
  const u = mustUser(userId);
  const p = input?.profile || {};
  const next = { ...u.profile };
  if ('displayName' in p) {
    const n = text(p.displayName, 60);
    if (n.length < 2) throw new ApiError(400, 'Display name is too short.');
    next.displayName = n;
  }
  if ('avatarUrl' in p) next.avatarUrl = url(p.avatarUrl);
  for (const k of ['bio', 'city', 'country', 'instagram', 'tiktok', 'website'] as const) {
    if (k in p) next[k] = text(p[k], k === 'bio' ? 400 : 120);
  }
  u.profile = next;

  if (typeof input?.handle === 'string') {
    const h = slug(input.handle).slice(0, 24);
    if (h.length < 3) throw new ApiError(400, 'Handle must be at least 3 letters or numbers.');
    if (load().users.some((x) => x.handle === h && x.id !== u.id)) {
      throw new ApiError(409, 'That handle is taken.');
    }
    u.handle = h;
  }

  if (input?.fit && typeof input.fit === 'object') u.fit = sanitizeBlob(input.fit);
  if (input?.twin && typeof input.twin === 'object') u.twin = sanitizeBlob(input.twin);
  if (Array.isArray(input?.closet)) u.closet = sanitizeBlob(input.closet);

  const s = input?.seller;
  if (s && typeof s === 'object') {
    if (!u.seller) throw new ApiError(400, 'Enable the seller role first.');
    const cur = u.seller;
    for (const k of [
      'shopName',
      'tagline',
      'description',
      'category',
      'address',
      'city',
      'country',
      'openingHours',
      'returnsPolicy',
      'shippingInfo',
      'contactEmail',
      'contactPhone',
      'whatsapp',
      'website',
      'instagram',
    ] as const) {
      if (k in s) (cur as any)[k] = text(s[k], k === 'description' || k === 'returnsPolicy' ? 800 : 200);
    }
    if ('logoUrl' in s) cur.logoUrl = url(s.logoUrl);
    if ('bannerUrl' in s) cur.bannerUrl = url(s.bannerUrl);
    if ('defaultCommissionRate' in s) cur.defaultCommissionRate = clampRate(s.defaultCommissionRate, cur.defaultCommissionRate);
    if (cur.shopName.length < 2) throw new ApiError(400, 'Shop name is required.');
  }

  const a = input?.affiliate;
  if (a && typeof a === 'object') {
    if (!u.affiliate) throw new ApiError(400, 'Register as an affiliate first.');
    if ('payoutMethod' in a) u.affiliate.payoutMethod = text(a.payoutMethod, 30);
    if ('payoutDetails' in a) u.affiliate.payoutDetails = text(a.payoutDetails, 120);
  }
  save();
  return u;
}

function sanitizeBlob(o: any) {
  const json = JSON.stringify(o);
  if (json.length > 1_500_000) throw new ApiError(413, 'That data is too large.');
  return JSON.parse(json);
}

export function enableAffiliate(userId: string, input: any): UserRecord {
  const u = mustUser(userId);
  if (!u.roles.includes('affiliate')) u.roles.push('affiliate');
  if (!u.affiliate) {
    u.affiliate = {
      registeredAt: now(),
      code: crypto.randomBytes(4).toString('hex'),
      payoutMethod: text(input?.payoutMethod, 30) || 'mpesa',
      payoutDetails: text(input?.payoutDetails, 120),
    };
  }
  u.activeRole = 'affiliate';
  save();
  return u;
}

export function enableSeller(userId: string, input: any): UserRecord {
  const u = mustUser(userId);
  const shopName = text(input?.shopName, 80);
  if (!u.seller && shopName.length < 2) throw new ApiError(400, 'Enter your shop name.');
  if (!u.roles.includes('seller')) u.roles.push('seller');
  if (!u.seller) {
    u.seller = {
      shopName,
      tagline: text(input?.tagline, 120),
      description: text(input?.description, 800),
      category: text(input?.category, 60) || 'Independent label',
      address: text(input?.address, 200),
      city: text(input?.city, 80) || u.profile.city,
      country: text(input?.country, 60) || u.profile.country,
      openingHours: '',
      returnsPolicy: '',
      shippingInfo: '',
      contactEmail: u.email,
      contactPhone: '',
      whatsapp: '',
      website: '',
      instagram: '',
      logoUrl: '',
      bannerUrl: '',
      defaultCommissionRate: clampRate(input?.defaultCommissionRate, 0.1),
      tokenBalance: 20,
      tryOnsServed: 0,
      verified: false,
      createdAt: now(),
    };
    load().tokenTx.unshift({
      id: uid('tx'),
      sellerId: u.id,
      type: 'welcome_bonus',
      amount: 20,
      description: 'Welcome bonus: 20 free try-on tokens',
      createdAt: now(),
    });
  }
  u.activeRole = 'seller';
  save();
  return u;
}

// ---------------------------------------------------------------------------
// Garment lookup (seller listings first, then the built-in demo catalogue)
// ---------------------------------------------------------------------------
interface GarmentInfo {
  garment: any;
  sellerId: string | null; // only set when the seller has a real account
  commissionRate: number;
  inStock: boolean;
}

export function lookupGarment(garmentId: string): GarmentInfo | null {
  const d = load();
  const listing = d.listings.find((l) => l.id === garmentId);
  if (listing) {
    const seller = getUser(listing.sellerId);
    const rate =
      listing.commissionRate != null
        ? listing.commissionRate
        : seller?.seller?.defaultCommissionRate ?? 0.1;
    return {
      garment: listing.garment,
      sellerId: listing.sellerId,
      commissionRate: rate,
      inStock: !!listing.garment.inStock,
    };
  }
  const demo = (discoverMarketGarments as any[]).find((g) => g.id === garmentId);
  if (demo) {
    const cover = (initialMagazineCovers as any[]).find((c) => c.garmentId === garmentId);
    return {
      garment: demo,
      sellerId: null,
      commissionRate: cover?.affiliateCommissionRate ?? 0.1,
      inStock: demo.inStock !== false,
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Seller listings
// ---------------------------------------------------------------------------
function mustSeller(userId: string): UserRecord {
  const u = mustUser(userId);
  if (!u.seller || !u.roles.includes('seller')) throw new ApiError(403, 'Seller account required.');
  return u;
}

export function createListing(userId: string, input: any): ListingRecord {
  const u = mustSeller(userId);
  const g = input?.garment;
  if (!g || typeof g !== 'object') throw new ApiError(400, 'Garment details are required.');
  const price = Number(g.price);
  if (!Number.isFinite(price) || price <= 0) throw new ApiError(400, 'Enter a price above zero.');
  const title = text(g.title, 120);
  if (title.length < 2) throw new ApiError(400, 'Enter a garment title.');
  const imageUrl = url(g.imageUrl);
  if (!imageUrl) throw new ApiError(400, 'Add a garment photo link (https://...).');
  const id = uid('lst');
  const garment = {
    ...g,
    id,
    title,
    price: round2(price),
    imageUrl,
    sellerId: u.id,
    sellerName: u.seller!.shopName,
    sellerLocation: { city: u.seller!.city || u.profile.city, distanceMiles: 0 },
    inStock: g.inStock !== false,
    createdAt: now(),
  };
  const rate = input.commissionRate != null ? clampRate(input.commissionRate) : undefined;
  let cover = input.cover && typeof input.cover === 'object' ? sanitizeBlob(input.cover) : undefined;
  if (cover) {
    cover = { ...cover, id: `cover_${id}`, garmentId: id, garment, sellerId: u.id, sellerName: u.seller!.shopName };
    cover.affiliateCommissionRate = rate ?? u.seller!.defaultCommissionRate;
  }
  const rec: ListingRecord = {
    id,
    sellerId: u.id,
    garment,
    cover,
    commissionRate: rate,
    createdAt: now(),
    updatedAt: now(),
  };
  load().listings.unshift(rec);
  save();
  return rec;
}

export function updateListing(userId: string, listingId: string, input: any): ListingRecord {
  mustSeller(userId);
  const l = load().listings.find((x) => x.id === listingId && x.sellerId === userId);
  if (!l) throw new ApiError(404, 'Listing not found.');
  if (typeof input?.inStock === 'boolean') l.garment.inStock = input.inStock;
  if (input?.price != null) {
    const p = Number(input.price);
    if (!Number.isFinite(p) || p <= 0) throw new ApiError(400, 'Enter a price above zero.');
    l.garment.price = round2(p);
  }
  if ('commissionRate' in (input || {})) {
    l.commissionRate = input.commissionRate == null ? undefined : clampRate(input.commissionRate);
  }
  if (l.cover) {
    l.cover.garment = l.garment;
    l.cover.affiliateCommissionRate = l.commissionRate ?? getUser(userId)!.seller!.defaultCommissionRate;
  }
  l.updatedAt = now();
  save();
  return l;
}

export function listSellerListings(userId: string) {
  mustSeller(userId);
  return load().listings.filter((l) => l.sellerId === userId);
}

// ---------------------------------------------------------------------------
// Try-ons (shareable looks)
// ---------------------------------------------------------------------------
export function createTryOn(userId: string, input: any): TryOnRecord {
  const u = mustUser(userId);
  const info = lookupGarment(text(input?.garmentId, 80));
  if (!info) throw new ApiError(404, 'That garment is no longer available.');
  const id = uid('try');
  const c = input?.cover && typeof input.cover === 'object' ? sanitizeBlob(input.cover) : {};
  const origin = text(input?.origin, 200).replace(/\/+$/, '');
  const isAffiliate = !!u.affiliate;
  const cover = {
    ...c,
    id: `cover_${id}`,
    garmentId: info.garment.id,
    garment: info.garment,
    sellerId: info.sellerId || c.sellerId,
    sellerName: info.garment.sellerName || c.sellerName,
    creatorId: u.id,
    creatorName: u.profile.displayName,
    creatorAvatar: u.profile.avatarUrl || c.creatorAvatar,
    creatorHandle: u.handle,
    isCreatorCover: true,
    earnsCommission: isAffiliate,
    affiliateCommissionRate: info.commissionRate,
    qrCodeData: `${origin}/#/t/${id}`,
  };
  const rec: TryOnRecord = {
    id,
    creatorId: u.id,
    garmentId: info.garment.id,
    cover,
    caption: text(input?.caption, 200),
    views: 0,
    createdAt: now(),
  };
  load().tryOns.unshift(rec);
  save();
  return rec;
}

function tryOnView(t: TryOnRecord) {
  const info = lookupGarment(t.garmentId);
  const creator = getUser(t.creatorId);
  const cover = {
    ...t.cover,
    garment: info?.garment || t.cover.garment,
    earnsCommission: !!creator?.affiliate,
    affiliateCommissionRate: info?.commissionRate ?? t.cover.affiliateCommissionRate,
  };
  return {
    id: t.id,
    caption: t.caption,
    createdAt: t.createdAt,
    views: t.views,
    inStock: info ? info.inStock : false,
    cover,
    creator: creator
      ? {
          handle: creator.handle,
          displayName: creator.profile.displayName,
          avatarUrl: creator.profile.avatarUrl,
          isAffiliate: !!creator.affiliate,
        }
      : null,
  };
}

export function getTryOn(id: string, countView = false) {
  const t = load().tryOns.find((x) => x.id === id);
  if (!t) throw new ApiError(404, 'This try-on was not found.');
  if (countView) {
    t.views += 1;
    save();
  }
  return tryOnView(t);
}

export function listTryOns(opts: { creatorId?: string; inStockOnly?: boolean; limit?: number } = {}) {
  let rows = load().tryOns.filter((t) => !opts.creatorId || t.creatorId === opts.creatorId);
  let views = rows.map(tryOnView);
  if (opts.inStockOnly) views = views.filter((v) => v.inStock);
  return views.slice(0, opts.limit ?? 100);
}

// ---------------------------------------------------------------------------
// Feed (public)
// ---------------------------------------------------------------------------
export function feed() {
  const d = load();
  const listingCovers = d.listings
    .filter((l) => l.cover && l.garment.inStock)
    .map((l) => ({ ...l.cover, garment: l.garment }));
  const tryOnCovers = listTryOns({ inStockOnly: true, limit: 60 }).map((v) => v.cover);
  return { listingCovers, tryOnCovers };
}

// ---------------------------------------------------------------------------
// Orders and commissions
// ---------------------------------------------------------------------------
export function createOrder(buyerId: string, input: any): OrderRecord {
  const buyer = mustUser(buyerId);
  const info = lookupGarment(text(input?.garmentId, 80));
  if (!info) throw new ApiError(404, 'That garment is no longer available.');
  if (!info.inStock) throw new ApiError(409, 'Sorry, this item is out of stock.');
  const tryOnId = text(input?.tryOnId, 60) || null;
  let affiliateId: string | null = null;
  if (tryOnId) {
    const t = load().tryOns.find((x) => x.id === tryOnId);
    const creator = t ? getUser(t.creatorId) : null;
    // Commission only if the sharer registered as an affiliate and is not buying their own link.
    if (t && creator?.affiliate && creator.id !== buyer.id && t.garmentId === info.garment.id) {
      affiliateId = creator.id;
    }
  }
  const total = round2(Number(info.garment.price));
  const rate = affiliateId ? info.commissionRate : 0;
  const order: OrderRecord = {
    id: uid('ord'),
    garmentId: info.garment.id,
    garmentTitle: info.garment.title,
    sellerId: info.sellerId,
    buyerId: buyer.id,
    tryOnId,
    affiliateId,
    total,
    commissionRate: rate,
    commission: round2(total * rate),
    status: 'pending',
    shopperCity: buyer.profile.city || 'Unknown',
    createdAt: now(),
  };
  load().orders.unshift(order);
  save();
  return order;
}

export function confirmOrder(sellerId: string, orderId: string): OrderRecord {
  mustSeller(sellerId);
  const o = load().orders.find((x) => x.id === orderId && x.sellerId === sellerId);
  if (!o) throw new ApiError(404, 'Order not found.');
  o.status = 'cleared';
  save();
  return o;
}

export function myOrders(buyerId: string) {
  return load().orders.filter((o) => o.buyerId === buyerId);
}

// ---------------------------------------------------------------------------
// Private dashboards
// ---------------------------------------------------------------------------
const recentServed = new Map<string, number>();
export function recordTryOnServed(shopperId: string, garmentId: string) {
  const info = lookupGarment(garmentId);
  if (!info?.sellerId) return { deducted: false };
  // The same shopper re-opening the same item within 10 minutes counts once.
  const key = `${shopperId}|${garmentId}`;
  const last = recentServed.get(key) || 0;
  if (Date.now() - last < 10 * 60_000) return { deducted: false };
  recentServed.set(key, Date.now());
  if (info.sellerId === shopperId) return { deducted: false }; // sellers trying their own stock are free
  const seller = getUser(info.sellerId);
  if (!seller?.seller) return { deducted: false };
  seller.seller.tryOnsServed += 1;
  let deducted = false;
  if (seller.seller.tokenBalance > 0) {
    seller.seller.tokenBalance -= 1;
    deducted = true;
    load().tokenTx.unshift({
      id: uid('tx'),
      sellerId: seller.id,
      type: 'try_on_deduction',
      amount: -1,
      description: `Shopper try-on: ${info.garment.title}`,
      shopperId: shopperId,
      garmentTitle: info.garment.title,
      createdAt: now(),
    });
  }
  save();
  return { deducted };
}

export function topUpTokens(sellerId: string, amount: unknown) {
  const u = mustSeller(sellerId);
  const n = Math.floor(Number(amount));
  if (![50, 100, 250].includes(n)) throw new ApiError(400, 'Choose a token pack of 50, 100 or 250.');
  u.seller!.tokenBalance += n;
  load().tokenTx.unshift({
    id: uid('tx'),
    sellerId,
    type: 'pack_purchase',
    amount: n,
    description: `Token pack refill (+${n} try-ons)`,
    createdAt: now(),
  });
  save();
  return u;
}

const orderToAffiliateShape = (o: OrderRecord) => ({
  id: o.id,
  creatorId: o.affiliateId || '',
  creatorName: getUser(o.affiliateId || '')?.profile.displayName || '',
  garmentId: o.garmentId,
  garmentTitle: o.garmentTitle,
  orderTotal: o.total,
  commissionRate: o.commissionRate,
  commissionEarned: o.commission,
  status: o.status,
  shopperCity: o.shopperCity,
  timestamp: o.createdAt,
});

/** PRIVATE: only the seller who owns the data. */
export function sellerDashboard(userId: string) {
  const u = mustSeller(userId);
  const d = load();
  const orders = d.orders.filter((o) => o.sellerId === userId);
  const revenue = round2(orders.reduce((s, o) => s + o.total, 0));
  const commissionsOwed = round2(
    orders.filter((o) => o.affiliateId).reduce((s, o) => s + o.commission, 0)
  );
  const served = u.seller!.tryOnsServed;
  const byGarment = new Map<string, { title: string; orders: number; revenue: number }>();
  for (const o of orders) {
    const row = byGarment.get(o.garmentId) || { title: o.garmentTitle, orders: 0, revenue: 0 };
    row.orders += 1;
    row.revenue = round2(row.revenue + o.total);
    byGarment.set(o.garmentId, row);
  }
  return {
    ledger: {
      sellerId: u.id,
      sellerName: u.seller!.shopName,
      balance: u.seller!.tokenBalance,
      totalTryOnsServed: served,
      costPerTryOnUsd: 0.15,
      transactions: d.tokenTx.filter((t) => t.sellerId === userId).slice(0, 50),
    },
    performance: {
      orders: orders.length,
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      revenue,
      commissionsOwed,
      conversionRate: served > 0 ? round2((orders.length / served) * 100) : 0,
      activeListings: d.listings.filter((l) => l.sellerId === userId && l.garment.inStock).length,
      topGarments: [...byGarment.entries()]
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5),
    },
    orders: orders.slice(0, 100).map((o) => ({
      ...orderToAffiliateShape(o),
      status: o.status,
      hasAffiliate: !!o.affiliateId,
    })),
    listings: d.listings
      .filter((l) => l.sellerId === userId)
      .map((l) => ({
        id: l.id,
        title: l.garment.title,
        price: l.garment.price,
        imageUrl: l.garment.imageUrl,
        inStock: !!l.garment.inStock,
        commissionRate: l.commissionRate ?? u.seller!.defaultCommissionRate,
      })),
    defaultCommissionRate: u.seller!.defaultCommissionRate,
  };
}

/** PRIVATE: only the affiliate who owns the data. */
export function affiliateDashboard(userId: string) {
  const u = mustUser(userId);
  if (!u.affiliate) throw new ApiError(403, 'Register as an affiliate first.');
  const d = load();
  const orders = d.orders.filter((o) => o.affiliateId === userId);
  const myTryOns = d.tryOns.filter((t) => t.creatorId === userId);
  return {
    code: u.affiliate.code,
    payoutMethod: u.affiliate.payoutMethod,
    payoutDetails: u.affiliate.payoutDetails,
    tryOnsShared: myTryOns.length,
    views: myTryOns.reduce((s, t) => s + t.views, 0),
    earnedPending: round2(orders.filter((o) => o.status === 'pending').reduce((s, o) => s + o.commission, 0)),
    earnedCleared: round2(orders.filter((o) => o.status === 'cleared').reduce((s, o) => s + o.commission, 0)),
    orders: orders.slice(0, 100).map(orderToAffiliateShape),
  };
}

// ---------------------------------------------------------------------------
// Public profile (what ANYONE can see)
// ---------------------------------------------------------------------------
export function publicProfile(handle: string) {
  const u = getUserByHandle(handle);
  if (!u) throw new ApiError(404, 'Profile not found.');
  const d = load();
  const base = {
    handle: u.handle,
    displayName: u.profile.displayName,
    avatarUrl: u.profile.avatarUrl,
    bio: u.profile.bio,
    city: u.profile.city,
    country: u.profile.country,
    instagram: u.profile.instagram,
    tiktok: u.profile.tiktok,
    website: u.profile.website,
    memberSince: u.createdAt,
    isAffiliate: !!u.affiliate,
    isSeller: !!u.seller,
  };
  const shopTryOns = listTryOns({ creatorId: u.id, inStockOnly: true });
  const allShared = listTryOns({ creatorId: u.id });
  const seller = u.seller
    ? {
        shopName: u.seller.shopName,
        tagline: u.seller.tagline,
        description: u.seller.description,
        category: u.seller.category,
        address: u.seller.address,
        city: u.seller.city,
        country: u.seller.country,
        openingHours: u.seller.openingHours,
        returnsPolicy: u.seller.returnsPolicy,
        shippingInfo: u.seller.shippingInfo,
        contactEmail: u.seller.contactEmail,
        contactPhone: u.seller.contactPhone,
        whatsapp: u.seller.whatsapp,
        website: u.seller.website,
        instagram: u.seller.instagram,
        logoUrl: u.seller.logoUrl,
        bannerUrl: u.seller.bannerUrl,
        verified: u.seller.verified,
        commissionOffered: u.seller.defaultCommissionRate,
        memberSince: u.seller.createdAt,
        listings: d.listings
          .filter((l) => l.sellerId === u.id && l.garment.inStock)
          .map((l) => ({
            garment: l.garment,
            cover: l.cover || null,
            commissionRate: l.commissionRate ?? u.seller!.defaultCommissionRate,
          })),
      }
    : null;
  return {
    ...base,
    seller,
    // Reseller shop = only try-ons that are still in stock.
    shop: u.affiliate ? { tryOns: shopTryOns } : null,
    // Everyone's own shared looks (in stock or not) are visible to them via /me.
    sharedCount: allShared.length,
    sharedTryOns: u.affiliate ? [] : shopTryOns,
  };
}
