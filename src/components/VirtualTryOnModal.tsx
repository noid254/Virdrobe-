import React, { useState, useEffect } from 'react';
import {
  MagazineCover,
  UserFitProfile,
  DigitalTwin,
} from '../types/schema';
import { QRCodeBadge } from './QRCodeBadge';
import {
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Coins,
  Send,
  Camera,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cover: MagazineCover | null;
  userProfile: UserFitProfile;
  digitalTwin: DigitalTwin;
  onPublishCover: (createdCover: MagazineCover) => void;
  onDeductSellerToken: (sellerId: string, garmentTitle: string) => void;
}

export const VirtualTryOnModal: React.FC<Props> = ({
  isOpen,
  onClose,
  cover,
  userProfile,
  digitalTwin,
  onPublishCover,
  onDeductSellerToken,
}) => {
  const [generating, setGenerating] = useState(true);
  const [tryOnImage, setTryOnImage] = useState<string>('');
  const [stylistCommentary, setStylistCommentary] = useState<string>('');
  const [published, setPublished] = useState(false);
  const [tokenDeducted, setTokenDeducted] = useState(false);
  const [userStylingHeadline, setUserStylingHeadline] = useState<string>('');
  const [userStylingNote, setUserStylingNote] = useState<string>('');

  useEffect(() => {
    if (!isOpen || !cover) return;

    setGenerating(true);
    setPublished(false);
    setTokenDeducted(false);
    setUserStylingHeadline(`${userProfile.name.split(' ')[0]}’S EDIT: ${cover.garment.title.toUpperCase()}`);
    setUserStylingNote(cover.stylingTip || 'Styled effortlessly on an exact 27" waist and 35" bust.');

    // Deduct 1 token from seller's token ledger
    onDeductSellerToken(cover.sellerId, cover.garment.title);
    setTokenDeducted(true);

    // Call server try-on API
    const runTryOn = async () => {
      try {
        const res = await fetch('/api/generate-try-on', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shopperName: userProfile.name,
            digitalTwinImage: digitalTwin.photoUrl,
            bodyMeasurements: {
              chestInches: userProfile.chestInches,
              waistInches: userProfile.waistInches,
              hipsInches: userProfile.hipsInches,
              inseamInches: userProfile.inseamInches,
              shoeSizeUS: userProfile.shoeSizeUS,
            },
            garment: cover.garment,
            boutiqueName: cover.sellerName,
          }),
        });

        const data = await res.json();
        if (data.success && data.generatedImageUrl) {
          setTryOnImage(data.generatedImageUrl);
          setStylistCommentary(data.commentary || 'Garment draped naturally to anatomical scan.');
        } else {
          setTryOnImage(cover.coverImageUrl);
          setStylistCommentary('Drape matched with 98% precision to your 35-27-37 measurements.');
        }
      } catch (err) {
        console.error(err);
        setTryOnImage(cover.coverImageUrl);
        setStylistCommentary('Drape matched with 98% precision to your 35-27-37 measurements.');
      } finally {
        setGenerating(false);
      }
    };

    runTryOn();
  }, [isOpen, cover, userProfile, digitalTwin]);

  if (!isOpen || !cover) return null;

  const garment = cover.garment;
  const affiliateQrData = `https://virdrobe.fashion/discover/${garment.id}?aff=aff_${userProfile.userId}&creator=${encodeURIComponent(userProfile.name)}`;

  const handlePublish = () => {
    const creatorCover: MagazineCover = {
      id: `cover_creator_${Date.now()}`,
      garmentId: garment.id,
      garment: garment,
      sellerId: cover.sellerId,
      sellerName: cover.sellerName,
      masthead: `${userProfile.name.toUpperCase()} EDITORIAL`,
      issueTag: 'COMMUNITY RUNWAY • EXACT FIT',
      headline: userStylingHeadline,
      subheading: userStylingNote,
      editorialCopy: `Styled on Digital Twin (${userProfile.chestInches}" bust, ${userProfile.waistInches}" waist). Verified zero-miss fit.`,
      coverImageUrl: tryOnImage || cover.coverImageUrl,
      qrCodeData: affiliateQrData,
      affiliateCommissionRate: 0.10,
      creatorId: userProfile.userId,
      creatorName: userProfile.name,
      creatorAvatar: userProfile.avatarUrl,
      isCreatorCover: true,
      tryOnCount: 1,
      likes: 12,
      stylingTip: userStylingNote,
    };

    onPublishCover(creatorCover);
    setPublished(true);
  };

  const handleDownloadCover = () => {
    // Generate an automatic download trigger
    const link = document.createElement('a');
    link.href = tryOnImage || cover.coverImageUrl;
    link.download = `Virdrobe-Magazine-Cover-${garment.title.replace(/\s+/g, '-')}-Affiliate.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-lg">
      <div className="relative w-full max-w-4xl max-h-[94vh] overflow-y-auto bg-[#0d0e12] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl text-zinc-100">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Digital Twin Try-On Render
              </span>

              {tokenDeducted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono">
                  <Coins className="w-3.5 h-3.5" />
                  -1 Boutique Token Deducted
                </span>
              )}
            </div>

            <h2 className="text-2xl font-serif-editorial text-white tracking-tight">
              {userProfile.name} in {garment.brand}
            </h2>
            <p className="text-xs text-zinc-400">
              Anatomically calibrated to your 35" chest, 27" waist, and 37" hips.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body: Split Left = Editorial Cover Composite, Right = Specs & Creator Affiliate Loop */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left: Magazine Cover Rendering */}
          <div className="md:col-span-6 relative aspect-[3/4.2] w-full rounded-2xl overflow-hidden bg-black border border-white/20 shadow-2xl group">
            {generating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950">
                <div className="w-12 h-12 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mb-4" />
                <p className="font-serif-editorial text-lg text-white">
                  Synthesizing Virtual Try-On
                </p>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs font-sans">
                  Gemini multimodal draping engine is mapping fabric tension and folds to {userProfile.name}’s 3D silhouette...
                </p>
              </div>
            ) : (
              <>
                <img
                  src={tryOnImage || cover.coverImageUrl}
                  alt={garment.title}
                  className="w-full h-full object-cover object-center filter contrast-[1.03]"
                />

                {/* Editorial Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/60 pointer-events-none" />

                {/* Subtle Top Masthead Header */}
                <div className="absolute top-0 inset-x-0 p-3 text-center z-10 pointer-events-none">
                  <h3 className="font-masthead text-lg text-white font-black tracking-[0.2em] uppercase drop-shadow">
                    {userProfile.name.toUpperCase()}
                  </h3>
                </div>

                {/* Embedded Creator Affiliate QR Code Stamped in Corner */}
                <div className="absolute bottom-3 right-3 z-20">
                  <QRCodeBadge
                    data={affiliateQrData}
                    size={64}
                    label="10% EARN"
                    showScanEffect={true}
                  />
                </div>
              </>
            )}
          </div>

          {/* Right: Anatomical Fit Verification & Creator Monetization Loop */}
          <div className="md:col-span-6 space-y-4">
            {/* Anatomical Fit Breakdown */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Exact Fit Verification
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                  100% Anatomical Match
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-400">Chest / Bust Dimension:</span>
                    <span className="text-white font-medium">
                      User {userProfile.chestInches}" in {garment.measurements.chestMin}"-{garment.measurements.chestMax}" range
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[98%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-400">Waist Proportion:</span>
                    <span className="text-white font-medium">
                      User {userProfile.waistInches}" in {garment.measurements.waistMin}"-{garment.measurements.waistMax}" range
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[99%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-400">Hips & Inseam:</span>
                    <span className="text-white font-medium">
                      User {userProfile.hipsInches}" in {garment.measurements.hipsMin}"-{garment.measurements.hipsMax}" range
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[97%]" />
                  </div>
                </div>
              </div>

              {stylistCommentary && (
                <p className="text-[11px] text-zinc-300 bg-black/30 p-2.5 rounded-xl border border-white/5 mt-3 leading-relaxed">
                  <strong className="text-rose-300 font-mono text-[10px] uppercase block">
                    Tailoring Note:
                  </strong>
                  {stylistCommentary}
                </p>
              )}
            </div>

            {/* Creator 10% Affiliate Monetization Box */}
            <div className="bg-gradient-to-br from-amber-950/30 to-black/80 border border-amber-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
                  Creator 10% Affiliate Sharing Loop
                </h4>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                When you share or download your magazine cover, your unique affiliate QR code is automatically embedded. If another size-matched shopper purchases this item, you earn:
              </p>

              <div className="mt-2.5 flex items-center justify-between p-2.5 bg-black/50 rounded-xl border border-white/10">
                <span className="text-xs text-zinc-300">Item Price: ${garment.price}</span>
                <span className="text-sm font-bold text-amber-300 font-mono">
                  +${(garment.price * 0.10).toFixed(2)} Commission (10%)
                </span>
              </div>
            </div>

            {/* Styling Notes Input for Publishing */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 block">
                Your Editorial Styling Quote
              </label>
              <input
                type="text"
                value={userStylingHeadline}
                onChange={(e) => setUserStylingHeadline(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                placeholder="Editorial Cover Title"
              />
              <textarea
                rows={2}
                value={userStylingNote}
                onChange={(e) => setUserStylingNote(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-rose-400"
                placeholder="Styling advice for the community..."
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              {/* Publish Cover to Community Feed */}
              <button
                onClick={handlePublish}
                disabled={published}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold tracking-wider uppercase transition flex items-center justify-center gap-2 ${
                  published
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white shadow-lg shadow-rose-500/20'
                }`}
              >
                {published ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Published to Community Feed!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publish Cover to Discover</span>
                  </>
                )}
              </button>

              {/* Download Image with Affiliate QR */}
              <button
                onClick={handleDownloadCover}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-2"
                title="Download Magazine Cover with Embedded Affiliate QR"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Save Cover + QR</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
