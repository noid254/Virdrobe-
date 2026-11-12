import React from 'react';
import { AccountUser, Role } from '../types/account';
import { UserFitProfile } from '../types/schema';
import { UserMenu } from './UserMenu';
import { Coins, Compass, Shirt, SlidersHorizontal, Store, Tag } from 'lucide-react';

export type TabId = 'discover' | 'closet' | 'affiliate' | 'studio';

interface Props {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  user: AccountUser;
  userProfile: UserFitProfile;
  onOpenCalibration: () => void;
  onSwitchRole: (r: Role) => void;
  onBecomeAffiliate: () => void;
  onBecomeSeller: () => void;
  onLogOut: () => void;
}

export const tabsForRole = (role: Role): { id: TabId; label: string; Icon: React.ElementType; color: string }[] => {
  const base = [{ id: 'discover' as TabId, label: 'Discover', Icon: Compass, color: 'text-rose-500' }];
  if (role === 'seller') return [...base, { id: 'studio', label: 'My Shop', Icon: Store, color: 'text-purple-400' }];
  const withCloset = [...base, { id: 'closet' as TabId, label: 'My Virdrobe', Icon: Shirt, color: 'text-amber-500' }];
  if (role === 'affiliate') return [...withCloset, { id: 'affiliate', label: 'Earnings', Icon: Tag, color: 'text-emerald-400' }];
  return withCloset;
};

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  user,
  userProfile,
  onOpenCalibration,
  onSwitchRole,
  onBecomeAffiliate,
  onBecomeSeller,
  onLogOut,
}) => {
  const tabs = tabsForRole(user.activeRole);
  const showFit = user.activeRole !== 'seller';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0c0d10]/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <button
            onClick={() => {
              window.location.hash = '#/';
              onSelectTab('discover');
            }}
            className="flex items-center gap-2 group shrink-0"
            aria-label="Virdrobe home"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-500 to-rose-400 p-[1px] shadow-lg shadow-rose-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#0c0d10] rounded-[11px] flex items-center justify-center">
                <span className="font-masthead text-rose-300 font-black text-sm">V</span>
              </div>
            </div>
            <div className="text-left">
              <span className="font-masthead text-base sm:text-xl font-black text-white tracking-[0.14em] uppercase block leading-none">
                VIRDROBE
              </span>
              <p className="text-[9px] font-mono text-zinc-400 tracking-wider hidden md:block mt-1">
                WHERE IT FITS — SHOP • FIT • THRIFT
              </p>
            </div>
          </button>

          {/* Desktop / tablet tabs */}
          <nav className="hidden sm:flex items-center bg-zinc-900/90 border border-white/10 rounded-2xl p-1 text-xs">
            {tabs.map(({ id, label, Icon, color }) => (
              <button
                key={id}
                onClick={() => {
                  window.location.hash = '#/';
                  onSelectTab(id);
                }}
                className={`px-3 md:px-4 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
                  activeTab === id ? 'bg-white text-black font-semibold shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 min-w-0">
            {showFit && (
              <button
                onClick={onOpenCalibration}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/15 text-xs text-zinc-300 transition shadow"
                title="Recalibrate your measurements and digital twin"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] text-white hidden lg:inline">
                  {userProfile.chestInches}"B / {userProfile.waistInches}"W / {userProfile.hipsInches}"H
                </span>
                <span className="font-mono text-[11px] text-white lg:hidden">{userProfile.waistInches}"W</span>
                <SlidersHorizontal className="w-3 h-3 text-rose-400" />
              </button>
            )}

            {/* Token balance is PRIVATE to the seller */}
            {user.activeRole === 'seller' && user.seller && (
              <button
                onClick={() => onSelectTab('studio')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono transition"
                title="Try-on token balance (only you can see this)"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{user.seller.tokenBalance}</span>
                <span className="hidden sm:inline">tokens</span>
              </button>
            )}

            <UserMenu
              user={user}
              onSwitchRole={onSwitchRole}
              onBecomeAffiliate={onBecomeAffiliate}
              onBecomeSeller={onBecomeSeller}
              onLogOut={onLogOut}
            />
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0c0d10]/95 backdrop-blur-xl border-t border-white/10 flex"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {tabs.map(({ id, label, Icon, color }) => (
          <button
            key={id}
            onClick={() => {
              window.location.hash = '#/';
              onSelectTab(id);
            }}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
              activeTab === id ? 'text-white' : 'text-zinc-500'
            }`}
          >
            <Icon className={`w-5 h-5 ${activeTab === id ? color : ''}`} />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
};
