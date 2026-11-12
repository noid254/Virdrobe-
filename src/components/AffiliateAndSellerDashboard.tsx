import React, { useState } from 'react';
import {
  SellerTokenLedger,
  AffiliateOrder,
  MagazineCover,
  UserFitProfile,
  Garment,
} from '../types/schema';
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
  sellerLedger: SellerTokenLedger;
  affiliateOrders: AffiliateOrder[];
  publishedCovers: MagazineCover[];
  userProfile: UserFitProfile;
  onTopUpTokens: (amount: number) => void;
  onPublishNewSellerCover: (cover: MagazineCover) => void;
}

export const AffiliateAndSellerDashboard: React.FC<Props> = ({
  sellerLedger,
  affiliateOrders,
  publishedCovers,
  userProfile,
  onTopUpTokens,
  onPublishNewSellerCover,
}) => {
  const [activeTab, setActiveTab] = useState<'seller_tokens' | 'creator_affiliate' | 'cover_generator'>('seller_tokens');

  // Generator form state
  const [boutiqueName, setBoutiqueName] = useState('ATELIER SOHO');
  const [garmentTitle, setGarmentTitle] = useState('Archival Double-Breasted Wool Blazer');
  const [brand, setBrand] = useState('The Row');
  const [category, setCategory] = useState<'tops' | 'bottoms' | 'outerwear' | 'shoes' | 'dresses'>('tops');
  const [price, setPrice] = useState(380);
  const [retailPrice, setRetailPrice] = useState(950);
  const [chestMin, setChestMin] = useState(34);
  const [chestMax, setChestMax] = useState(36.5);
  const [waistMin, setWaistMin] = useState(26);
  const [waistMax, setWaistMax] = useState(28);
  const [hipsMin, setHipsMin] = useState(36);
  const [hipsMax, setHipsMax] = useState(38.5);
  const [labelSize, setLabelSize] = useState('US 4 / FR 36');
  const [garmentImage, setGarmentImage] = useState('https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=85');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [generatedPreviewCover, setGeneratedPreviewCover] = useState<MagazineCover | null>(null);

  // Totals
  const totalCommissionEarned = affiliateOrders.reduce((sum, ord) => sum + ord.commissionEarned, 0);

  const handleGenerateCover = async (e: React.FormEvent) => {
    e.preventDefault();
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
        sellerId: sellerLedger.sellerId,
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
        sellerId: sellerLedger.sellerId,
        sellerName: boutiqueName,
        masthead: editorial.masthead || boutiqueName.toUpperCase(),
        issueTag: editorial.issueTag || 'AUTUMN EDITION • NOIR',
        headline: editorial.headline || 'ARCHIVAL TAILORING',
        subheading: editorial.subheading || 'Precisely measured for zero-miss try-on.',
        editorialCopy: editorial.editorialCopy,
        coverImageUrl: garmentImage,
        qrCodeData: `https://virdrobe.fashion/discover/${newGarmentId}?aff=seller_qr`,
        affiliateCommissionRate: 0.10,
        tryOnCount: 0,
        likes: 0,
        stylingTip: editorial.stylingTip,
      };

      setGeneratedPreviewCover(newCover);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleConfirmPublishCover = () => {
    if (!generatedPreviewCover) return;
    onPublishNewSellerCover(generatedPreviewCover);
    setGeneratedPreviewCover(null);
    setActiveTab('seller_tokens');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium mb-1.5">
            <Coins className="w-3.5 h-3.5" />
            <span>Seller Studio & Affiliate Commerce Engine</span>
          </div>
          <h2 className="text-2xl font-serif-editorial text-white tracking-tight">
            Creator 10% Affiliate & Seller Token Economy
          </h2>
          <p className="text-xs text-zinc-400">
            Monetization infrastructure: Boutiques pay tokens for exact-match virtual try-ons; creators earn 10% commission on every shared magazine cover.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('seller_tokens')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'seller_tokens'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Seller Token Ledger</span>
          </button>
          <button
            onClick={() => setActiveTab('creator_affiliate')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'creator_affiliate'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Creator 10% Affiliate Hub</span>
          </button>
          <button
            onClick={() => setActiveTab('cover_generator')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'cover_generator'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Cover Generator</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SELLER TOKEN ECONOMY */}
      {activeTab === 'seller_tokens' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-amber-950/40 to-black/80 border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-300">
                  Try-On Token Balance
                </span>
                <Coins className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-serif-editorial text-white">
                  {sellerLedger.balance}
                </span>
                <span className="text-xs text-amber-300 font-mono">Tokens Left</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">
                Deducts 1 token each time an exact size-matched shopper tries on your garment.
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                <button
                  onClick={() => onTopUpTokens(50)}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Refill +50 Tokens ($7.50)</span>
                </button>
              </div>
            </div>

            {/* Total Try-Ons Served */}
            <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                  Exact-Fit Try-Ons Served
                </span>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-serif-editorial text-white">
                  {sellerLedger.totalTryOnsServed}
                </span>
                <span className="text-xs text-emerald-400 font-mono">Digital Fits</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">
                Size-matched conversion rate: <strong className="text-white">38.4%</strong> (vs 2.1% standard e-commerce).
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                <span>Unit Cost:</span>
                <span className="font-mono text-zinc-200">${sellerLedger.costPerTryOnUsd.toFixed(2)} / try-on</span>
              </div>
            </div>

            {/* Boutique Profile */}
            <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                  Boutique Studio
                </span>
                <Store className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-white font-masthead tracking-wider">
                {sellerLedger.sellerName}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1">
                Historic Cast Iron District, SoHo NY • Verified Curator
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('cover_generator')}
                  className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>Generate Boutique Cover</span>
                </button>
              </div>
            </div>
          </div>

          {/* Token Deduction & Ledger History */}
          <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-300 font-bold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Try-On Token Deduction Ledger (Live Real-Time Activity)
            </h3>

            <div className="space-y-2">
              {sellerLedger.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold ${
                        tx.amount < 0
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                    </span>
                    <div>
                      <p className="text-white font-medium">{tx.description}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        {new Date(tx.timestamp).toLocaleString()} {tx.shopperId ? `• Shopper: ${tx.shopperId}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-zinc-300 font-semibold">
                    {tx.type === 'try_on_deduction' ? '1 Token' : `${tx.amount} Tokens`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREATOR 10% AFFILIATE HUB */}
      {activeTab === 'creator_affiliate' && (
        <div className="space-y-6">
          {/* Affiliate Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-rose-950/40 to-black/80 border border-rose-500/30 rounded-2xl p-5 shadow-xl">
              <span className="text-xs font-mono uppercase tracking-widest text-rose-300 block mb-1">
                Total Affiliate Earnings
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-serif-editorial text-white">
                  ${totalCommissionEarned.toFixed(2)}
                </span>
                <span className="text-xs text-emerald-400 font-mono">10% Rate</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">
                Earned directly from shoppers ordering through your shared magazine covers & affiliate QR codes.
              </p>
            </div>

            <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-5 shadow-xl">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                Affiliate Orders Attributed
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-serif-editorial text-white">
                  {affiliateOrders.length}
                </span>
                <span className="text-xs text-zinc-400 font-mono">Orders</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">
                Shoppers within exact anatomical matching brackets. Zero returns recorded.
              </p>
            </div>

            <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-5 shadow-xl">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                Your Published Covers
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-serif-editorial text-white">
                  {publishedCovers.length}
                </span>
                <span className="text-xs text-zinc-400 font-mono">In Community Feed</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">
                Every published cover features your Digital Twin and your personal scannable QR badge.
              </p>
            </div>
          </div>

          {/* Orders Attributed Table */}
          <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-300 font-bold mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-rose-400" />
              Affiliate Orders & 10% Commission Payouts
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 font-mono uppercase text-[10px]">
                    <th className="pb-3">Garment Title</th>
                    <th className="pb-3">Order Total</th>
                    <th className="pb-3">Commission (10%)</th>
                    <th className="pb-3">Shopper City</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {affiliateOrders.map((ord) => (
                    <tr key={ord.id} className="text-zinc-200">
                      <td className="py-3 font-semibold text-white">{ord.garmentTitle}</td>
                      <td className="py-3 font-mono">${ord.orderTotal.toFixed(2)}</td>
                      <td className="py-3 font-mono text-emerald-400 font-bold">
                        +${ord.commissionEarned.toFixed(2)}
                      </td>
                      <td className="py-3 text-zinc-400">{ord.shopperCity}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-zinc-400 font-mono text-[11px]">
                        {new Date(ord.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lookbook of Published Covers */}
          {publishedCovers.length > 0 && (
            <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-300 font-bold mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Your Live Published Magazine Covers ({publishedCovers.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {publishedCovers.map((cov) => (
                  <div
                    key={cov.id}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black border border-white/15 group shadow-lg"
                  >
                    <img
                      src={cov.coverImageUrl}
                      alt={cov.headline}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-3 flex flex-col justify-end">
                      <span className="text-[10px] font-mono text-rose-300 uppercase">
                        {cov.masthead}
                      </span>
                      <h5 className="font-serif-editorial text-xs font-bold text-white truncate">
                        {cov.headline}
                      </h5>
                      <span className="text-[10px] text-zinc-400">
                        ${cov.garment.price} • 10% Affiliate Embedded
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BOUTIQUE MAGAZINE COVER GENERATOR */}
      {activeTab === 'cover_generator' && (
        <div className="bg-zinc-950/70 border border-white/10 rounded-3xl p-6 shadow-2xl">
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
