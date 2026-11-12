import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { AccountUser } from '../types/account';
import { Avatar } from './UserMenu';
import { ArrowLeft, CheckCircle2, Loader2, Lock } from 'lucide-react';

const inputCls =
  'w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-3 text-base sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-400';

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  textarea?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
}> = ({ label, value, onChange, placeholder, hint, textarea, type = 'text', inputMode, maxLength }) => (
  <label className="block">
    <span className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">{label}</span>
    {textarea ? (
      <textarea rows={3} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} />
    ) : (
      <input type={type} inputMode={inputMode} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} />
    )}
    {hint && <span className="block text-[11px] text-zinc-500 mt-1">{hint}</span>}
  </label>
);

const Section: React.FC<{ title: string; sub?: string; children: React.ReactNode }> = ({ title, sub, children }) => (
  <section className="bg-zinc-950 border border-white/10 rounded-2xl p-4 sm:p-5">
    <h2 className="text-base font-serif-editorial text-white">{title}</h2>
    {sub && <p className="text-xs text-zinc-400 mt-0.5 mb-3">{sub}</p>}
    <div className="grid sm:grid-cols-2 gap-3 mt-3">{children}</div>
  </section>
);

const SELLER_KEYS = [
  'shopName', 'tagline', 'description', 'category', 'address', 'city', 'openingHours', 'returnsPolicy',
  'shippingInfo', 'contactEmail', 'contactPhone', 'whatsapp', 'instagram', 'logoUrl', 'bannerUrl',
] as const;

