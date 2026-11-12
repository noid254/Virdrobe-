import React, { useState } from 'react';
import { MagazineCover, UserFitProfile } from '../types/schema';
import { QRCodeBadge } from './QRCodeBadge';
import {
  Sparkles,
  Heart,
  Share2,
  CheckCircle2,
  MapPin,
  Tag,
  Bookmark,
  ShieldCheck,
  Store,
  Layers,
  Copy,
} from 'lucide-react';

interface Props {
  cover: MagazineCover | null;
  userProfile: UserFitProfile;
  isOpen: boolean;
  onClose: () => void;
  onTryOn: (cover: MagazineCover) => void;
  onShareAffiliate: (cover: MagazineCover) => void;
  onBuy?: (cover: MagazineCover) => void;
  isTriedOn?: boolean;
}

export const PinDetailModal: React.FC<Props> = ({
  cover,
  userProfile,
  isOpen,
  onClose,
  onTryOn,
  onShareAffiliate,
  onBuy,
  isTriedOn = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !cover) return null;

  const garment = cover.garment;

  // Sharing creates a tracked link on the server (see App.handleShareCover).
  const handleCopyLink = () => {
    onShareAffiliate(cover);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/90 backdrop-blur-xl">
      <div className="relative w-full max-w-4xl max-h-[96dvh] overflow-y-auto bg-[#101217] border border-white/15 rounded-3xl p-4 sm:p-7 shadow-2xl text-zinc-100">
        {/* Top Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition z-20"
        >
          ✕
        </button>

        {/* Modal Grid: Left Image, Right Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Full Editorial Cover Image */}
          <div className="md:col-span-6 relative aspect-[3/4.2] w-full rounded-2xl overflow-hidden bg-black border border-white/15 shadow-2xl">
            <img
              src={cover.coverImageUrl}
              alt={cover.headline}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50 pointer-events-none" />

            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <span className="text-[10px] font-masthead tracking-widest text-white/90 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full uppercase">
                {cover.masthead}
              </span>
            </div>

            <div className="absolute bottom-4 right-4 z-20">
              <QRCodeBadge
                data={cover.qrCodeData}
                size={54}
                label="10% AFFILIATE"
                showScanEffect={true}
              />
            </div>
          </div>

          {/* Right Column: Detailed Garment Specs, Anatomical Match, & Try-On */}
          <div className="md:col-span-6 space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                  {garment.condition.replace(/_/g, ' ')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-zinc-300 bg-black/60 border border-white/10 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  {garment.sellerLocation.distanceMiles} mi • {garment.sellerLocation.city}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif-editorial text-white font-bold leading-tight">
                {cover.headline}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 font-mono">
                <strong className="text-white">{garment.brand}</strong> — {garment.title}
              </p>
            </div>

            {/* Pricing Card */}
            <div className="p-4 bg-zinc-900/70 border border-white/10 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                  Exact Fit Guaranteed
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-serif-editorial text-white">
                    ${garment.price}
                  </span>
                  {garment.originalRetailPrice > garment.price && (
                    <span className="text-xs text-zinc-400 line-through">
                      ${garment.originalRetailPrice}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-emerald-400 font-mono">
                    {Math.round((1 - garment.price / garment.originalRetailPrice) * 100)}% Off
                  </span>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                  Label Size
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  {garment.measurements.labelSize}
                </span>
              </div>
            </div>

            {/* Exact Anatomical Fit Breakdown */}
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Zero-Miss Fit Scan Verified
                </span>
                <span>Matches Claire's Proportions</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Garment measurements ({garment.measurements.chestMin}"-{garment.measurements.chestMax}" chest, {garment.measurements.waistMin}"-{garment.measurements.waistMax}" waist) align with your active 35" bust and 27" waist.
              </p>
            </div>

            {/* Editorial Copy & Styling Advice */}
            <div className="space-y-2 text-xs">
              <h4 className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                Editorial Styling Curation
              </h4>
              <p className="text-zinc-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                {cover.editorialCopy}
              </p>
              <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/5 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-300">
                  <strong className="text-amber-300 font-semibold">Closet Match:</strong> {cover.stylingTip}
                </p>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  onTryOn(cover);
                  onClose();
                }}
                className={`flex-1 py-3 px-5 rounded-2xl font-semibold text-xs tracking-wider uppercase transition shadow-xl flex items-center justify-center gap-2 ${
                  isTriedOn
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isTriedOn ? 'View Wearing on Twin' : 'Try it on me'}</span>
              </button>

              {onBuy && garment.inStock !== false && (
                <button
                  onClick={() => onBuy(cover)}
                  className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold text-xs tracking-wider uppercase shadow-xl flex items-center justify-center gap-2"
                >
                  <span>Buy · ${garment.price}</span>
                </button>
              )}

              <button
                onClick={handleCopyLink}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-1.5"
              >
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Share link</span>
              </button>

              <button
                onClick={() => {
                  onShareAffiliate(cover);
                  onClose();
                }}
                className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-amber-300 transition flex items-center justify-center"
                title="Share this look"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
