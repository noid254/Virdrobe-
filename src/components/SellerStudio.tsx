import React, { useCallback, useEffect, useState } from 'react';
import { AccountUser } from '../types/account';
import { MagazineCover } from '../types/schema';
import { api, money, pct } from '../lib/api';
import { makeBasicCover } from '../lib/covers';
import { useAuth } from '../auth/AuthContext';
import { CoverGenerator } from './CoverGenerator';
import { Coins, Loader2, PackageCheck, PlusCircle, Sparkles, Store, TrendingUp, Wallet } from 'lucide-react';

interface Dash {
  ledger: { balance: number; totalTryOnsServed: number; costPerTryOnUsd: number; transactions: any[] };
  performance: {
    orders: number;
    pendingOrders: number;
    revenue: number;
    commissionsOwed: number;
    conversionRate: number;
    activeListings: number;
    topGarments: { id: string; title: string; orders: number; revenue: number }[];
  };
  orders: any[];
  listings: { id: string; title: string; price: number; imageUrl: string; inStock: boolean; commissionRate: number }[];
  defaultCommissionRate: number;
}

const inputCls = 'w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-base sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-400';

const Stat: React.FC<{ label: string; value: string; sub?: string; accent?: string; icon: React.ElementType }> = ({ label, value, sub, accent = 'text-white', icon: Icon }) => (
  <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4">
    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-400">
      <span>{label}</span>
      <Icon className="w-4 h-4" />
    </div>
    <p className={`text-2xl font-black font-serif-editorial mt-1 ${accent}`}>{value}</p>
    {sub && <p className="text-[11px] text-zinc-500 mt-0.5">{sub}</p>}
  </div>
);

const blankItem = {
  title: '', brand: '', category: 'tops', color: '', fabric: '', price: '', imageUrl: '', labelSize: '',
  chestMin: '', chestMax: '', waistMin: '', waistMax: '', hipsMin: '', hipsMax: '', commission: '',
};

