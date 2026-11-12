import React, { useState, useMemo } from 'react';
import { MagazineCover, UserFitProfile } from '../types/schema';
import { PinterestPinCard } from './PinterestPinCard';
import { MagazineCoverCard } from './MagazineCoverCard';
import { PinDetailModal } from './PinDetailModal';
import { PinterestFiltersDrawer, FilterState } from './PinterestFiltersDrawer';
import { TrendingStylesChart } from './TrendingStylesChart';
import { evaluateGarmentFit } from '../data/mockDatabase';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  LayoutGrid,
  CheckCircle,
  EyeOff,
  X,
  Ruler,
  TrendingUp,
  Flame,
} from 'lucide-react';

interface Props {
  covers: MagazineCover[];
  userProfile: UserFitProfile;
  onTryOn: (cover: MagazineCover) => void;
  onShareAffiliate: (cover: MagazineCover) => void;
  onBuy?: (cover: MagazineCover) => void;
  onOpenCalibration: () => void;
  triedOnGarmentIds: string[];
}

export const SwipeableDiscoverFeed: React.FC<Props> = ({
  covers,
  userProfile,
  onTryOn,
  onShareAffiliate,
  onBuy,
  onOpenCalibration,
  triedOnGarmentIds,
}) => {
  // View mode: Pinterest Masonry Grid (default) or Editorial Single Cover Deck
  const [viewMode, setViewMode] = useState<'pinterest_masonry' | 'cover_deck'>('pinterest_masonry');
  const [deckIndex, setDeckIndex] = useState(0);
  const [selectedDetailCover, setSelectedDetailCover] = useState<MagazineCover | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [showTrendsChart, setShowTrendsChart] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  // Multi-Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    maxPrice: 1000,
    condition: 'all',
    fitType: 'all',
    maxDistance: userProfile.radiusMiles || 25,
    selectedBoutique: 'all',
    selectedColor: 'all',
    onlyStrictFit: true,
  });

  // Trending Search Suggestions
  const TRENDING_SEARCHES = ['Trench', 'Totême', 'Helmut Lang', 'Cashmere', 'Silk Gown', 'SoHo', 'Margiela'];

  // Advanced Multi-Attribute Filtering Engine with Zero-Miss Tolerance
  const { filteredCovers, filteredOutCount, filterReasons } = useMemo(() => {
    let outCount = 0;
    const reasons: string[] = [];

    const result = covers.filter((cover) => {
      const garment = cover.garment;

      // 1. Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesQuery =
          cover.headline.toLowerCase().includes(q) ||
          garment.brand.toLowerCase().includes(q) ||
          garment.title.toLowerCase().includes(q) ||
          garment.fabric.toLowerCase().includes(q) ||
          garment.color.toLowerCase().includes(q) ||
          cover.sellerName.toLowerCase().includes(q) ||
          garment.tags.some((t) => t.toLowerCase().includes(q));

        if (!matchesQuery) return false;
      }

      // 2. Category
      if (filters.category !== 'all' && garment.category !== filters.category) {
        return false;
      }

      // 3. Price Ceiling
      if (garment.price > filters.maxPrice) {
        return false;
      }

      // 4. Condition
      if (filters.condition !== 'all' && garment.condition !== filters.condition) {
        return false;
      }

      // 5. Fit Type
      if (filters.fitType !== 'all' && garment.fitType !== filters.fitType) {
        return false;
      }

      // 6. Distance
      if (garment.sellerLocation.distanceMiles > filters.maxDistance) {
        outCount++;
        return false;
      }

      // 7. Boutique Atelier
      if (filters.selectedBoutique !== 'all' && cover.sellerId !== filters.selectedBoutique) {
        return false;
      }

      // 8. Strict Anatomical Fit Rule (Enforces zero-miss and in-stock check)
      if (filters.onlyStrictFit) {
        const fit = evaluateGarmentFit(userProfile, garment);
        if (!fit.isMatch) {
          outCount++;
          if (fit.failReason) reasons.push(fit.failReason);
          return false;
        }
      }

      return true;
    });

    return {
      filteredCovers: result,
      filteredOutCount: outCount,
      filterReasons: reasons,
    };
  }, [covers, userProfile, filters]);

  // Active filter count (excluding defaults)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.maxPrice < 1000) count++;
    if (filters.condition !== 'all') count++;
    if (filters.fitType !== 'all') count++;
    if (filters.maxDistance < 50) count++;
    if (filters.selectedBoutique !== 'all') count++;
    if (!filters.onlyStrictFit) count++;
    return count;
  }, [filters]);

  const activeCover = filteredCovers[deckIndex] || filteredCovers[0];

  const handlePrevDeck = () => {
    setDeckIndex((prev) => (prev > 0 ? prev - 1 : filteredCovers.length - 1));
  };

  const handleNextDeck = () => {
    setDeckIndex((prev) => (prev < filteredCovers.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4">
      {/* 1. Pinterest Search & Global Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        {/* Search Input Bar (Pinterest Rounded Pill Style) */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Search clothes, brands, styles"
            className="w-full pl-10 pr-10 py-2.5 rounded-full bg-zinc-900/90 border border-white/10 hover:border-white/25 focus:border-rose-500 text-xs text-white placeholder-zinc-500 shadow-inner focus:outline-none transition"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Advanced Filter Modal Button with Count Badge */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 transition border ${
              activeFilterCount > 0
                ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-md shadow-rose-500/20'
                : 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-white hover:border-white/20'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Trends Visualizer Toggle */}
          <button
            onClick={() => setShowTrendsChart((prev) => !prev)}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition border ${
              showTrendsChart
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/10'
                : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
            }`}
            title="Toggle Live Try-On Frequency Line Graph & Trends"
          >
            <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Trends Chart</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          </button>

          {/* Mode Switcher: Pinterest Masonry vs Single Deck */}
          <div className="flex items-center bg-zinc-900 border border-white/10 rounded-full p-1 text-xs">
            <button
              onClick={() => setViewMode('pinterest_masonry')}
              className={`p-1.5 px-3 rounded-full flex items-center gap-1.5 transition ${
                viewMode === 'pinterest_masonry'
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Pinterest Masonry Feed"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Pinterest Grid</span>
            </button>

            <button
              onClick={() => setViewMode('cover_deck')}
              className={`p-1.5 px-3 rounded-full flex items-center gap-1.5 transition ${
                viewMode === 'cover_deck'
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Editorial Cover Deck (Swipeable)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Deck</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Pinterest Quick Filter Pill Chips (Horizontal Scrollable Strip) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
        {[
          { label: 'All Pins', key: 'category', val: 'all' },
          { label: 'Outerwear', key: 'category', val: 'outerwear' },
          { label: 'Tops & Knits', key: 'category', val: 'tops' },
          { label: 'Trousers & Denim', key: 'category', val: 'bottoms' },
          { label: 'Evening Dresses', key: 'category', val: 'dresses' },
          { label: 'Footwear & Boots', key: 'category', val: 'shoes' },
          { label: 'Under $300', key: 'maxPrice', val: 300 },
          { label: 'Archival Vintage', key: 'condition', val: 'vintage' },
          { label: 'Within 5 Miles', key: 'maxDistance', val: 5 },
          { label: 'Tailored Fit', key: 'fitType', val: 'tailored' },
        ].map((chip, idx) => {
          const isActive =
            chip.key === 'category'
              ? filters.category === chip.val
              : chip.key === 'maxPrice'
              ? filters.maxPrice === chip.val
              : chip.key === 'condition'
              ? filters.condition === chip.val
              : chip.key === 'maxDistance'
              ? filters.maxDistance === chip.val
              : filters.fitType === chip.val;

          return (
            <button
              key={idx}
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  [chip.key]: isActive ? (chip.key === 'maxPrice' ? 1000 : chip.key === 'maxDistance' ? 25 : 'all') : chip.val,
                }));
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border ${
                isActive
                  ? 'bg-white text-black font-semibold border-white shadow-md'
                  : 'bg-zinc-900/80 text-zinc-300 hover:text-white border-white/5 hover:border-white/15'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* 3. Streamlined Status Bar */}
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-zinc-300 font-medium">
            {filteredCovers.length} pins for {userProfile.name.split(' ')[0]} ({userProfile.waistInches}"W • {userProfile.chestInches}"B)
          </span>
          {filteredOutCount > 0 && (
            <span className="text-[11px] text-zinc-500 font-mono">
              ({filteredOutCount} non-fitting hidden)
            </span>
          )}
        </div>

        <button
          onClick={onOpenCalibration}
          className="text-[11px] font-mono text-zinc-400 hover:text-white underline underline-offset-2"
        >
          Edit Size
        </button>
      </div>

      {/* 3.5. 'Trends' Section: Data visualization chart showing try-on frequency over time */}
      {showTrendsChart && (
        <TrendingStylesChart
          onSelectTrendCategory={(category) => {
            setFilters((prev) => ({
              ...prev,
              category,
            }));
          }}
          onSelectSearchQuery={(query) => {
            setFilters((prev) => ({
              ...prev,
              searchQuery: query,
            }));
          }}
        />
      )}

      {/* 4. MAIN FEED DISPLAY: PINTEREST MASONRY vs SINGLE DECK */}
      {filteredCovers.length === 0 ? (
        <div className="text-center py-20 bg-zinc-950/50 rounded-3xl border border-white/10 p-8">
          <Sparkles className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h3 className="text-xl font-serif-editorial text-white">
            No Pins Match Active Filters
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 mb-5">
            Your Zero-Miss filter hid non-fitting sizes. Try relaxing the search keywords or broadening the price/distance filters.
          </p>
          <button
            onClick={() => {
              setFilters({
                searchQuery: '',
                category: 'all',
                maxPrice: 1000,
                condition: 'all',
                fitType: 'all',
                maxDistance: 50,
                selectedBoutique: 'all',
                selectedColor: 'all',
                onlyStrictFit: true,
              });
            }}
            className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'pinterest_masonry' ? (
        /* PINTEREST MASONRY MULTI-COLUMN FEED */
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
          {filteredCovers.map((cover) => (
            <PinterestPinCard
              key={cover.id}
              cover={cover}
              userProfile={userProfile}
              onTryOn={onTryOn}
              onShareAffiliate={onShareAffiliate}
              onOpenDetail={(c) => setSelectedDetailCover(c)}
              isTriedOn={triedOnGarmentIds.includes(cover.garmentId)}
            />
          ))}
        </div>
      ) : (
        /* EDITORIAL SINGLE DECK VIEW */
        <div className="relative flex flex-col items-center">
          <div className="relative w-full max-w-[440px] flex items-center justify-center">
            <button
              onClick={handlePrevDeck}
              className="absolute -left-4 sm:-left-14 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/70 hover:bg-black border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition shadow-2xl hover:scale-105"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {activeCover && (
              <MagazineCoverCard
                cover={activeCover}
                userProfile={userProfile}
                onTryOn={onTryOn}
                onShareAffiliate={onShareAffiliate}
                isTriedOn={triedOnGarmentIds.includes(activeCover.garmentId)}
              />
            )}

            <button
              onClick={handleNextDeck}
              className="absolute -right-4 sm:-right-14 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/70 hover:bg-black border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition shadow-2xl hover:scale-105"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-5 flex items-center gap-3 text-xs font-mono text-zinc-400">
            <span>
              COVER {deckIndex + 1} OF {filteredCovers.length}
            </span>
          </div>
        </div>
      )}

      {/* Expanded Pin Detail Modal */}
      <PinDetailModal
        cover={selectedDetailCover}
        userProfile={userProfile}
        isOpen={!!selectedDetailCover}
        onClose={() => setSelectedDetailCover(null)}
        onTryOn={onTryOn}
        onShareAffiliate={onShareAffiliate}
        onBuy={onBuy}
        isTriedOn={selectedDetailCover ? triedOnGarmentIds.includes(selectedDetailCover.garmentId) : false}
      />

      {/* Advanced Filters Drawer */}
      <PinterestFiltersDrawer
        filters={filters}
        onChangeFilters={setFilters}
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        totalMatches={filteredCovers.length}
        filteredOutCount={filteredOutCount}
        userWaist={userProfile.waistInches}
        userChest={userProfile.chestInches}
      />
    </div>
  );
};
