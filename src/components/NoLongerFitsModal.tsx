import React, { useState, useEffect } from 'react';
import { Garment, UserFitProfile } from '../types/schema';
import {
  ArrowRightLeft,
  DollarSign,
  Sparkles,
  CheckCircle2,
  Tag,
  Share2,
  Ruler,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  garment: Garment | null;
  userProfile: UserFitProfile;
  onConfirmList: (garmentId: string, resalePrice: number, resaleDescription: string) => void;
}

export const NoLongerFitsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  garment,
  userProfile,
  onConfirmList,
}) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [resalePrice, setResalePrice] = useState<number>(0);
  const [resaleDescription, setResaleDescription] = useState<string>('');
  const [catchyTitle, setCatchyTitle] = useState<string>('');
  const [highlightTags, setHighlightTags] = useState<string[]>([]);
  const [daysToSell, setDaysToSell] = useState<number>(5);

  useEffect(() => {
    if (!isOpen || !garment) return;

    // Call server Gemini endpoint to generate luxury resale listing
    const fetchResaleData = async () => {
      setLoadingAi(true);
      try {
        const response = await fetch('/api/resale-description', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            garment,
            userMeasurements: {
              chestInches: userProfile.chestInches,
              waistInches: userProfile.waistInches,
              hipsInches: userProfile.hipsInches,
            },
          }),
        });
        const res = await response.json();
        if (res.success && res.data) {
          setResalePrice(res.data.recommendedPrice || Math.round(garment.price * 0.8));
          setCatchyTitle(res.data.catchyTitle || garment.title);
          setResaleDescription(res.data.resaleDescription || '');
          setHighlightTags(res.data.highlightTags || ['thrift', 'exact-fit', 'pre-loved']);
          setDaysToSell(res.data.estimatedDaysToSell || 4);
        }
      } catch (e) {
        console.error(e);
        setResalePrice(Math.round(garment.price * 0.8));
        setResaleDescription(
          `Curated from my personal closet. Fits smaller than my current ${userProfile.waistInches}" waist. Pristine condition in ${garment.color}.`
        );
      } finally {
        setLoadingAi(false);
      }
    };

    fetchResaleData();
  }, [isOpen, garment, userProfile]);

  if (!isOpen || !garment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmList(garment.id, resalePrice, resaleDescription);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#12141a] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-100">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
                  Circular Fashion Storefront
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                  1-Tap Resale
                </span>
              </div>
              <h2 className="text-2xl font-serif-editorial text-white tracking-tight">
                "No Longer Fits" Listing Studio
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition"
          >
            ✕
          </button>
        </div>

        {/* Comparison: User's Current Measurements vs Outgrown Garment Specs */}
        <div className="mt-5 p-4 bg-amber-950/20 border border-amber-500/20 rounded-2xl">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-amber-400" />
              Fit Discrepancy Analysis
            </span>
            <span className="text-amber-300 font-mono text-[11px]">
              Ready for size-matched discovery
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
              <span className="text-zinc-400 block text-[10px] uppercase font-mono">
                Your Current Body
              </span>
              <span className="font-semibold text-white">
                Waist {userProfile.waistInches}" • Bust {userProfile.chestInches}"
              </span>
            </div>
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
              <span className="text-zinc-400 block text-[10px] uppercase font-mono">
                Garment Fit Range
              </span>
              <span className="font-semibold text-amber-300">
                Waist {garment.measurements.waistMin}"-{garment.measurements.waistMax}" ({garment.measurements.labelSize})
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Garment Preview */}
          <div className="flex items-center gap-4 p-3 bg-zinc-900/60 rounded-2xl border border-white/5">
            <img
              src={garment.imageUrl}
              alt={garment.title}
              className="w-16 h-20 rounded-xl object-cover bg-zinc-950"
            />
            <div>
              <p className="text-[11px] font-mono text-zinc-400 uppercase">{garment.brand}</p>
              <h4 className="text-sm font-semibold text-white">{garment.title}</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Original Retail: ${garment.originalRetailPrice} • Purchased: ${garment.price}
              </p>
            </div>
          </div>

          {/* Pricing Suggestion with Gemini */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Recommended Secondhand Price
              </label>
              {loadingAi && (
                <span className="text-[11px] text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  Gemini optimizing fair market valuation...
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
              <input
                type="number"
                value={resalePrice}
                onChange={(e) => setResalePrice(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Estimated to sell within <strong className="text-white">{daysToSell} days</strong> to a size-matched shopper within your 25mi radius.
            </p>
          </div>

          {/* AI Generated Resale Copy */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 block mb-1.5">
              Editorial Thrift Story (AI Generated)
            </label>
            <textarea
              rows={3}
              value={resaleDescription}
              onChange={(e) => setResaleDescription(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-zinc-200 leading-relaxed focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Highlight Tags */}
          {highlightTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {highlightTags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              Keep in Closet
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-amber-500/20 hover:opacity-95 transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>List on Thrift Storefront & Generate QR</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
