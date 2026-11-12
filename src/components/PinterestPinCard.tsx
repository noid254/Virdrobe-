import React, { useState } from 'react';
import { MagazineCover, UserFitProfile } from '../types/schema';
import {
  Sparkles,
  Heart,
  Share2,
  Bookmark,
  Check,
} from 'lucide-react';

interface Props {
  cover: MagazineCover;
  userProfile: UserFitProfile;
  onTryOn: (cover: MagazineCover) => void;
  onShareAffiliate: (cover: MagazineCover) => void;
  onOpenDetail: (cover: MagazineCover) => void;
  isTriedOn?: boolean;
}

export const PinterestPinCard: React.FC<Props> = ({
  cover,
  userProfile,
  onTryOn,
  onShareAffiliate,
  onOpenDetail,
  isTriedOn = false,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(cover.likes);

  const garment = cover.garment;

  // Stagger aspect ratios for organic Pinterest masonry texture
  const getAspectRatioClass = () => {
    const idNum = parseInt(cover.id.replace(/\D/g, '') || '1', 10);
    if (cover.isCreatorCover) return 'aspect-[3/4.5]';
    if (idNum % 3 === 0) return 'aspect-[3/4.3]';
    if (idNum % 3 === 1) return 'aspect-[3/3.9]';
    return 'aspect-[3/4.1]';
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <div
      onClick={() => onOpenDetail(cover)}
      className="break-inside-avoid mb-4 group relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/5 hover:border-white/20 transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer"
    >
      {/* 1. Pristine Hero Image (NO cluttered text overlays on resting state!) */}
      <div className={`relative w-full ${getAspectRatioClass()} overflow-hidden bg-zinc-900`}>
        <img
          src={cover.coverImageUrl}
          alt={cover.headline}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500 ease-out"
        />

        {/* Minimal Hover Controls (Only visible on hover/touch) */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 flex flex-col justify-between p-3 pointer-events-none">
          {/* Top Row: Save Icon & Red "Try On" Button */}
          <div className="flex items-center justify-between pointer-events-auto">
            <button
              onClick={handleSave}
              className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition shadow-md ${
                isSaved
                  ? 'bg-amber-400 text-black'
                  : 'bg-black/60 text-white hover:bg-black/90'
              }`}
              title="Save Pin"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onTryOn(cover);
              }}
              className={`px-3.5 py-1.5 rounded-full font-semibold text-xs tracking-wider transition-transform hover:scale-105 shadow-lg flex items-center gap-1.5 ${
                isTriedOn
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{isTriedOn ? 'Wearing' : 'Try On'}</span>
            </button>
          </div>

          {/* Bottom Row: Quick Share */}
          <div className="flex items-center justify-end pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShareAffiliate(cover);
              }}
              className="w-8 h-8 rounded-full bg-black/70 hover:bg-black text-amber-300 flex items-center justify-center shadow-md transition"
              title="10% Creator Affiliate Link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Clean, Minimal Metadata Below the Image */}
      <div className="p-3 space-y-1">
        {/* Title and Price */}
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-xs font-semibold text-white tracking-tight truncate group-hover:text-rose-200 transition">
            {garment.title}
          </h3>
          <span className="text-xs font-bold font-mono text-zinc-100 shrink-0">
            ${garment.price}
          </span>
        </div>

        {/* Brand and Boutique Origin */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span className="truncate">
            <strong className="text-zinc-300 font-medium">{garment.brand}</strong> • {cover.sellerName}
          </span>

          <button
            onClick={handleLike}
            className={`flex items-center gap-1 shrink-0 transition ${
              isLiked ? 'text-rose-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-[10px]">{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