export const ProfileEditor: React.FC<{ user: AccountUser }> = ({ user }) => {
  const { saveAccount } = useAuth();
  const [p, setP] = useState({ ...user.profile });
  const [handle, setHandle] = useState(user.handle);
  const [s, setS] = useState(user.seller ? { ...user.seller } : null);
  const [rate, setRate] = useState(user.seller ? String(Math.round(user.seller.defaultCommissionRate * 1000) / 10) : '10');
  const [payoutMethod, setPayoutMethod] = useState(user.affiliate?.payoutMethod || 'mpesa');
  const [payoutDetails, setPayoutDetails] = useState(user.affiliate?.payoutDetails || '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const setSeller = (k: string) => (v: string) => setS((cur) => (cur ? { ...cur, [k]: v } : cur));
  const filled = s ? SELLER_KEYS.filter((k) => String((s as any)[k] || '').trim()).length : 0;
  const missing = s ? SELLER_KEYS.filter((k) => !String((s as any)[k] || '').trim()) : [];

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const patch: any = { profile: p, handle };
      if (s) patch.seller = { ...s, defaultCommissionRate: Math.min(50, Math.max(0, parseFloat(rate) || 0)) / 100 };
      if (user.affiliate) patch.affiliate = { payoutMethod, payoutDetails };
      await saveAccount(patch);
      setMsg({ ok: true, text: 'Profile saved.' });
    } catch (err: any) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 pb-28">
      <div className="flex items-center justify-between">
        <a href={`#/u/${user.handle}`} className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white">
          <ArrowLeft className="w-3.5 h-3.5" /> View public profile
        </a>
        <span className="text-[11px] text-zinc-500 flex items-center gap-1"><Lock className="w-3 h-3" /> {user.email}</span>
      </div>

      <div className="flex items-center gap-3">
        <Avatar src={p.avatarUrl} name={p.displayName} className="w-16 h-16 text-xl" />
        <div>
          <h1 className="text-2xl font-serif-editorial text-white">Edit profile</h1>
          <p className="text-xs text-zinc-400">What others see on your public page.</p>
        </div>
      </div>

      <Section title="About you">
        <Field label="Display name" value={p.displayName} onChange={(v) => setP({ ...p, displayName: v })} maxLength={60} />
        <Field label="Handle" value={handle} onChange={setHandle} hint={`Your page: /#/u/${handle}`} maxLength={24} />
        <Field label="Photo link" value={p.avatarUrl} onChange={(v) => setP({ ...p, avatarUrl: v })} placeholder="https://..." hint="Link to a photo of you" />
        <Field label="City" value={p.city} onChange={(v) => setP({ ...p, city: v })} placeholder="Ruaka, Kiambu" />
        <Field label="Country" value={p.country} onChange={(v) => setP({ ...p, country: v })} />
        <Field label="Instagram" value={p.instagram} onChange={(v) => setP({ ...p, instagram: v })} placeholder="@yourname" />
        <Field label="TikTok" value={p.tiktok} onChange={(v) => setP({ ...p, tiktok: v })} placeholder="@yourname" />
        <Field label="Website" value={p.website} onChange={(v) => setP({ ...p, website: v })} placeholder="https://..." />
        <div className="sm:col-span-2">
          <Field label="Bio" textarea value={p.bio} onChange={(v) => setP({ ...p, bio: v })} maxLength={400} placeholder="Tell people about your style" />
        </div>
      </Section>

      {s && (
        <>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-between text-sm text-purple-100 mb-2">
              <span className="font-semibold">Shop profile {filled === SELLER_KEYS.length ? 'complete' : `${filled}/${SELLER_KEYS.length} filled`}</span>
              {filled === SELLER_KEYS.length && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-purple-400" style={{ width: `${(filled / SELLER_KEYS.length) * 100}%` }} />
            </div>
            {missing.length > 0 && <p className="text-[11px] text-purple-200/80 mt-2">Still missing: {missing.join(', ')}</p>}
          </div>

          <Section title="Shop details" sub="Shown on your public shop page.">
            <Field label="Shop name" value={s.shopName} onChange={setSeller('shopName')} maxLength={80} />
            <Field label="Shop type" value={s.category} onChange={setSeller('category')} placeholder="Vintage curator, Independent label..." />
            <div className="sm:col-span-2"><Field label="Tagline" value={s.tagline} onChange={setSeller('tagline')} maxLength={120} placeholder="One line that sells your shop" /></div>
            <div className="sm:col-span-2"><Field label="About the shop" textarea value={s.description} onChange={setSeller('description')} maxLength={800} /></div>
            <Field label="Logo link" value={s.logoUrl} onChange={setSeller('logoUrl')} placeholder="https://..." />
            <Field label="Banner link" value={s.bannerUrl} onChange={setSeller('bannerUrl')} placeholder="https://..." />
          </Section>

          <Section title="Location and policies">
            <Field label="Street / building" value={s.address} onChange={setSeller('address')} placeholder="Ruaka, Limuru Rd" />
            <Field label="Town / city" value={s.city} onChange={setSeller('city')} />
            <div className="sm:col-span-2"><Field label="Opening hours" textarea value={s.openingHours} onChange={setSeller('openingHours')} placeholder={'Mon–Sat 9am–7pm\nSun closed'} /></div>
            <div className="sm:col-span-2"><Field label="Delivery" textarea value={s.shippingInfo} onChange={setSeller('shippingInfo')} placeholder="Nairobi same day, countrywide 2–3 days" /></div>
            <div className="sm:col-span-2"><Field label="Returns policy" textarea value={s.returnsPolicy} onChange={setSeller('returnsPolicy')} placeholder="Exchange within 7 days with tags" /></div>
          </Section>

          <Section title="Contact" sub="Visible to shoppers on your shop page.">
            <Field label="WhatsApp" type="tel" inputMode="tel" value={s.whatsapp} onChange={setSeller('whatsapp')} placeholder="+2547..." />
            <Field label="Phone" type="tel" inputMode="tel" value={s.contactPhone} onChange={setSeller('contactPhone')} placeholder="+2547..." />
            <Field label="Email" type="email" value={s.contactEmail} onChange={setSeller('contactEmail')} />
            <Field label="Instagram" value={s.instagram} onChange={setSeller('instagram')} placeholder="@yourshop" />
            <Field label="Website" value={s.website} onChange={setSeller('website')} placeholder="https://..." />
          </Section>

          <Section title="Reseller commission" sub="What resellers earn when someone buys through their try-on link. Public, so resellers can choose what to promote. You can override it per item.">
            <Field label="Default commission %" type="number" inputMode="decimal" value={rate} onChange={setRate} hint="0 to 50" />
          </Section>
        </>
      )}

      {user.affiliate && (
        <Section title="Reseller payouts" sub="Private. Only you and Virdrobe can see this.">
          <label className="block">
            <span className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">Payout method</span>
            <select className={inputCls} value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)}>
              <option value="mpesa">M-Pesa</option>
              <option value="bank">Bank transfer</option>
              <option value="paypal">PayPal</option>
            </select>
          </label>
          <Field label="Number / account" value={payoutDetails} onChange={setPayoutDetails} placeholder="+2547..." />
        </Section>
      )}

      <div className="fixed bottom-14 sm:bottom-0 inset-x-0 z-30 bg-[#0c0d10]/95 backdrop-blur border-t border-white/10 px-3 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <p role="status" className={`flex-1 text-xs ${msg ? (msg.ok ? 'text-emerald-300' : 'text-rose-300') : 'text-transparent'}`}>{msg?.text || '.'}</p>
          <button disabled={busy} className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold text-sm disabled:opacity-60 flex items-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </div>
      </div>
    </form>
  );
};
