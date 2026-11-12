import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Loader2, Store, Tag, X } from 'lucide-react';

const inputCls = 'w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-3 text-base sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-400';

export const RoleSetupModal: React.FC<{ kind: 'affiliate' | 'seller'; onClose: () => void; onDone: (msg: string) => void }> = ({ kind, onClose, onDone }) => {
  const { enableAffiliate, enableSeller, user } = useAuth();
  const [shopName, setShopName] = useState('');
  const [city, setCity] = useState(user?.profile.city || '');
  const [category, setCategory] = useState('Independent label');
  const [method, setMethod] = useState('mpesa');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (kind === 'affiliate') {
        await enableAffiliate(method, details);
        onDone('You are now a reseller. Share try-ons to earn commission.');
      } else {
        await enableSeller({ shopName, city, category });
        onDone('Your shop is open. Add items and complete your profile.');
        window.location.hash = '#/me';
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md bg-[#12141a] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-serif-editorial text-white flex items-center gap-2">
            {kind === 'affiliate' ? <Tag className="w-5 h-5 text-amber-400" /> : <Store className="w-5 h-5 text-purple-400" />}
            {kind === 'affiliate' ? 'Become a reseller' : 'Open a seller shop'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-zinc-400" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        {kind === 'affiliate' ? (
          <div className="space-y-3">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Share your try-ons. When someone buys through your link you earn the commission the seller set for that item. Your reseller page lists only the try-ons that are still in stock. Without this, you can still share, but you will not earn.
            </p>
            <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="mpesa">Paid via M-Pesa</option>
              <option value="bank">Paid via bank transfer</option>
              <option value="paypal">Paid via PayPal</option>
            </select>
            <input className={inputCls} placeholder="M-Pesa number or account (you can add later)" value={details} onChange={(e) => setDetails(e.target.value)} />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Sellers list clothes with exact measurements, set the commission resellers earn, and see their own balance and performance. Only you can see those.
            </p>
            <input required className={inputCls} placeholder="Shop name" value={shopName} onChange={(e) => setShopName(e.target.value)} />
            <input className={inputCls} placeholder="Town / city" value={city} onChange={(e) => setCity(e.target.value)} />
            <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
              {['Independent label', 'Vintage curator', 'Consignment studio', 'Personal closet', 'Boutique'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}

        {error && <p role="alert" className="mt-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">{error}</p>}
        <button disabled={busy} className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} {kind === 'affiliate' ? 'Register as reseller' : 'Open my shop'}
        </button>
      </form>
    </div>
  );
};
