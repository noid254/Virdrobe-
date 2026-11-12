import React, { useEffect, useRef, useState } from 'react';
import { AccountUser, Role } from '../types/account';
import { Check, ChevronDown, LogOut, Pencil, Store, Tag, User } from 'lucide-react';

const roleLabel: Record<Role, string> = {
  client: 'Client',
  affiliate: 'Reseller',
  seller: 'Seller',
};

interface Props {
  user: AccountUser;
  onSwitchRole: (r: Role) => void;
  onBecomeAffiliate: () => void;
  onBecomeSeller: () => void;
  onLogOut: () => void;
}

export const Avatar: React.FC<{ src?: string; name: string; className?: string }> = ({ src, name, className = 'w-8 h-8' }) =>
  src ? (
    <img src={src} alt="" className={`${className} rounded-full object-cover bg-zinc-800`} referrerPolicy="no-referrer" />
  ) : (
    <span
      className={`${className} rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-bold flex items-center justify-center text-xs shrink-0`}
    >
      {(name || '?').trim().charAt(0).toUpperCase()}
    </span>
  );

export const UserMenu: React.FC<Props> = ({ user, onSwitchRole, onBecomeAffiliate, onBecomeSeller, onLogOut }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);

  const go = (hash: string) => {
    setOpen(false);
    window.location.hash = hash;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/15 transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar src={user.profile.avatarUrl} name={user.profile.displayName} />
        <span className="hidden sm:inline text-xs text-white font-medium max-w-[90px] truncate">
          {roleLabel[user.activeRole]}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-1.5rem))] bg-zinc-950 border border-white/15 rounded-2xl shadow-2xl p-2 z-50"
        >
          <div className="px-3 py-2 border-b border-white/10 mb-1">
            <p className="text-sm font-semibold text-white truncate">{user.profile.displayName}</p>
            <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
          </div>

          <p className="px-3 pt-1 pb-0.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500">Switch role</p>
          {user.roles.map((r) => (
            <button
              key={r}
              onClick={() => {
                setOpen(false);
                onSwitchRole(r);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm hover:bg-white/10 ${
                user.activeRole === r ? 'text-white' : 'text-zinc-300'
              }`}
            >
              <span>{roleLabel[r]}</span>
              {user.activeRole === r && <Check className="w-4 h-4 text-emerald-400" />}
            </button>
          ))}
          {!user.affiliate && (
            <button
              onClick={() => {
                setOpen(false);
                onBecomeAffiliate();
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-amber-300 hover:bg-amber-500/10"
            >
              <Tag className="w-4 h-4" /> Become a reseller (earn commission)
            </button>
          )}
          {!user.seller && (
            <button
              onClick={() => {
                setOpen(false);
                onBecomeSeller();
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-purple-300 hover:bg-purple-500/10"
            >
              <Store className="w-4 h-4" /> Open a seller shop
            </button>
          )}

          <div className="border-t border-white/10 mt-1 pt-1">
            <button
              onClick={() => go(`#/u/${user.handle}`)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-zinc-200 hover:bg-white/10"
            >
              <User className="w-4 h-4" /> View my public profile
            </button>
            <button
              onClick={() => go('#/me')}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-zinc-200 hover:bg-white/10"
            >
              <Pencil className="w-4 h-4" /> Edit profile
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onLogOut();
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-rose-300 hover:bg-rose-500/10"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