export const SellerStudio: React.FC<{ user: AccountUser; onToast: (m: string) => void; onFeedChanged: () => void }> = ({ user, onToast, onFeedChanged }) => {
  const { setUser } = useAuth();
  const [d, setD] = useState<Dash | null>(null);
  const [tab, setTab] = useState<'overview' | 'items' | 'orders' | 'cover'>('overview');
  const [error, setError] = useState('');
  const [item, setItem] = useState(blankItem);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<Dash>('/api/seller/dashboard');
      setD(data);
      // keep the navbar token pill in sync
      setUser({ ...user, seller: user.seller ? { ...user.seller, tokenBalance: data.ledger.balance } : null });
    } catch (e: any) {
      setError(e.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<any>, ok: string) => {
    setBusy(true);
    try {
      await fn();
      onToast(ok);
      await load();
      onFeedChanged();
    } catch (e: any) {
      onToast(e.message);
    } finally {
      setBusy(false);
    }
  };

  const num = (v: string) => parseFloat(v);
  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const m = {
      chestMin: num(item.chestMin), chestMax: num(item.chestMax),
      waistMin: num(item.waistMin), waistMax: num(item.waistMax),
      hipsMin: num(item.hipsMin), hipsMax: num(item.hipsMax),
      labelSize: item.labelSize || 'One size',
    };
    if (Object.values(m).some((v) => typeof v === 'number' && Number.isNaN(v))) {
      onToast('Fill in all chest, waist and hips measurements (inches) so the fit engine can match shoppers.');
      return;
    }
    const garment: any = {
      title: item.title, brand: item.brand || user.seller!.shopName, category: item.category,
      color: item.color, fabric: item.fabric, condition: 'new_with_tags', fitType: 'regular',
      price: num(item.price), originalRetailPrice: num(item.price), imageUrl: item.imageUrl.trim(),
      measurements: m, tags: [], inStock: true, sellerBoutiqueType: 'independent_label',
    };
    act(
      () =>
        api('/api/seller/listings', {
          body: {
            garment,
            cover: makeBasicCover(garment, user.seller!.shopName),
            commissionRate: item.commission ? num(item.commission) / 100 : undefined,
          },
        }).then(() => setItem(blankItem)),
      'Item published to Discover.'
    );
  };

  const publishCover = async (cover: MagazineCover) => {
    await act(
      () => api('/api/seller/listings', { body: { garment: cover.garment, cover, commissionRate: undefined } }),
      'Cover published to Discover.'
    );
    setTab('items');
  };

  if (error) return <p className="text-center text-rose-300 py-16">{error}</p>;
  if (!d) return <div className="flex justify-center py-24 text-zinc-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const tabs = [
    ['overview', 'Overview'], ['items', `Items (${d.listings.length})`],
    ['orders', `Orders${d.performance.pendingOrders ? ` (${d.performance.pendingOrders})` : ''}`], ['cover', 'AI cover'],
  ] as const;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-[11px] mb-1.5">
            <Store className="w-3.5 h-3.5" /> Private seller studio
          </p>
          <h1 className="text-2xl font-serif-editorial text-white truncate">{user.seller!.shopName}</h1>
          <p className="text-xs text-zinc-400">Balances and performance are only visible to you.</p>
        </div>
        <a href={`#/u/${user.handle}`} className="shrink-0 text-xs px-3 py-2 rounded-full bg-white/10 border border-white/15 text-white">Public shop</a>
      </div>

      <div className="flex gap-1 bg-zinc-900 border border-white/10 rounded-xl p-1 text-sm mb-5 overflow-x-auto">
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`flex-1 whitespace-nowrap px-3 py-2 rounded-lg font-medium ${tab === id ? 'bg-white text-black' : 'text-zinc-400'}`}>{label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Try-on tokens" value={String(d.ledger.balance)} sub="1 used per shopper try-on" accent="text-amber-300" icon={Coins} />
            <Stat label="Try-ons served" value={String(d.ledger.totalTryOnsServed)} icon={TrendingUp} />
            <Stat label="Orders" value={String(d.performance.orders)} sub={`${d.performance.conversionRate}% of try-ons`} icon={PackageCheck} />
            <Stat label="Sales" value={money(d.performance.revenue)} sub={`${money(d.performance.commissionsOwed)} owed to resellers`} icon={Wallet} />
          </div>

          <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-white mb-1">Top up tokens</h2>
            <p className="text-[11px] text-zinc-500 mb-3">Payment is not connected yet, so packs are added instantly for testing.</p>
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 250].map((n) => (
                <button key={n} disabled={busy} onClick={() => act(() => api('/api/seller/tokens', { body: { amount: n } }), `Added ${n} tokens.`)} className="py-2.5 rounded-xl bg-amber-500 text-black font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-60">
                  <PlusCircle className="w-4 h-4" /> {n}
                </button>
              ))}
            </div>
          </div>

          {d.performance.topGarments.length > 0 && (
            <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-white mb-2">Best sellers</h2>
              {d.performance.topGarments.map((g) => (
                <div key={g.id} className="flex justify-between text-sm py-1.5 border-t border-white/5 first:border-0">
                  <span className="text-zinc-200 truncate pr-3">{g.title}</span>
                  <span className="text-zinc-400 shrink-0">{g.orders} · {money(g.revenue)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-white mb-2">Token activity</h2>
            {d.ledger.transactions.length === 0 && <p className="text-sm text-zinc-500">No activity yet.</p>}
            {d.ledger.transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 text-xs py-2 border-t border-white/5 first:border-0">
                <div className="min-w-0">
                  <p className="text-zinc-200 truncate">{t.description}</p>
                  <p className="text-zinc-500">{new Date(t.createdAt).toLocaleString()}</p>
                </div>
                <span className={`font-mono font-bold ${t.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{t.amount > 0 ? `+${t.amount}` : t.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'items' && (
        <div className="space-y-4">
          <form onSubmit={addItem} className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-white">Add an item</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required className={inputCls} placeholder="Title" value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} />
              <input className={inputCls} placeholder="Brand (optional)" value={item.brand} onChange={(e) => setItem({ ...item, brand: e.target.value })} />
              <select className={inputCls} value={item.category} onChange={(e) => setItem({ ...item, category: e.target.value })}>
                {['tops', 'bottoms', 'outerwear', 'dresses', 'shoes'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input className={inputCls} placeholder="Colour" value={item.color} onChange={(e) => setItem({ ...item, color: e.target.value })} />
              <input className={inputCls} placeholder="Fabric" value={item.fabric} onChange={(e) => setItem({ ...item, fabric: e.target.value })} />
              <input required className={inputCls} type="number" inputMode="decimal" min="0" step="0.01" placeholder="Price (USD)" value={item.price} onChange={(e) => setItem({ ...item, price: e.target.value })} />
              <input required className={`${inputCls} sm:col-span-2`} placeholder="Photo link (https://...)" value={item.imageUrl} onChange={(e) => setItem({ ...item, imageUrl: e.target.value })} />
              <input className={inputCls} placeholder="Label size (e.g. M, UK 10)" value={item.labelSize} onChange={(e) => setItem({ ...item, labelSize: e.target.value })} />
              <input className={inputCls} type="number" inputMode="decimal" step="0.1" placeholder={`Commission % (default ${pct(d.defaultCommissionRate)})`} value={item.commission} onChange={(e) => setItem({ ...item, commission: e.target.value })} />
            </div>
            <p className="text-[11px] text-zinc-400">Garment measurements in inches (min and max) so shoppers see only what fits them:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['chest', 'waist', 'hips'] as const).map((k) => (
                <React.Fragment key={k}>
                  <input required className={inputCls} type="number" inputMode="decimal" step="0.1" placeholder={`${k} min`} value={(item as any)[`${k}Min`]} onChange={(e) => setItem({ ...item, [`${k}Min`]: e.target.value })} />
                  <input required className={inputCls} type="number" inputMode="decimal" step="0.1" placeholder={`${k} max`} value={(item as any)[`${k}Max`]} onChange={(e) => setItem({ ...item, [`${k}Max`]: e.target.value })} />
                </React.Fragment>
              ))}
            </div>
            <button disabled={busy} className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold text-sm disabled:opacity-60">Publish item</button>
          </form>

          {d.listings.length === 0 && <p className="text-sm text-zinc-400 text-center py-6">No items yet. Add your first item above.</p>}
          {d.listings.map((l) => (
            <div key={l.id} className="flex gap-3 bg-zinc-950/70 border border-white/10 rounded-2xl p-3">
              <img src={l.imageUrl} alt="" className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg object-cover bg-zinc-900 shrink-0" referrerPolicy="no-referrer" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-semibold truncate">{l.title}</p>
                <p className="text-xs text-zinc-400">{money(l.price)} · reseller earns {pct(l.commissionRate)}</p>
                <button
                  disabled={busy}
                  onClick={() => act(() => api(`/api/seller/listings/${l.id}`, { method: 'PATCH', body: { inStock: !l.inStock } }), l.inStock ? 'Marked out of stock. Reseller shops hide it.' : 'Back in stock.')}
                  className={`mt-2 px-3 py-1.5 rounded-full text-xs font-semibold ${l.inStock ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'}`}
                >
                  {l.inStock ? 'In stock · tap to mark sold out' : 'Sold out · tap to restock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-2">
          {d.orders.length === 0 && <p className="text-sm text-zinc-400 text-center py-10">No orders yet.</p>}
          {d.orders.map((o) => (
            <div key={o.id} className="bg-zinc-950/70 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-semibold truncate">{o.garmentTitle}</p>
                <p className="text-xs text-zinc-400">{money(o.orderTotal)} · {o.shopperCity} · {new Date(o.timestamp).toLocaleDateString()}</p>
                {o.hasAffiliate && <p className="text-[11px] text-amber-300">Reseller commission {money(o.commissionEarned)} ({pct(o.commissionRate)})</p>}
              </div>
              {o.status === 'pending' ? (
                <button disabled={busy} onClick={() => act(() => api(`/api/seller/orders/${o.id}/confirm`, { body: {} }), 'Order confirmed.')} className="shrink-0 px-3 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold">Confirm paid</button>
              ) : (
                <span className="shrink-0 text-xs text-emerald-300">Confirmed</span>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'cover' && (
        <CoverGenerator sellerId={user.id} defaultBoutiqueName={user.seller!.shopName.toUpperCase()} commissionRate={d.defaultCommissionRate} onPublishNewSellerCover={publishCover} />
      )}
    </div>
  );
};
