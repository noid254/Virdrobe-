import React from 'react';
import { MagazineCover, UserFitProfile } from '../types/schema';
import { QRCodeBadge } from './QRCodeBadge';
import {
  Sparkles,
  MapPin,
  Tag,
  CheckCircle2,
  Heart,
  Share2,
  Eye,
  ShieldAlert,
  Coins,
} from 'lucide-react';

interface Props {
  cover: MagazineCover;
  userProfile: UserFitProfile;
  onTryOn: (cover: MagazineCover) => void;
  onShareAffiliate: (cover: MagazineCover) => void;
  onViewBoutique?: (sellerId: string) => void;
  isTriedOn?: boolean;
}

export const MagazineCoverCard: React.FC<Props> = ({
  cover,
  userProfile,
  onTryOn,
  onShareAffiliate,
  onViewBoutique,
  isTriedOn = false,
}) => {
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(cover.likes);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) {
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  const garment = cover.garment;

  return (
    <div className="relative w-full max-w-[430px] mx-auto select-none group">
      {/* Magazine Cover Shell with Authentic Editorial Ratio (3:4 aspect ratio) */}
      <div className="relative aspect-[3/4.2] w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] transition-all duration-300">
        {/* Background Image with High-Fashion Editorial Treatment */}
        <img
          src={cover.coverImageUrl}
          alt={cover.headline}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
        />

        {/* Sophisticated Editorial Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/40 pointer-events-none" />

        {/* Top Header: Boutique Masthead & Issue Bar */}
        <div className="absolute top-0 inset-x-0 p-5 pt-6 text-center z-10">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-zinc-300/90 uppercase border-b border-white/20 pb-2 mb-2">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              {cover.issueTag}
            </span>
            <span className="text-zinc-400">
              VIRDROBE EDITORIAL
            </span>
            <span>
              {garment.sellerLocation.city.toUpperCase()}
            </span>
          </div>

          {/* Large Bold Magazine Masthead */}
          <h1
            onClick={() => onViewBoutique?.(cover.sellerId)}
            className="font-masthead text-3xl sm:text-4xl text-white font-black tracking-[0.22em] uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] cursor-pointer hover:text-rose-200 transition"
          >
            {cover.masthead}
          </h1>
          <p className="text-[10px] uppercase font-sans tracking-[0.3em] text-zinc-300 drop-shadow mt-0.5">
            HAUTE CURATION • EXACT FIT ATELIER
          </p>
        </div>

        {/* Top Right Floating Action Badges */}
        <div className="absolute top-28 right-4 z-20 flex flex-col gap-2.5">
          <button
            onClick={toggleLike}
            className={`w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition shadow-lg ${
              liked
                ? 'bg-rose-500/90 border-rose-400 text-white'
                : 'bg-black/50 border-white/20 text-white hover:bg-black/80'
            }`}
            title="Like Cover"
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onShareAffiliate(cover);
            }}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 flex items-center justify-center transition shadow-lg group/btn"
            title="Creator Affiliate Link (10% Commission)"
          >
            <Share2 className="w-4 h-4 group-hover/btn:text-amber-300 transition" />
          </button>
        </div>

        {/* Distance & Local Boutique Badge */}
        <div className="absolute top-28 left-4 z-20">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] text-zinc-200 shadow-md">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-medium">{garment.sellerLocation.distanceMiles} mi away</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-300 truncate max-w-[100px]">{garment.sellerLocation.city}</span>
          </div>
        </div>

        {/* Middle Left: Editorial Teaser Headings */}
        <div className="absolute top-44 left-4 max-w-[65%] z-10 pointer-events-none">
          <div className="inline-block px-2 py-0.5 rounded bg-white/10 backdrop-blur-md border border-white/20 text-[9px] uppercase font-mono tracking-wider text-rose-200 mb-1">
            Exact Proportions: 35" Bust • 27" Waist
          </div>
          <h2 className="font-serif-editorial text-2xl sm:text-3xl text-white font-bold leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {cover.headline}
          </h2>
          <p className="font-sans text-xs text-zinc-300 line-clamp-2 mt-1 drop-shadow leading-relaxed">
            {cover.subheading}
          </p>
        </div>

        {/* Bottom Section: Pricing, QR Code, Exact Fit Guarantee, and Try-On Action */}
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 pt-8 z-20 bg-gradient-to-t from-black via-black/90 to-transparent">
          {/* Wardrobe Match / Styling Tip banner */}
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-zinc-900/80 backdrop-blur-md border border-white/10 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <p className="text-[11px] text-zinc-300 truncate">
              {cover.stylingTip}
            </p>
          </div>

          <div className="flex items-end justify-between gap-3">
            {/* Left: Price and Anatomical Specs */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-serif-editorial text-white">
                  ${garment.price}
                </span>
                {garment.originalRetailPrice > garment.price && (
                  <span className="text-xs text-zinc-400 line-through">
                    ${garment.originalRetailPrice}
                  </span>
                )}
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 uppercase">
                  {Math.round((1 - garment.price / garment.originalRetailPrice) * 100)}% Off Retail
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-300 font-mono">
                <span className="text-white font-semibold">{garment.brand}</span>
                <span>•</span>
                <span className="text-zinc-400">{garment.measurements.labelSize}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Exact Fit: Fits user's 27" waist & 35" bust</span>
              </div>
            </div>

            {/* Right: Embedded Unique Affiliate / Product QR Code */}
            <div className="shrink-0 flex flex-col items-end">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onShareAffiliate(cover);
                }}
                className="cursor-pointer group/qr transition transform hover:scale-105"
              >
                <QRCodeBadge
                  data={cover.qrCodeData}
                  size={58}
                  label="10% AFFILIATE"
                  showScanEffect={true}
                />
              </div>
            </div>
          </div>

          {/* Main Action Bar: Try On Button with Seller Token indicator */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
            <button
              onClick={() => onTryOn(cover)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-2 ${
                isTriedOn
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white hover:bg-zinc-100 text-black hover:shadow-rose-500/20'
              }`}
            >
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>{isTriedOn ? 'Wearing on Twin (Tap to View)' : 'Try On Digital Twin'}</span>
              <span className="text-[10px] font-mono opacity-60">(-1 Token)</span>
            </button>

            <button
              onClick={() => onShareAffiliate(cover)}
              className="p-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/15 text-zinc-200 transition"
              title="Share Cover & Earn 10% Commission"
            >
              <Tag className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
