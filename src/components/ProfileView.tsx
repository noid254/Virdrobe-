import React, { useEffect, useState } from 'react';
import { PublicProfile, TryOnView } from '../types/account';
import { api, money, pct } from '../lib/api';
import { Avatar } from './UserMenu';
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  Globe,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  RotateCcw,
  Tag,
  Truck,
} from 'lucide-react';

interface Props {
  handle: string;
  currentHandle?: string;
  onTryOn: (cover: any) => void;
  onBuy: (garmentId: string, tryOnId?: string) => void;
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

const PinTile: React.FC<{ image: string; title: string; subtitle: string; price?: number; href?: string; children?: React.ReactNode }> = ({
  image,
  title,
  subtitle,
  price,
  href,
  children,
}) => {
  const body = (
    <>
      <img src={image} alt={title} loading="lazy" className="w-full object-cover bg-zinc-900" referrerPolicy="no-referrer" />
      <div className="p-2.5">
        <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{title}</p>
        <p className="text-[11px] text-zinc-400 truncate mt-0.5">{subtitle}</p>
        {price != null && <p className="text-sm font-mono text-amber-300 mt-1">{money(price)}</p>}
      </div>
    </>
  );
  return (
    <div className="break-inside-avoid mb-3 bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden">
      {href ? (
        <a href={href} className="block hover:opacity-95">
          {body}
        </a>
      ) : (
        body
      )}
      {children && <div className="px-2.5 pb-2.5 flex gap-2">{children}</div>}
    </div>
  );
};

const grid = 'columns-2 md:columns-3 lg:columns-4 gap-3';

const Detail: React.FC<{ icon: React.ElementType; label: string; children: React.ReactNode }> = ({ icon: Icon, label, children }) => (
  <div className="flex gap-3 py-2.5">
    <Icon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
    <div className="min-w-0">
      <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{label}</p>
      <div className="text-sm text-zinc-200 break-words">{children}</div>
    </div>
  </div>
);

export const ProfileView: React.FC<Props> = ({ handle, currentHandle, onTryOn, onBuy }) => {
  const [p, setP] = useState<PublicProfile | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'stock' | 'about'>('stock');

  useEffect(() => {
    setP(null);
    setError('');
    api<PublicProfile>(`/api/profiles/${encodeURIComponent(handle)}`)
      .then(setP)
      .catch((e) => setError(e.message));
  }, [handle]);

  if (error)
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-zinc-300">
        <p className="mb-4">{error}</p>
        <a href="#/" className="text-rose-300 underline">
          Back to Discover
        </a>
      </div>
    );
  if (!p)
    return (
      <div className="flex justify-center py-24 text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );

  const s = p.seller;
  const isMe = currentHandle === p.handle;
  const displayName = s ? s.shopName : p.displayName;
  const avatar = s?.logoUrl || p.avatarUrl;
  const tryOnTiles: TryOnView[] = p.shop ? p.shop.tryOns : p.sharedTryOns;
  const contactHref = (v: string) => v.replace(/[^\d+]/g, '');
  const ig = (s?.instagram || p.instagram || '').replace(/^@/, '');
  const site = s?.website || p.website;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Banner */}
      <div className="relative h-32 sm:h-48 bg-gradient-to-tr from-rose-950 via-zinc-900 to-amber-950 overflow-hidden sm:rounded-b-3xl">
        {s?.bannerUrl && <img src={s.bannerUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
        <a
          href="#/"
          className="absolute top-3 left-3 flex items-center gap-1.5 text-xs bg-black/60 backdrop-blur px-3 py-1.5 rounded-full text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Discover
        </a>
      </div>

      {/* Header */}
      <div className="px-4 -mt-10 sm:-mt-12 relative">
        <div className="flex items-end gap-3 sm:gap-4">
          <div className="ring-4 ring-[#0c0d10] rounded-full">
            <Avatar src={avatar} name={displayName} className="w-20 h-20 sm:w-24 sm:h-24 text-2xl" />
          </div>
          <div className="pb-1 min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-serif-editorial text-white leading-tight break-words flex items-center gap-1.5 flex-wrap">
              {displayName}
              {s?.verified && <BadgeCheck className="w-5 h-5 text-sky-400" aria-label="Verified seller" />}
            </h1>
            <p className="text-xs text-zinc-400 truncate">@{p.handle}</p>
          </div>
          {isMe && (
            <a
              href="#/me"
              className="shrink-0 mb-1 flex items-center gap-1.5 text-xs px-3 py-2 rounded-full bg-white text-black font-semibold"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </a>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {p.isSeller && <span className="px-2.5 py-1 rounded-full text-[11px] bg-purple-500/15 border border-purple-500/30 text-purple-200">Seller{s?.category ? ` · ${s.category}` : ''}</span>}
          {p.isAffiliate && <span className="px-2.5 py-1 rounded-full text-[11px] bg-amber-500/15 border border-amber-500/30 text-amber-200">Reseller</span>}
          {!p.isSeller && !p.isAffiliate && <span className="px-2.5 py-1 rounded-full text-[11px] bg-white/10 border border-white/15 text-zinc-200">Client</span>}
          {s && (
            <span className="px-2.5 py-1 rounded-full text-[11px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-200">
              Resellers earn {pct(s.commissionOffered)}
            </span>
          )}
          {(s?.city || p.city) && (
            <span className="px-2.5 py-1 rounded-full text-[11px] bg-white/5 border border-white/10 text-zinc-300 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {[s?.city || p.city, s?.country || p.country].filter(Boolean).join(', ')}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full text-[11px] bg-white/5 border border-white/10 text-zinc-400">Since {fmtDate(s?.memberSince || p.memberSince)}</span>
        </div>

        {s?.tagline && <p className="mt-3 text-sm text-amber-200 font-medium">{s.tagline}</p>}
        {(s?.description || p.bio) && <p className="mt-2 text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{s?.description || p.bio}</p>}
      </div>

      {/* Tabs */}
      <div className="px-4 mt-5">
        <div className="flex gap-1 bg-zinc-900 border border-white/10 rounded-xl p-1 text-sm w-full sm:w-auto sm:inline-flex">
          <button
            onClick={() => setTab('stock')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium ${tab === 'stock' ? 'bg-white text-black' : 'text-zinc-400'}`}
          >
            {s ? `In stock (${s.listings.length})` : p.shop ? `Shop (${p.shop.tryOns.length})` : `Try-ons (${p.sharedTryOns.length})`}
          </button>
          {(s || p.bio || ig || site) && (
            <button
              onClick={() => setTab('about')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium ${tab === 'about' ? 'bg-white text-black' : 'text-zinc-400'}`}
            >
              {s ? 'Shop info' : 'About'}
            </button>
          )}
        </div>
      </div>

      <div className="px-4 mt-4">
        {tab === 'stock' && (
          <>
            {s && (
              <>
                {s.listings.length === 0 && <p className="text-sm text-zinc-400 py-8 text-center">No items in stock right now.</p>}
                <div className={grid}>
                  {s.listings.map(({ garment, cover, commissionRate }) => (
                    <PinTile
                      key={garment.id}
                      image={garment.imageUrl}
                      title={garment.title}
                      subtitle={`${garment.brand || s.shopName} · reseller earns ${pct(commissionRate)}`}
                      price={garment.price}
                    >
                      {cover && (
                        <button onClick={() => onTryOn(cover)} className="flex-1 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold">
                          Try on
                        </button>
                      )}
                      <button onClick={() => onBuy(garment.id)} className="flex-1 py-2 rounded-lg bg-rose-500 text-white text-xs font-semibold">
                        Buy
                      </button>
                    </PinTile>
                  ))}
                </div>
                {tryOnTiles.length > 0 && <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-400 mt-6 mb-3">Try-ons shared by this seller</h2>}
              </>
            )}
            {(!s || tryOnTiles.length > 0) && (
              <>
                {!s && tryOnTiles.length === 0 && (
                  <p className="text-sm text-zinc-400 py-8 text-center">
                    {p.shop ? 'Nothing in stock in this shop right now.' : 'No shared try-ons yet.'}
                  </p>
                )}
                <div className={grid}>
                  {tryOnTiles.map((t) => (
                    <PinTile
                      key={t.id}
                      href={`#/t/${t.id}`}
                      image={t.cover.coverImageUrl || t.cover.garment.imageUrl}
                      title={t.cover.headline || t.cover.garment.title}
                      subtitle={`${t.cover.garment.title} · ${t.cover.sellerName}`}
                      price={t.cover.garment.price}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {tab === 'about' && (
          <div className="bg-zinc-950 border border-white/10 rounded-2xl px-4 divide-y divide-white/5">
            {s?.address && <Detail icon={MapPin} label="Address">{s.address}{s.city ? `, ${s.city}` : ''}</Detail>}
            {s?.openingHours && <Detail icon={Clock} label="Opening hours"><span className="whitespace-pre-line">{s.openingHours}</span></Detail>}
            {s?.shippingInfo && <Detail icon={Truck} label="Delivery"><span className="whitespace-pre-line">{s.shippingInfo}</span></Detail>}
            {s?.returnsPolicy && <Detail icon={RotateCcw} label="Returns"><span className="whitespace-pre-line">{s.returnsPolicy}</span></Detail>}
            {s && <Detail icon={Tag} label="Reseller commission">{pct(s.commissionOffered)} of each sale made through a reseller's try-on link</Detail>}
            {s?.whatsapp && (
              <Detail icon={MessageCircle} label="WhatsApp">
                <a className="text-emerald-300 underline" href={`https://wa.me/${contactHref(s.whatsapp).replace(/^\+/, '')}`} target="_blank" rel="noreferrer noopener">{s.whatsapp}</a>
              </Detail>
            )}
            {s?.contactPhone && <Detail icon={Phone} label="Phone"><a className="underline" href={`tel:${contactHref(s.contactPhone)}`}>{s.contactPhone}</a></Detail>}
            {s?.contactEmail && <Detail icon={Mail} label="Email"><a className="underline" href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a></Detail>}
            {ig && <Detail icon={Instagram} label="Instagram"><a className="underline" href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer noopener">@{ig}</a></Detail>}
            {site && /^https?:\/\//i.test(site) && <Detail icon={Globe} label="Website"><a className="underline break-all" href={site} target="_blank" rel="noreferrer noopener">{site}</a></Detail>}
            {!s && !p.bio && !ig && !site && <p className="py-4 text-sm text-zinc-400">Nothing here yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
};
