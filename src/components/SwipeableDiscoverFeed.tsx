import React, { useState, useMemo } from 'react';
import { MagazineCover, UserFitProfile, Garment } from '../types/schema';
import { MagazineCoverCard } from './MagazineCoverCard';
import { evaluateGarmentFit } from '../data/mockDatabase';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  CheckCircle,
  EyeOff,
  Filter,
  Grid,
  Layers,
  MapPin,
  Ruler,
} from 'lucide-react';

interface Props {
  covers: MagazineCover[];
  userProfile: UserFitProfile;
  onTryOn: (cover: MagazineCover) => void;
  onShareAffiliate: (cover: MagazineCover) => void;
  onOpenCalibration: () => void;
  triedOnGarmentIds: string[];
}

export const SwipeableDiscoverFeed: React.FC<Props> = ({
  covers,
  userProfile,
  onTryOn,
  onShareAffiliate,
  onOpenCalibration,
  triedOnGarmentIds,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cover_deck' | 'editorial_grid'>('cover_deck');

  // Strict Zero-Miss Filtering & Tolerance Evaluation
  const { filteredCovers, filteredOutCount, filterExplanations } = useMemo(() => {
    let outCount = 0;
    const explanations: string[] = [];

    const valid = covers.filter((cover) => {
      // 1. Category filter
      if (selectedCategory !== 'all' && cover.garment.category !== selectedCategory) {
        return false;
      }

      // 2. Local distance filter
      if (cover.garment.sellerLocation.distanceMiles > userProfile.radiusMiles) {
        outCount++;
        return false;
      }

      // 3. Strict anatomical fit & stock check
      const fit = evaluateGarmentFit(userProfile, cover.garment);
      if (!fit.isMatch) {
        outCount++;
        if (fit.failReason) explanations.push(fit.failReason);
        return false;
      }

      return true;
    });

    return {
      filteredCovers: valid,
      filteredOutCount: outCount,
      filterExplanations: explanations,
    };
  }, [covers, userProfile, selectedCategory]);

  const activeCover = filteredCovers[currentIndex] || filteredCovers[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredCovers.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < filteredCovers.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-6">
      {/* Strict Fit Header & Tolerance Bar */}
      <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4 mb-6 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Active Exact Fit Scan
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-800/40">
                <CheckCircle className="w-3 h-3" />
                Zero-Miss Enforced
              </span>
            </div>
            <p className="text-sm font-medium text-white">
              {userProfile.name}: {userProfile.chestInches}" Bust • {userProfile.waistInches}" Waist • {userProfile.hipsInches}" Hips ({userProfile.shoeSizeUS} US)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Strict Filter Stats Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs text-zinc-300">
            <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              <strong className="text-rose-400">{filteredOutCount} non-fitting</strong> sizes hidden
            </span>
          </div>

          <button
            onClick={onOpenCalibration}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-medium text-white transition flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
            <span>Calibrate Measurements</span>
          </button>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Covers' },
            { id: 'outerwear', label: 'Outerwear' },
            { id: 'tops', label: 'Tops & Blouses' },
            { id: 'bottoms', label: 'Trousers & Denim' },
            { id: 'dresses', label: 'Dresses & Gowns' },
            { id: 'shoes', label: 'Footwear' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-white text-black font-semibold shadow-md'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* View Deck vs Grid Toggle */}
        <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setViewMode('cover_deck')}
            className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1.5 ${
              viewMode === 'cover_deck'
                ? 'bg-white/20 text-white font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Magazine Cover Deck (Swipeable)"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Cover Deck</span>
          </button>
          <button
            onClick={() => setViewMode('editorial_grid')}
            className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1.5 ${
              viewMode === 'editorial_grid'
                ? 'bg-white/20 text-white font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Editorial Lookbook Grid"
          >
            <Grid className="w-4 h-4" />
            <span className="hidden sm:inline">Lookbook</span>
          </button>
        </div>
      </div>

      {/* Main Discover Display */}
      {filteredCovers.length === 0 ? (
        <div className="text-center py-16 bg-zinc-950/40 rounded-2xl border border-white/10 p-8">
          <Sparkles className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h3 className="text-lg font-serif-editorial text-white">
            Zero-Miss Protection Active
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 mb-4">
            No garments in the selected category match your exact body proportions ({userProfile.chestInches}" chest, {userProfile.waistInches}" waist).
          </p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold"
          >
            Show All Categories
          </button>
        </div>
      ) : viewMode === 'cover_deck' ? (
        /* Single Editorial Cover Deck with Smooth Navigation */
        <div className="relative flex flex-col items-center">
          {/* Navigation Controls */}
          <div className="relative w-full max-w-[440px] flex items-center justify-center">
            {/* Prev Button */}
            <button
              onClick={handlePrev}
              className="absolute -left-4 sm:-left-14 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/70 hover:bg-black border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition shadow-2xl hover:scale-105"
              aria-label="Previous Magazine Cover"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Current Magazine Cover Card */}
            {activeCover && (
              <MagazineCoverCard
                cover={activeCover}
                userProfile={userProfile}
                onTryOn={onTryOn}
                onShareAffiliate={onShareAffiliate}
                isTriedOn={triedOnGarmentIds.includes(activeCover.garmentId)}
              />
            )}

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="absolute -right-4 sm:-right-14 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/70 hover:bg-black border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition shadow-2xl hover:scale-105"
              aria-label="Next Magazine Cover"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Issue Counter & Deck Indicator */}
          <div className="mt-5 flex items-center gap-3 text-xs font-mono text-zinc-400">
            <span>
              COVER {currentIndex + 1} OF {filteredCovers.length}
            </span>
            <div className="flex items-center gap-1">
              {filteredCovers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentIndex === i ? 'w-6 bg-rose-500' : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                  aria-label={`Jump to cover ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Lookbook Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCovers.map((cover) => (
            <MagazineCoverCard
              key={cover.id}
              cover={cover}
              userProfile={userProfile}
              onTryOn={onTryOn}
              onShareAffiliate={onShareAffiliate}
              isTriedOn={triedOnGarmentIds.includes(cover.garmentId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
