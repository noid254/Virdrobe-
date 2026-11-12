import React, { useState } from 'react';
import { Garment, DigitalTwin, UserFitProfile } from '../types/schema';
import {
  Sparkles,
  Tag,
  ArrowRightLeft,
  DollarSign,
  Plus,
  Shirt,
  CheckCircle2,
  Trash2,
  Share2,
  AlertCircle,
  HelpCircle,
  Layers,
  Sparkle,
} from 'lucide-react';

interface Props {
  closetGarments: Garment[];
  digitalTwin: DigitalTwin;
  userProfile: UserFitProfile;
  onUpdateOutfit: (newOutfit: DigitalTwin['activeOutfit']) => void;
  onMoveToResale: (garment: Garment) => void;
  onAddNewGarment: () => void;
}

export const MyVirdrobeCloset: React.FC<Props> = ({
  closetGarments,
  digitalTwin,
  userProfile,
  onUpdateOutfit,
  onMoveToResale,
  onAddNewGarment,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [resaleSuccessToast, setResaleSuccessToast] = useState<string | null>(null);

  // Active outfit state
  const activeOutfit = digitalTwin.activeOutfit;

  const filteredGarments = closetGarments.filter((g) => {
    if (selectedCategory === 'all') return true;
    return g.category === selectedCategory;
  });

  const isGarmentActiveOnTwin = (garment: Garment) => {
    return (
      activeOutfit.topId === garment.id ||
      activeOutfit.bottomId === garment.id ||
      activeOutfit.outerwearId === garment.id ||
      activeOutfit.shoesId === garment.id ||
      activeOutfit.dressId === garment.id
    );
  };

  const handleToggleGarmentOnTwin = (garment: Garment) => {
    const nextOutfit = { ...activeOutfit };
    const isActive = isGarmentActiveOnTwin(garment);

    if (garment.category === 'tops') {
      nextOutfit.topId = isActive ? undefined : garment.id;
      if (!isActive) nextOutfit.dressId = undefined; // replace dress
    } else if (garment.category === 'bottoms') {
      nextOutfit.bottomId = isActive ? undefined : garment.id;
      if (!isActive) nextOutfit.dressId = undefined;
    } else if (garment.category === 'outerwear') {
      nextOutfit.outerwearId = isActive ? undefined : garment.id;
    } else if (garment.category === 'shoes') {
      nextOutfit.shoesId = isActive ? undefined : garment.id;
    } else if (garment.category === 'dresses') {
      if (isActive) {
        nextOutfit.dressId = undefined;
      } else {
        nextOutfit.dressId = garment.id;
        nextOutfit.topId = undefined;
        nextOutfit.bottomId = undefined;
      }
    }

    onUpdateOutfit(nextOutfit);
  };

  const handleResaleClick = (garment: Garment) => {
    onMoveToResale(garment);
  };

  // Find active items for display
  const activeItems = closetGarments.filter((g) => isGarmentActiveOnTwin(g));
  const totalClosetValue = closetGarments.reduce((acc, g) => acc + g.price, 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Toast Notification */}
      {resaleSuccessToast && (
        <div className="fixed top-16 inset-x-3 sm:inset-x-auto sm:right-6 z-50 bg-emerald-900/90 border border-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{resaleSuccessToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Twin Wardrobe Rack</span>
          </div>
          <h2 className="text-2xl font-serif-editorial text-white tracking-tight">
            My Virdrobe Studio
          </h2>
          <p className="text-xs text-zinc-400">
            Interactive wardrobe rack standing beside your Digital Twin. Tap items to mix and match live outfits or trigger resale for outgrown pieces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
              Closet Net Value
            </span>
            <span className="text-lg font-bold font-serif-editorial text-white">
              ${totalClosetValue.toLocaleString()}
            </span>
          </div>

          <button
            onClick={onAddNewGarment}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-semibold tracking-wide shadow-lg shadow-rose-500/20 hover:opacity-95 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item via AI Scan</span>
          </button>
        </div>
      </div>

      {/* Split Screen Layout: Left = Digital Twin Mannequin / Avatar, Right = Luxury Closet Rack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Digital Twin Standing View (4 cols on large screen) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/15 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
          {/* Subtle Studio Spotlight Glow */}
          <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-rose-500/10 via-amber-500/5 to-transparent pointer-events-none" />

          {/* Mannequin / Twin Photo Container */}
          <div className="relative aspect-[3/4.5] w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-inner group">
            <img
              src={digitalTwin.photoUrl}
              alt={userProfile.name}
              className="w-full h-full object-cover object-top filter brightness-95 contrast-105"
            />

            {/* Live Stylist Indicator */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[10px] text-zinc-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono uppercase tracking-wider">{userProfile.name}’s Twin</span>
            </div>

            {/* Proportion Badge */}
            <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[10px] font-mono text-rose-300">
              {userProfile.chestInches}"B • {userProfile.waistInches}"W • {userProfile.hipsInches}"H
            </div>

            {/* Interactive Outfit Overlays: Floating active item pills */}
            <div className="absolute bottom-4 inset-x-4 z-10 space-y-1.5">
              <div className="bg-black/80 backdrop-blur-md border border-white/15 rounded-xl p-3 shadow-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-rose-400" />
                    Current Ensemble ({activeItems.length} Pieces)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {userProfile.fitPreference.toUpperCase()} FIT
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activeItems.length === 0 ? (
                    <span className="text-xs text-zinc-500 italic">
                      Tap any garments on the rack to dress your twin
                    </span>
                  ) : (
                    activeItems.map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-[11px] text-zinc-200"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <strong className="text-white">{item.brand}:</strong> {item.title}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Fit Summary */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl">
              <span className="text-[10px] text-zinc-400 font-mono uppercase block">Body Shape</span>
              <span className="font-semibold text-white capitalize">{digitalTwin.bodyType}</span>
            </div>
            <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl">
              <span className="text-[10px] text-zinc-400 font-mono uppercase block">Total Items</span>
              <span className="font-semibold text-white">{closetGarments.length}</span>
            </div>
            <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl">
              <span className="text-[10px] text-zinc-400 font-mono uppercase block">Thrift Ready</span>
              <span className="font-semibold text-rose-300">
                {closetGarments.filter((g) => g.resaleStatus === 'listed').length} listed
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: The Wardrobe Rack (7 cols on large screen) */}
        <div className="lg:col-span-7 bg-zinc-950/70 border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
          {/* Metallic Closet Rail Visual Top */}
          <div className="relative mb-5 pt-3">
            <div className="h-2 w-full bg-gradient-to-r from-zinc-700 via-zinc-400 to-zinc-700 rounded-full shadow-[0_2px_8px_rgba(255,255,255,0.2)]" />
            <div className="flex justify-between px-6 -mt-1 text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
              <span>◄ LUXURY RAIL</span>
              <span>ORGANIC COTTON & VIRGIN SILK ►</span>
            </div>
          </div>

          {/* Closet Category Filter Pills */}
          <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Rail' },
              { id: 'tops', label: 'Tops' },
              { id: 'bottoms', label: 'Bottoms' },
              { id: 'outerwear', label: 'Outerwear' },
              { id: 'dresses', label: 'Dresses' },
              { id: 'shoes', label: 'Shoes' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedCategory === cat.id
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Garment Cards Grid on the Virtual Rack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredGarments.map((garment) => {
              const isActive = isGarmentActiveOnTwin(garment);
              const isListed = garment.resaleStatus === 'listed';

              return (
                <div
                  key={garment.id}
                  className={`relative rounded-2xl overflow-hidden border transition-all duration-200 p-3.5 flex flex-col justify-between ${
                    isActive
                      ? 'bg-gradient-to-b from-rose-950/30 to-black/80 border-rose-500/50 ring-1 ring-rose-500/40 shadow-lg'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 border-white/10'
                  }`}
                >
                  {/* Top Thumbnail & Status */}
                  <div className="flex gap-3">
                    <div
                      onClick={() => handleToggleGarmentOnTwin(garment)}
                      className="relative w-20 h-24 rounded-xl overflow-hidden bg-zinc-950 shrink-0 cursor-pointer group/thumb border border-white/10"
                    >
                      <img
                        src={garment.imageUrl}
                        alt={garment.title}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition duration-300"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-white drop-shadow" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold truncate">
                          {garment.brand}
                        </span>
                        {isListed ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            LISTED FOR RESALE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-400">
                            {garment.measurements.labelSize}
                          </span>
                        )}
                      </div>

                      <h4
                        onClick={() => handleToggleGarmentOnTwin(garment)}
                        className="text-xs font-semibold text-white truncate cursor-pointer hover:text-rose-200 mt-0.5"
                      >
                        {garment.title}
                      </h4>

                      <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                        {garment.fabric}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold text-white">
                          ${garment.price}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          (Orig ${garment.originalRetailPrice})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Triggers */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    {/* Wear on Twin Toggle */}
                    <button
                      onClick={() => handleToggleGarmentOnTwin(garment)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                        isActive
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-zinc-200'
                      }`}
                    >
                      <Shirt className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Dressed on Twin' : 'Wear on Twin'}</span>
                    </button>

                    {/* "No Longer Fits" Resale Trigger */}
                    <button
                      onClick={() => handleResaleClick(garment)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-medium transition flex items-center gap-1 shrink-0"
                      title="Move outgrown item to your resale storefront"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>No Longer Fits?</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
