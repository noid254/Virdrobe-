import React from 'react';
import { MagazineCover, UserFitProfile } from '../types/schema';
import {
  Sparkles,
  Heart,
  Share2,
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
    <div className="relative w-full max-w-[420px] mx-auto select-none group">
      {/* Magazine Cover Shell */}
      <div className="relative aspect-[3/4.2] w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl transition-all duration-300">
        {/* Background Image */}
        <img
          src={cover.coverImageUrl}
          alt={cover.headline}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 ease-out"
        />

        {/* Subtle Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50 pointer-events-none" />

        {/* Top Header: Clean Masthead (Uncluttered) */}
        <div className="absolute top-0 inset-x-0 p-5 pt-6 text-center z-10 pointer-events-none">
          <p className="text-[10px] font-mono tracking-[0.25em] text-zinc-300/80 uppercase">
            {cover.issueTag}
          </p>
          <h1
            onClick={() => onViewBoutique?.(cover.sellerId)}
            className="font-masthead text-2xl sm:text-3xl text-white font-black tracking-[0.2em] uppercase mt-1 drop-shadow cursor-pointer pointer-events-auto hover:text-rose-200 transition"
          >
            {cover.masthead}
          </h1>
        </div>

        {/* Floating Actions: Top Right Only */}
        <div className="absolute top-5 right-4 z-20 flex items-center gap-2">
          <button
            onClick={toggleLike}
            className={`w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition shadow-md ${
              liked
                ? 'bg-rose-500 border-rose-400 text-white'
                : 'bg-black/50 border-white/15 text-white hover:bg-black/80'
            }`}
            title="Like Cover"
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onShareAffiliate(cover);
            }}
            className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-amber-300 hover:bg-black/80 flex items-center justify-center transition shadow-md"
            title="10% Creator Affiliate QR"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center of card is intentionally KEPT CLEAR for the garment photo! */}

        {/* Lower Third: Streamlined Typography & Primary Action */}
        <div className="absolute bottom-0 inset-x-0 p-5 pt-10 z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
          <div className="space-y-1 mb-4">
            <h2 className="font-serif-editorial text-2xl text-white font-bold leading-tight drop-shadow">
              {cover.headline}
            </h2>
            <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
              <span className="font-bold text-white">${garment.price}</span>
              <span>•</span>
              <span className="text-zinc-200">{garment.brand}</span>
              <span>•</span>
              <span className="text-zinc-400">{garment.sellerLocation.city}</span>
            </div>
          </div>

          {/* Clean Action Button */}
          <button
            onClick={() => onTryOn(cover)}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-2 ${
              isTriedOn
                ? 'bg-emerald-600 text-white'
                : 'bg-white hover:bg-zinc-100 text-black'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>{isTriedOn ? 'Wearing on Twin (Tap to View)' : 'Try On Digital Twin'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
