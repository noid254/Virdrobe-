import React, { useState } from 'react';
import { MagazineCover, Garment } from '../types/schema';
import { QRCodeBadge } from './QRCodeBadge';
import {
  Coins,
  DollarSign,
  PlusCircle,
  Sparkles,
  TrendingUp,
  Tag,
  Share2,
  UploadCloud,
  CheckCircle2,
  Clock,
  Layers,
  ShoppingBag,
  Store,
  Download,
} from 'lucide-react';

interface Props {
  sellerId: string;
  defaultBoutiqueName: string;
  commissionRate: number;
  onPublishNewSellerCover: (cover: MagazineCover) => void | Promise<void>;
}

export const CoverGenerator: React.FC<Props> = ({
  sellerId,
  defaultBoutiqueName,
  commissionRate,
  onPublishNewSellerCover,
}) => {
  // Generator form state
  const [boutiqueName, setBoutiqueName] = useState(defaultBoutiqueName);
  const [garmentTitle, setGarmentTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<'tops' | 'bottoms' | 'outerwear' | 'shoes' | 'dresses'>('tops');
  const [price, setPrice] = useState(0);
  const [retailPrice, setRetailPrice] = useState(0);
  const [chestMin, setChestMin] = useState(34);
  const [chestMax, setChestMax] = useState(36.5);
  const [waistMin, setWaistMin] = useState(26);
  const [waistMax, setWaistMax] = useState(28);
  const [hipsMin, setHipsMin] = useState(36);
  const [hipsMax, setHipsMax] = useState(38.5);
  const [labelSize, setLabelSize] = useState('US 4 / FR 36');
  const [garmentImage, setGarmentImage] = useState('');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [formError, setFormError] = useState('');
  const [generatedPreviewCover, setGeneratedPreviewCover] = useState<MagazineCover | null>(null);

  const handleGenerateCover = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!garmentTitle.trim() || !/^https?:\/\//i.test(garmentImage.trim()) || !(price > 0)) {
      setFormError('Add a title, a photo link (https://...) and a price above zero.');
      return;
    }
    setIsGeneratingCover(true);

    try {
      // Call Gemini Cover Copy endpoint
      const res = await fetch('/api/generate-cover-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boutiqueName,
          garment: {
            title: garmentTitle,
            brand,
            category,
            color: 'Charcoal Black',
            fabric: 'Double-woven virgin wool',
          },
        }),
      });

      const copyData = await res.json();
      const editorial = copyData.data || {
        masthead: boutiqueName.toUpperCase(),
        issueTag: 'CURATED LOOKBOOK • N° 52',
        headline: 'THE SCULPTURAL JACKET',
        subheading: 'Tailored for anatomical drape and clean proportion.',
        editorialCopy: 'Exclusively available at Atelier Soho. Ready for exact-fit discovery.',
        stylingTip: 'Pairs with tailored trousers in My Virdrobe.',
      };

      const newGarmentId = `g_seller_${Date.now()}`;
      const newGarment: Garment = {
        id: newGarmentId,
        sellerId: sellerId,
        sellerName: boutiqueName,
        sellerBoutiqueType: 'vintage_curator',
        sellerLocation: { city: 'SoHo, Manhattan', distanceMiles: 2.4 },
        title: garmentTitle,
        brand,
        category,
        color: 'Charcoal Black',
        fabric: 'Double-woven virgin wool',
        condition: 'mint',
        price,
        originalRetailPrice: retailPrice,
        measurements: {
          chestMin,
          chestMax,
          waistMin,
          waistMax,
          hipsMin,
          hipsMax,
          labelSize,
        },
        fitType: 'tailored',
        imageUrl: garmentImage,
        inStock: true,
        tags: ['designer', 'exact-fit', 'editorial'],
        createdAt: new Date().toISOString(),
      };

      const newCover: MagazineCover = {
        id: `cover_seller_${Date.now()}`,
        garmentId: newGarmentId,
        garment: newGarment,
        sellerId: sellerId,
        sellerName: boutiqueName,
        masthead: editorial.masthead || boutiqueName.toUpperCase(),
        issueTag: editorial.issueTag || 'AUTUMN EDITION • NOIR',
        headline: editorial.headline || 'ARCHIVAL TAILORING',
        subheading: editorial.subheading || 'Precisely measured for zero-miss try-on.',
        editorialCopy: editorial.editorialCopy,
        coverImageUrl: garmentImage,
        qrCodeData: '',
        affiliateCommissionRate: commissionRate,
        tryOnCount: 0,
        likes: 0,
        stylingTip: editorial.stylingTip,
      };

      setGeneratedPreviewCover(newCover);
    } catch (err) {
      console.error(err);
      setFormError('Could not generate the cover. Please try again.');
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleConfirmPublishCover = async () => {
    if (!generatedPreviewCover) return;
    await onPublishNewSellerCover(generatedPreviewCover);
    setGeneratedPreviewCover(null);
  };

  return (
    <div className="w-full">
      {/* TAB 3: BOUTIQUE MAGAZINE COVER GENERATOR */}
      {(
        <div className="bg-zinc-950/70 border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif-editorial text-white">
                Boutique Editorial Magazine Cover Generator
              </h3>
              <p className="text-xs text-zinc-400">
                Upload raw garment details and exact anatomical dimensions. Gemini AI generates an Editorial Masthead, issue headline, styling advice, and stamps a unique product QR code.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerateCover} className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Inputs */}
            <div className="md:col-span-7 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    Boutique / Masthead Name
                  </label>
                  <input
                    type="text"
                    value={boutiqueName}
                    onChange={(e) => setBoutiqueName(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase font-bold tracking-wider"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    Designer Brand
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                  Garment Title
                </label>
                <input
                  type="text"
                  value={garmentTitle}
                  onChange={(e) => setGarmentTitle(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="tops">Tops</option>
                    <option value="bottoms">Bottoms</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="dresses">Dresses</option>
                    <option value="shoes">Shoes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    Retail ($)
                  </label>
                  <input
                    type="number"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-400"
                  />
                </div>
              </div>

              {/* Exact Measurements Section */}
              <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/10 space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-rose-300 font-bold block">
                  Exact Anatomical Measurement Fit Bounds
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block">
                      Chest Min / Max (in)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={chestMin}
                        onChange={(e) => setChestMin(Number(e.target.value))}
                        className="w-1/2 bg-black/60 border border-white/10 rounded-lg p-1.5 text-center text-white"
                      />
                      <input
                        type="number"
                        step="0.5"
                        value={chestMax}
                        onChange={(e) => setChestMax(Number(e.target.value))}
                        className="w-1/2 bg-black/60 border border-white/10 rounded-lg p-1.5 text-center text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block">
                      Waist Min / Max (in)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={waistMin}
                        onChange={(e) => setWaistMin(Number(e.target.value))}
                        className="w-1/2 bg-black/60 border border-white/10 rounded-lg p-1.5 text-center text-white"
                      />
                      <input
                        type="number"
                        step="0.5"
                        value={waistMax}
                        onChange={(e) => setWaistMax(Number(e.target.value))}
                        className="w-1/2 bg-black/60 border border-white/10 rounded-lg p-1.5 text-center text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block">
                    Garment Label Size
                  </label>
                  <input
                    type="text"
                    value={labelSize}
                    onChange={(e) => setLabelSize(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white"
                    placeholder="e.g. US 4 / FR 36"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                  Garment Editorial Image URL
                </label>
                <input
                  type="text"
                  value={garmentImage}
                  onChange={(e) => setGarmentImage(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              {formError && (
                <p role="alert" className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2 mb-3">
                  {formError}
                </p>
              )}
              <button
                type="submit"
                disabled={isGeneratingCover}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-rose-500 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingCover ? 'Generating Editorial Cover...' : 'Generate Magazine Cover with Gemini'}</span>
              </button>
            </div>

            {/* Right Preview */}
            <div className="md:col-span-5 flex flex-col items-center">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                Live Magazine Cover Preview
              </span>

              <div className="relative aspect-[3/4.2] w-full max-w-[280px] rounded-2xl overflow-hidden bg-black border border-white/20 shadow-2xl">
                <img
                  src={garmentImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />

                <div className="absolute top-0 inset-x-0 p-3 text-center z-10 pointer-events-none">
                  <span className="text-[8px] font-mono tracking-widest text-zinc-400 uppercase block border-b border-white/20 pb-0.5">
                    {generatedPreviewCover?.issueTag || 'AUTUMN EDITION • NOIR'}
                  </span>
                  <h4 className="font-masthead text-xl text-white font-black tracking-widest uppercase mt-0.5">
                    {generatedPreviewCover?.masthead || boutiqueName.toUpperCase()}
                  </h4>
                </div>

                <div className="absolute bottom-16 left-3 right-16 z-10 pointer-events-none">
                  <h5 className="font-serif-editorial text-base font-bold text-white leading-tight drop-shadow">
                    {generatedPreviewCover?.headline || garmentTitle}
                  </h5>
                  <p className="text-[10px] text-zinc-300 line-clamp-1 mt-0.5">
                    {brand} • ${price}
                  </p>
                </div>

                <div className="absolute bottom-2 right-2 z-20">
                  <QRCodeBadge
                    data={`https://virdrobe.fashion/discover/preview`}
                    size={48}
                    label="QR CODE"
                  />
                </div>
              </div>

              {generatedPreviewCover && (
                <div className="mt-4 w-full max-w-[280px]">
                  <button
                    type="button"
                    onClick={handleConfirmPublishCover}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish to Discover Feed</span>
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
