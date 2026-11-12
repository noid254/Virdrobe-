import React, { useState } from 'react';
import {
  UserFitProfile,
  DigitalTwin,
  Garment,
  MagazineCover,
  SellerTokenLedger,
  AffiliateOrder,
} from './types/schema';
import {
  initialUserProfile,
  initialDigitalTwin,
  initialClosetGarments,
  initialMagazineCovers,
  initialSellerTokenLedger,
  initialAffiliateOrders,
} from './data/mockDatabase';
import { Navbar } from './components/Navbar';
import { SwipeableDiscoverFeed } from './components/SwipeableDiscoverFeed';
import { MyVirdrobeCloset } from './components/MyVirdrobeCloset';
import { AffiliateAndSellerDashboard } from './components/AffiliateAndSellerDashboard';
import { DigitalTwinOnboardingModal } from './components/DigitalTwinOnboardingModal';
import { VirtualTryOnModal } from './components/VirtualTryOnModal';
import { NoLongerFitsModal } from './components/NoLongerFitsModal';
import { AddGarmentModal } from './components/AddGarmentModal';
import { QRCodeBadge } from './components/QRCodeBadge';
import {
  CheckCircle2,
  Copy,
  Download,
  Share2,
  Sparkles,
  Tag,
  Coins,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  // Core Application State
  const [activeTab, setActiveTab] = useState<'discover' | 'closet' | 'seller_affiliate'>('discover');
  const [userProfile, setUserProfile] = useState<UserFitProfile>(initialUserProfile);
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwin>(initialDigitalTwin);
  const [closetGarments, setClosetGarments] = useState<Garment[]>(initialClosetGarments);
  const [magazineCovers, setMagazineCovers] = useState<MagazineCover[]>(initialMagazineCovers);
  const [sellerLedger, setSellerLedger] = useState<SellerTokenLedger>(initialSellerTokenLedger);
  const [affiliateOrders, setAffiliateOrders] = useState<AffiliateOrder[]>(initialAffiliateOrders);
  const [triedOnGarmentIds, setTriedOnGarmentIds] = useState<string[]>([]);

  // Modals
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [selectedTryOnCover, setSelectedTryOnCover] = useState<MagazineCover | null>(null);
  const [selectedResaleGarment, setSelectedResaleGarment] = useState<Garment | null>(null);
  const [isAddGarmentOpen, setIsAddGarmentOpen] = useState(false);
  const [affiliateShareCover, setAffiliateShareCover] = useState<MagazineCover | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handlers
  const handleSaveProfile = (updatedProfile: UserFitProfile, updatedTwin: DigitalTwin) => {
    setUserProfile(updatedProfile);
    setDigitalTwin(updatedTwin);
    showToast(`Digital Twin updated: Exact fit calibrated to ${updatedProfile.chestInches}"-${updatedProfile.waistInches}"-${updatedProfile.hipsInches}"!`);
  };

  const handleTryOnCover = (cover: MagazineCover) => {
    setSelectedTryOnCover(cover);
    if (!triedOnGarmentIds.includes(cover.garmentId)) {
      setTriedOnGarmentIds((prev) => [...prev, cover.garmentId]);
    }
  };

  const handleDeductSellerToken = (sellerId: string, garmentTitle: string) => {
    setSellerLedger((prev) => {
      const newBalance = Math.max(0, prev.balance - 1);
      const newTx = {
        id: `tx_${Date.now()}`,
        type: 'try_on_deduction' as const,
        amount: -1,
        description: `Shopper Digital Twin Try-On: ${garmentTitle}`,
        timestamp: new Date().toISOString(),
        shopperId: userProfile.userId,
        garmentTitle,
      };
      return {
        ...prev,
        balance: newBalance,
        totalTryOnsServed: prev.totalTryOnsServed + 1,
        transactions: [newTx, ...prev.transactions],
      };
    });
  };

  const handleTopUpTokens = (amount: number) => {
    setSellerLedger((prev) => ({
      ...prev,
      balance: prev.balance + amount,
      transactions: [
        {
          id: `tx_${Date.now()}`,
          type: 'pack_purchase',
          amount,
          description: `Token Pack Refill (+${amount} Try-On Credits)`,
          timestamp: new Date().toISOString(),
        },
        ...prev.transactions,
      ],
    }));
    showToast(`Added +${amount} Try-On Tokens to ${sellerLedger.sellerName} balance!`);
  };

  const handlePublishCover = (createdCover: MagazineCover) => {
    // Add to Discover Feed at the top
    setMagazineCovers((prev) => [createdCover, ...prev]);
    showToast(`Published ${createdCover.headline} to Discover Feed with your 10% affiliate QR!`);
  };

  const handleMoveToResale = (garment: Garment) => {
    setSelectedResaleGarment(garment);
  };

  const handleConfirmListResale = (garmentId: string, resalePrice: number, resaleDescription: string) => {
    // Update garment in closet as listed
    setClosetGarments((prev) =>
      prev.map((g) => {
        if (g.id === garmentId) {
          return {
            ...g,
            resaleStatus: 'listed',
            resalePrice,
            resaleDescription,
          };
        }
        return g;
      })
    );

    // Create a new Magazine Cover in discover feed for this user-thrifted piece!
    const targetGarment = closetGarments.find((g) => g.id === garmentId);
    if (targetGarment) {
      const userResaleCover: MagazineCover = {
        id: `cover_resale_${Date.now()}`,
        garmentId: targetGarment.id,
        garment: {
          ...targetGarment,
          price: resalePrice,
          inStock: true,
        },
        sellerId: userProfile.userId,
        sellerName: `${userProfile.name.toUpperCase()} THRIFT ARCHIVE`,
        masthead: `${userProfile.name.split(' ')[0].toUpperCase()} ARCHIVE`,
        issueTag: 'CIRCULAR THRIFT • N° 01',
        headline: `PRE-LOVED ${targetGarment.brand.toUpperCase()}`,
        subheading: resaleDescription,
        editorialCopy: `Outgrown by ${userProfile.name} (now ${userProfile.waistInches}" waist). Verified condition in ${targetGarment.fabric}.`,
        coverImageUrl: targetGarment.imageUrl,
        qrCodeData: `https://virdrobe.fashion/discover/${targetGarment.id}?aff=aff_${userProfile.userId}`,
        affiliateCommissionRate: 0.10,
        creatorId: userProfile.userId,
        creatorName: userProfile.name,
        creatorAvatar: userProfile.avatarUrl,
        tryOnCount: 0,
        likes: 5,
        stylingTip: `Sits at an exact ${targetGarment.measurements.waistMin}"-${targetGarment.measurements.waistMax}" waist.`,
      };

      setMagazineCovers((prev) => [userResaleCover, ...prev]);
    }

    showToast(`Listed on thrift storefront for $${resalePrice} with an automated Editorial Cover!`);
  };

  const handleAddNewGarment = (garment: Garment) => {
    setClosetGarments((prev) => [garment, ...prev]);
    showToast(`Added ${garment.title} to your My Virdrobe rack!`);
  };

  const handleSimulateAffiliatePurchase = (cover: MagazineCover) => {
    const commission = Math.round(cover.garment.price * 0.10 * 100) / 100;
    const newOrder: AffiliateOrder = {
      id: `aff_ord_${Date.now()}`,
      creatorId: userProfile.userId,
      creatorName: userProfile.name,
      garmentId: cover.garment.id,
      garmentTitle: cover.garment.title,
      orderTotal: cover.garment.price,
      commissionRate: 0.10,
      commissionEarned: commission,
      status: 'cleared',
      shopperCity: 'Manhattan, NY',
      timestamp: new Date().toISOString(),
    };

    setAffiliateOrders((prev) => [newOrder, ...prev]);
    showToast(`Order Placed via Affiliate QR! You earned +$${commission.toFixed(2)} (10% commission)!`);
    setAffiliateShareCover(null);
  };

  const userPublishedCovers = magazineCovers.filter((c) => c.creatorId === userProfile.userId);

  return (
    <div className="min-h-screen bg-[#0c0d10] text-[#f2f2f3] flex flex-col selection:bg-rose-500/30">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-white/20 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-xl animate-in fade-in slide-in-from-top duration-300">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userProfile={userProfile}
        sellerLedger={sellerLedger}
        onOpenCalibration={() => setIsCalibrationOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {activeTab === 'discover' && (
          <SwipeableDiscoverFeed
            covers={magazineCovers}
            userProfile={userProfile}
            onTryOn={handleTryOnCover}
            onShareAffiliate={(cover) => setAffiliateShareCover(cover)}
            onOpenCalibration={() => setIsCalibrationOpen(true)}
            triedOnGarmentIds={triedOnGarmentIds}
          />
        )}

        {activeTab === 'closet' && (
          <MyVirdrobeCloset
            closetGarments={closetGarments}
            digitalTwin={digitalTwin}
            userProfile={userProfile}
            onUpdateOutfit={(newOutfit) =>
              setDigitalTwin((prev) => ({ ...prev, activeOutfit: newOutfit }))
            }
            onMoveToResale={handleMoveToResale}
            onAddNewGarment={() => setIsAddGarmentOpen(true)}
          />
        )}

        {activeTab === 'seller_affiliate' && (
          <AffiliateAndSellerDashboard
            sellerLedger={sellerLedger}
            affiliateOrders={affiliateOrders}
            publishedCovers={userPublishedCovers}
            userProfile={userProfile}
            onTopUpTokens={handleTopUpTokens}
            onPublishNewSellerCover={(cover) => {
              setMagazineCovers((prev) => [cover, ...prev]);
              showToast(`Published ${cover.headline} to Discover Feed!`);
            }}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8 px-4 bg-zinc-950/80 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="font-masthead tracking-widest text-white uppercase font-bold">
              VIRDROBE
            </span>
            <span>•</span>
            <span>Where It Fits: Shop, Fit, Thrift</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero-Miss Fit Engine
            </span>
            <span>•</span>
            <span>Gemini Multimodal Sizing</span>
            <span>•</span>
            <span>10% Creator Affiliate</span>
          </div>
        </div>
      </footer>

      {/* MODAL 1: Digital Twin Calibration */}
      <DigitalTwinOnboardingModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        profile={userProfile}
        digitalTwin={digitalTwin}
        onSaveProfile={handleSaveProfile}
      />

      {/* MODAL 2: Virtual Try-On */}
      <VirtualTryOnModal
        isOpen={!!selectedTryOnCover}
        onClose={() => setSelectedTryOnCover(null)}
        cover={selectedTryOnCover}
        userProfile={userProfile}
        digitalTwin={digitalTwin}
        onPublishCover={handlePublishCover}
        onDeductSellerToken={handleDeductSellerToken}
      />

      {/* MODAL 3: "No Longer Fits" Resale */}
      <NoLongerFitsModal
        isOpen={!!selectedResaleGarment}
        onClose={() => setSelectedResaleGarment(null)}
        garment={selectedResaleGarment}
        userProfile={userProfile}
        onConfirmList={handleConfirmListResale}
      />

      {/* MODAL 4: Add Garment to Closet */}
      <AddGarmentModal
        isOpen={isAddGarmentOpen}
        onClose={() => setIsAddGarmentOpen(false)}
        userProfile={userProfile}
        onSaveGarment={handleAddNewGarment}
      />

      {/* MODAL 5: Creator 10% Affiliate Sharing Dialog */}
      {affiliateShareCover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#12141a] border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-zinc-100">
            <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-serif-editorial text-white">
                  Creator 10% Affiliate Link & QR
                </h3>
              </div>
              <button
                onClick={() => setAffiliateShareCover(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center text-center p-3">
              <QRCodeBadge
                data={affiliateShareCover.qrCodeData}
                size={120}
                label="10% COMMISSION"
                showScanEffect={true}
              />

              <h4 className="font-semibold text-white mt-3 text-sm">
                {affiliateShareCover.garment.title}
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                {affiliateShareCover.garment.brand} • ${affiliateShareCover.garment.price}
              </p>

              <div className="mt-3 p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl w-full text-xs">
                <span className="text-amber-300 font-bold block mb-1">
                  You earn 10% on every order:
                </span>
                <span className="text-xl font-bold font-mono text-white">
                  +${(affiliateShareCover.garment.price * 0.10).toFixed(2)}
                </span>
              </div>

              <div className="mt-4 flex gap-2 w-full">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(affiliateShareCover.qrCodeData);
                    showToast('Affiliate Link Copied to Clipboard!');
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </button>

                <button
                  onClick={() => handleSimulateAffiliatePurchase(affiliateShareCover)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Simulate Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
