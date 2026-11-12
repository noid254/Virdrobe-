import React, { useEffect, useState } from 'react';
import { TryOnView } from '../types/account';
import { api, money, pct } from '../lib/api';
import { Avatar } from './UserMenu';
import { ArrowLeft, Loader2, ShoppingBag, Sparkles } from 'lucide-react';

interface Props {
  id: string;
  signedIn: boolean;
  onBuy: (garmentId: string, tryOnId: string) => void;
  onTryOn: (cover: any) => void;
}

export const SharedTryOnPage: React.FC<Props> = ({ id, signedIn, onBuy, onTryOn }) => {
  const [t, setT] = useState<TryOnView | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setT(null);
    setError('');
    api<TryOnView>(`/api/tryons/${encodeURIComponent(id)}`)
      .then(setT)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error)
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-zinc-300">
        <p className="mb-4">{error}</p>
        <a href="#/" className="text-rose-300 underline">Back to Discover</a>
      </div>
    );
  if (!t)
    return (
      <div className="flex justify-center py-24 text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );

  const g = t.cover.garment;
  const img = t.cover.coverImageUrl || g.imageUrl;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
      <a href="#/" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-3">
        <ArrowLeft className="w-3.5 h-3.5" /> Discover
      </a>
      <div className="grid md:grid-cols-2 gap-5 bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden">
        <img src={img} alt={g.title} className="w-full max-h-[70vh] md:max-h-none md:h-full object-cover bg-zinc-900" referrerPolicy="no-referrer" />
        <div className="p-5 flex flex-col gap-3">
          {t.creator && (
            <a href={`#/u/${t.creator.handle}`} className="flex items-center gap-2.5 w-fit">
              <Avatar src={t.creator.avatarUrl} name={t.creator.displayName} className="w-9 h-9" />
              <span>
                <span className="block text-sm text-white font-medium">{t.creator.displayName}</span>
                <span className="block text-[11px] text-zinc-400">{t.creator.isAffiliate ? 'Reseller' : 'Shopper'} · tried this on</span>
              </span>
            </a>
          )}
          <h1 className="text-2xl font-serif-editorial text-white leading-tight">{t.cover.headline || g.title}</h1>
          {t.cover.subheading && <p className="text-sm text-zinc-300">{t.cover.subheading}</p>}

          <div className="border-t border-white/10 pt-3 text-sm text-zinc-300 space-y-1">
            <p><strong className="text-white">{g.title}</strong> · {g.brand}</p>
            <p className="text-zinc-400">{g.color} · {g.fabric} · size {g.measurements?.labelSize}</p>
            <p className="text-zinc-400">Sold by {t.cover.sellerName}{g.sellerLocation?.city ? ` · ${g.sellerLocation.city}` : ''}</p>
          </div>

          <p className="text-2xl font-mono text-amber-300">{money(g.price)}</p>

          {t.inStock ? (
            <div className="flex flex-col sm:flex-row gap-2 mt-1">
              <button
                onClick={() => onBuy(g.id, t.id)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold text-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> {signedIn ? 'Buy now' : 'Sign in to buy'}
              </button>
              <button
                onClick={() => onTryOn(t.cover)}
                className="flex-1 py-3 rounded-xl bg-white/10 border border-white/15 text-white font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-rose-300" /> Try it on me
              </button>
            </div>
          ) : (
            <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">This item is out of stock.</p>
          )}
          <p className="text-[11px] text-zinc-500">
            {t.cover.earnsCommission
              ? `Purchases through this link support ${t.creator?.displayName} (${pct(t.cover.affiliateCommissionRate)} commission paid by the seller).`
              : 'The seller will confirm your order and arrange delivery.'}
          </p>
        </div>
      </div>
    </div>
  );
};
