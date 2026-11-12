import React from 'react';
import { UserFitProfile, SellerTokenLedger } from '../types/schema';
import {
  Sparkles,
  Layers,
  Shirt,
  Coins,
  Tag,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';

interface Props {
  activeTab: 'discover' | 'closet' | 'seller_affiliate';
  onSelectTab: (tab: 'discover' | 'closet' | 'seller_affiliate') => void;
  userProfile: UserFitProfile;
  sellerLedger: SellerTokenLedger;
  onOpenCalibration: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  userProfile,
  sellerLedger,
  onOpenCalibration,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0d10]/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Editorial Masthead */}
        <div
          onClick={() => onSelectTab('discover')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-500 to-rose-400 p-[1px] shadow-lg shadow-rose-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-[#0c0d10] rounded-[11px] flex items-center justify-center">
              <span className="font-masthead text-rose-300 font-black text-sm tracking-widest">
                V
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-masthead text-lg sm:text-xl font-black text-white tracking-[0.16em] uppercase">
                VIRDROBE
              </span>
              <span className="hidden md:inline px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                EXACT FIT
              </span>
            </div>
            <p className="text-[9px] font-mono text-zinc-400 tracking-wider hidden sm:block">
              WHERE IT FITS — SHOP • FIT • THRIFT
            </p>
          </div>
        </div>

        {/* Center Mode Switcher Tabs */}
        <nav className="flex items-center bg-zinc-900/90 border border-white/10 rounded-2xl p-1 text-xs">
          <button
            onClick={() => onSelectTab('discover')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
              activeTab === 'discover'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Discover Covers</span>
            <span className="sm:hidden">Discover</span>
          </button>

          <button
            onClick={() => onSelectTab('closet')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
              activeTab === 'closet'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shirt className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">My Virdrobe</span>
            <span className="sm:hidden">Closet</span>
          </button>

          <button
            onClick={() => onSelectTab('seller_affiliate')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
              activeTab === 'seller_affiliate'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Seller & Affiliate</span>
            <span className="md:hidden">Studio</span>
          </button>
        </nav>

        {/* Right Badges: Fit Calibration Pill + Token Indicator */}
        <div className="flex items-center gap-2">
          {/* Exact Fit Calibration Pill */}
          <button
            onClick={onOpenCalibration}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/15 text-xs text-zinc-300 transition shadow"
            title="Click to recalibrate your exact body measurements and digital twin"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-white hidden lg:inline">
              {userProfile.chestInches}"B / {userProfile.waistInches}"W / {userProfile.hipsInches}"H
            </span>
            <span className="font-mono text-[11px] text-white lg:hidden">
              {userProfile.waistInches}"W
            </span>
            <SlidersHorizontal className="w-3 h-3 text-rose-400 ml-0.5" />
          </button>

          {/* Seller Token Pill */}
          <button
            onClick={() => onSelectTab('seller_affiliate')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono transition"
            title="Seller Token Balance: 1 token deducted per exact-fit try-on"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{sellerLedger.balance} Tokens</span>
          </button>
        </div>
      </div>
    </header>
  );
};
