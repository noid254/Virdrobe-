import React from 'react';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  Search,
  MapPin,
  Tag,
  DollarSign,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export interface FilterState {
  searchQuery: string;
  category: string;
  maxPrice: number;
  condition: string;
  fitType: string;
  maxDistance: number;
  selectedBoutique: string;
  selectedColor: string;
  onlyStrictFit: boolean;
}

interface Props {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
  totalMatches: number;
  filteredOutCount: number;
  userWaist: number;
  userChest: number;
}

export const PinterestFiltersDrawer: React.FC<Props> = ({
  filters,
  onChangeFilters,
  isOpen,
  onClose,
  totalMatches,
  filteredOutCount,
  userWaist,
  userChest,
}) => {
  if (!isOpen) return null;

  const handleUpdate = (key: keyof FilterState, val: any) => {
    onChangeFilters({
      ...filters,
      [key]: val,
    });
  };

  const handleReset = () => {
    onChangeFilters({
      searchQuery: '',
      category: 'all',
      maxPrice: 1000,
      condition: 'all',
      fitType: 'all',
      maxDistance: 25,
      selectedBoutique: 'all',
      selectedColor: 'all',
      onlyStrictFit: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[94dvh] overflow-y-auto bg-[#12141a] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-rose-400" />
            <h3 className="text-xl font-serif-editorial text-white">
              Pinterest Discovery Filters
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/5 transition font-mono"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Form Controls */}
        <div className="py-4 space-y-5 text-xs">
          {/* 1. Category */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2">
              Garment Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All Pieces' },
                { id: 'outerwear', label: 'Outerwear' },
                { id: 'tops', label: 'Tops & Knits' },
                { id: 'bottoms', label: 'Trousers' },
                { id: 'dresses', label: 'Dresses' },
                { id: 'shoes', label: 'Footwear' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleUpdate('category', c.id)}
                  className={`py-2 px-3 rounded-xl font-medium transition border text-center ${
                    filters.category === c.id
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500 font-semibold'
                      : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Price Ceiling */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Max Price ($ USD)
              </label>
              <span className="font-bold text-rose-300 font-mono text-sm">
                Up to ${filters.maxPrice}
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="25"
              value={filters.maxPrice}
              onChange={(e) => handleUpdate('maxPrice', Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
              <span>$100</span>
              <span>$500</span>
              <span>$1,000+</span>
            </div>
          </div>

          {/* 3. Distance Radius */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Boutique Geofence Radius
              </label>
              <span className="font-bold text-rose-300 font-mono text-sm">
                Within {filters.maxDistance} miles
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              step="1"
              value={filters.maxDistance}
              onChange={(e) => handleUpdate('maxDistance', Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* 4. Condition */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2">
              Curation Condition
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'all', label: 'Any Condition' },
                { id: 'vintage', label: 'Archival Vintage' },
                { id: 'mint', label: 'Mint / Pristine' },
                { id: 'gently_loved', label: 'Gently Loved' },
              ].map((cond) => (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => handleUpdate('condition', cond.id)}
                  className={`py-2 px-2.5 rounded-xl font-medium transition border text-center truncate ${
                    filters.condition === cond.id
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500 font-semibold'
                      : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Silhouette / Fit Type */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2">
              Fit Silhouette
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'all', label: 'All Fits' },
                { id: 'tailored', label: 'Tailored' },
                { id: 'slim', label: 'Slim Cut' },
                { id: 'relaxed', label: 'Relaxed' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleUpdate('fitType', f.id)}
                  className={`py-2 px-2.5 rounded-xl font-medium transition border text-center truncate ${
                    filters.fitType === f.id
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500 font-semibold'
                      : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Specific Boutique */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2">
              Curator Atelier
            </label>
            <select
              value={filters.selectedBoutique}
              onChange={(e) => handleUpdate('selectedBoutique', e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="all">All NYC Boutiques & Consignments</option>
              <option value="seller_atelier_soho">Atelier Soho (SoHo, Manhattan)</option>
              <option value="seller_nordic_minimal">Nordic Minimal (Williamsburg, NY)</option>
              <option value="seller_le_marais">Le Marais Consignment (Nolita, Manhattan)</option>
              <option value="seller_harlem_archives">Harlem Vintage Archive (Harlem, NY)</option>
            </select>
          </div>

          {/* 7. Zero-Miss Fit Check Toggle */}
          <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Zero-Miss Exact Fit Enforcement
              </span>
              <p className="text-[11px] text-zinc-400">
                Hide any garment that does not fit your exact {userChest}" bust and {userWaist}" waist.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleUpdate('onlyStrictFit', !filters.onlyStrictFit)}
              className={`w-12 h-6 rounded-full transition relative p-0.5 shrink-0 ${
                filters.onlyStrictFit ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white block transition-transform ${
                  filters.onlyStrictFit ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Results Bar */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-bold text-white">{totalMatches} Pins Matched</span>
            <span className="text-zinc-500 ml-1.5 font-mono">({filteredOutCount} hidden)</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-rose-500/20 hover:opacity-95 transition"
          >
            Show {totalMatches} Results
          </button>
        </div>
      </div>
    </div>
  );
};
