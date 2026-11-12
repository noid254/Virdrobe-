import React, { useEffect, useState } from 'react';
import { AccountUser, TryOnView } from '../types/account';
import { api, money, pct } from '../lib/api';
import { Copy, Eye, Loader2, Share2, Tag, Wallet } from 'lucide-react';

interface Dash {
  code: string;
  payoutMethod: string;
  payoutDetails: string;
  tryOnsShared: number;
  views: number;
  earnedPending: number;
  earnedCleared: number;
  orders: any[];
}

export const AffiliateHub: React.FC<{ user: AccountUser; onToast: (m: string) => void }> = ({ user, onToast }) => {
  const [d, setD] = useState<Dash | null>(null);
  const [mine, setMine] = useState<TryOnView[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Dash>('/api/affiliate/dashboard').then(setD).catch((e) => setError(e.message));
    api<TryOnView[]>('/api/me/tryons').then(setMine).catch(() => undefined);
  }, []);

  const copy = async (t: TryOnView) => {
    const link = `${window.location.origin}/#/t/${t.id}`;
    try {
      await navigator.clipboard.writeText(link);
      onToast('Link copied. Share it anywhere.');
    } catch {
      window.prompt('Copy this link', link);
    }
  };

  if (error) return <p className="text-center text-rose-300 py-16">{error}</p>;
  if (!d) return <div className="flex justify-center py-24 text-zinc-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4">
      <div>
        <p className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] mb-1.5">
          <Tag className="w-3.5 h-3.5" /> Private reseller earnings
        </p>
        <h1 className="text-2xl font-serif-editorial text-white">Your earnings</h1>
        <p className="text-xs text-zinc-400">
          Try clothes on, share them, and earn the seller's commission when someone buys through your link.{' '}
          <a className="underline text-amber-200" href={`#/u/${user.handle}`}>See your shop</a>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-950/70 border border-emerald-500/30 rounded-2xl p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Cleared</p>
          <p className="text-2xl font-black font-serif-editorial text-white mt-1">{money(d.earnedCleared)}</p>
          <p className="text-[11px] text-zinc-500">Seller confirmed payment</p>
        </div>
        <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Pending</p>
          <p className="text-2xl font-black font-serif-editorial text-white mt-1">{money(d.earnedPending)}</p>
          <p className="text-[11px] text-zinc-500">Waiting for seller</p>
        </div>
        <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5" /> Try-ons shared</p>
          <p className="text-2xl font-black font-serif-editorial text-white mt-1">{d.tryOnsShared}</p>
        </div>
        <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Link views</p>
          <p className="text-2xl font-black font-serif-editorial text-white mt-1">{d.views}</p>
        </div>
      </div>

      {!d.payoutDetails && (
        <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
          Add your {d.payoutMethod === 'mpesa' ? 'M-Pesa number' : 'payout details'} in <a className="underline" href="#/me">Edit profile</a> so sellers can pay you.
        </p>
      )}

      <section className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-white mb-2">Your shared try-ons</h2>
        {mine.length === 0 && <p className="text-sm text-zinc-400">Nothing yet. Open Discover, try something on and publish it.</p>}
        <div className="space-y-2">
          {mine.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-2 border-t border-white/5 first:border-0">
              <img src={t.cover.coverImageUrl || t.cover.garment.imageUrl} alt="" className="w-12 h-14 rounded-lg object-cover bg-zinc-900 shrink-0" referrerPolicy="no-referrer" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{t.cover.garment.title}</p>
                <p className="text-[11px] text-zinc-400">
                  {money(t.cover.garment.price)} · earn {pct(t.cover.affiliateCommissionRate)} · {t.views} views ·{' '}
                  <span className={t.inStock ? 'text-emerald-300' : 'text-rose-300'}>{t.inStock ? 'in stock' : 'sold out (hidden from shop)'}</span>
                </p>
              </div>
              <button onClick={() => copy(t)} className="shrink-0 p-2.5 rounded-xl bg-white/10 text-white" aria-label="Copy link"><Copy className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-white mb-2">Orders from your links</h2>
        {d.orders.length === 0 && <p className="text-sm text-zinc-400">No orders yet.</p>}
        {d.orders.map((o) => (
          <div key={o.id} className="flex items-center justify-between gap-3 py-2 border-t border-white/5 first:border-0 text-sm">
            <div className="min-w-0">
              <p className="text-zinc-100 truncate">{o.garmentTitle}</p>
              <p className="text-[11px] text-zinc-500">{money(o.orderTotal)} · {o.shopperCity} · {new Date(o.timestamp).toLocaleDateString()}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-amber-300">+{money(o.commissionEarned)}</p>
              <p className={`text-[11px] ${o.status === 'cleared' ? 'text-emerald-300' : 'text-zinc-500'}`}>{o.status}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
