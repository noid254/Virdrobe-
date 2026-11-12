import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Eye, EyeOff, Loader2, Shirt, Tag, Store } from 'lucide-react';

const inputCls =
  'w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-3 text-base sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-400';

export const AuthPage: React.FC<{ note?: string }> = ({ note }) => {
  const { logIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [wantsAffiliate, setWantsAffiliate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signin') await logIn(email, password);
      else await signUp({ email, password, name, role: wantsAffiliate ? 'affiliate' : 'client' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d10] text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-rose-400 p-[1px] mb-3">
            <div className="w-full h-full bg-[#0c0d10] rounded-[15px] flex items-center justify-center">
              <span className="font-masthead text-rose-300 font-black text-lg">V</span>
            </div>
          </div>
          <h1 className="font-masthead text-2xl font-black tracking-[0.16em] uppercase">Virdrobe</h1>
          <p className="text-xs text-zinc-400 mt-1">Where it fits. Shop, try on, share.</p>
        </div>

        <div className="bg-zinc-950/80 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl">
          {note && (
            <p className="mb-4 text-xs text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
              {note}
            </p>
          )}

          <div className="grid grid-cols-2 bg-zinc-900 border border-white/10 rounded-xl p-1 text-sm mb-5">
            {(['signup', 'signin'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError('');
                }}
                className={`py-2 rounded-lg font-medium transition ${
                  mode === m ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {m === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'signup' && (
              <input
                className={inputCls}
                placeholder="Your name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            )}
            <input
              className={inputCls}
              type="email"
              inputMode="email"
              placeholder="Email address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative">
              <input
                className={`${inputCls} pr-11`}
                type={showPw ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'Password (8+ characters)' : 'Password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === 'signup' ? 8 : 1}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {mode === 'signup' && (
              <>
                <label className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wantsAffiliate}
                    onChange={(e) => setWantsAffiliate(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-amber-500"
                  />
                  <span className="text-xs text-zinc-300 leading-relaxed">
                    <strong className="text-amber-300">Also earn as a reseller (affiliate).</strong> Share your try-ons and earn
                    the commission the seller sets when someone buys through your link. You can turn this on later too.
                  </span>
                </label>
                <ul className="text-[11px] text-zinc-400 grid gap-1.5 pt-1">
                  <li className="flex items-center gap-2">
                    <Shirt className="w-3.5 h-3.5 text-rose-400 shrink-0" /> Everyone starts as a client: see clothes that fit you and try them on.
                  </li>
                  <li className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Resellers share try-ons and get a shop page.
                  </li>
                  <li className="flex items-center gap-2">
                    <Store className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Sellers can be added from your profile menu after sign up.
                  </li>
                </ul>
              </>
            )}

            {error && (
              <p role="alert" className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold text-sm tracking-wide disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
