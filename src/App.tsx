import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UserFitProfile, DigitalTwin, Garment, MagazineCover } from './types/schema';
import { Role } from './types/account';
import { initialUserProfile, initialDigitalTwin, initialMagazineCovers } from './data/mockDatabase';
import { useAuth } from './auth/AuthContext';
import { api, pct } from './lib/api';
import { useHashRoute } from './lib/useHashRoute';
import { Navbar, TabId, tabsForRole } from './components/Navbar';
import { AuthPage } from './components/AuthPage';
import { SwipeableDiscoverFeed } from './components/SwipeableDiscoverFeed';
import { MyVirdrobeCloset } from './components/MyVirdrobeCloset';
import { SellerStudio } from './components/SellerStudio';
import { AffiliateHub } from './components/AffiliateHub';
import { ProfileView } from './components/ProfileView';
import { ProfileEditor } from './components/ProfileEditor';
import { SharedTryOnPage } from './components/SharedTryOnPage';
import { RoleSetupModal } from './components/RoleSetupModal';
import { DigitalTwinOnboardingModal } from './components/DigitalTwinOnboardingModal';
import { VirtualTryOnModal } from './components/VirtualTryOnModal';
import { NoLongerFitsModal } from './components/NoLongerFitsModal';
import { AddGarmentModal } from './components/AddGarmentModal';
import { QRCodeBadge } from './components/QRCodeBadge';
import { Copy, Loader2, Share2, ShieldCheck, Sparkles, Tag } from 'lucide-react';

const isTryOnCover = (c: MagazineCover) => c.id.startsWith('cover_try_');
const tryOnIdOf = (c: MagazineCover) => c.id.slice('cover_'.length);

export default function App() {
  const { user, loading, logOut, switchRole, saveAccount } = useAuth();
  const [route] = useHashRoute();

  const [activeTab, setActiveTab] = useState<TabId>('discover');
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwin>(initialDigitalTwin);
  const [triedOnGarmentIds, setTriedOnGarmentIds] = useState<string[]>([]);
  const [feed, setFeed] = useState<{ listingCovers: MagazineCover[]; tryOnCovers: MagazineCover[] }>({
    listingCovers: [],
    tryOnCovers: [],
  });
  const [sessionCovers, setSessionCovers] = useState<MagazineCover[]>([]);

  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [selectedTryOnCover, setSelectedTryOnCover] = useState<MagazineCover | null>(null);
  const [selectedResaleGarment, setSelectedResaleGarment] = useState<Garment | null>(null);
  const [isAddGarmentOpen, setIsAddGarmentOpen] = useState(false);
  const [shareCover, setShareCover] = useState<{ cover: MagazineCover; link: string } | null>(null);
  const [roleSetup, setRoleSetup] = useState<null | 'affiliate' | 'seller'>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const askedCalibration = useRef(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 4500);
  }, []);

  const loadFeed = useCallback(() => {
    api<{ listingCovers: MagazineCover[]; tryOnCovers: MagazineCover[] }>('/api/feed')
      .then(setFeed)
      .catch(() => undefined);
  }, []);
  useEffect(loadFeed, [loadFeed]);

  // ---- Derived per-account data ----
  const userProfile: UserFitProfile = useMemo(() => {
    if (!user) return initialUserProfile;
    const base: UserFitProfile = user.fit ? { ...initialUserProfile, ...user.fit } : { ...initialUserProfile };
    return {
      ...base,
      userId: user.id,
      name: user.profile.displayName,
      email: user.email,
      avatarUrl: user.profile.avatarUrl || base.avatarUrl,
      location: { ...base.location, city: user.profile.city || base.location.city },
    };
  }, [user]);

  const closetGarments: Garment[] = useMemo(() => (user?.closet as Garment[]) || [], [user?.closet]);

  useEffect(() => {
    if (user?.twin) setDigitalTwin({ ...initialDigitalTwin, ...user.twin, userId: user.id });
  }, [user?.id, user?.twin]);

  // New clients calibrate their measurements first so Discover shows only what fits.
  useEffect(() => {
    if (user && !user.fit && user.activeRole !== 'seller' && !askedCalibration.current) {
      askedCalibration.current = true;
      setIsCalibrationOpen(true);
    }
  }, [user]);

  // Keep the active tab valid for the active role.
  useEffect(() => {
    if (!user) return;
    const allowed = tabsForRole(user.activeRole).map((t) => t.id);
    if (!allowed.includes(activeTab)) setActiveTab(user.activeRole === 'seller' ? 'studio' : 'discover');
  }, [user?.activeRole]); // eslint-disable-line react-hooks/exhaustive-deps

  const covers = useMemo(
    () => [...sessionCovers, ...feed.tryOnCovers, ...feed.listingCovers, ...initialMagazineCovers],
    [sessionCovers, feed]
  );

  // ---- Actions ----
  const requireSignIn = () => {
    setShowAuth(true);
  };

  const saveCloset = (next: Garment[]) => {
    saveAccount({ closet: next }).catch((e) => showToast(e.message));
  };

  const handleSaveProfile = async (updatedProfile: UserFitProfile, updatedTwin: DigitalTwin) => {
    try {
      await saveAccount({ fit: updatedProfile, twin: updatedTwin });
      setDigitalTwin(updatedTwin);
      showToast(`Fit saved: ${updatedProfile.chestInches}"-${updatedProfile.waistInches}"-${updatedProfile.hipsInches}". Discover now shows what fits you.`);
    } catch (e: any) {
      showToast(e.message);
    }
  };

  const handleTryOnCover = (cover: MagazineCover) => {
    if (!user) return requireSignIn();
    setSelectedTryOnCover(cover);
    if (!triedOnGarmentIds.includes(cover.garmentId)) setTriedOnGarmentIds((p) => [...p, cover.garmentId]);
  };

  const handleTryOnServed = (_sellerId: string, _title: string, garmentId: string) => {
    api('/api/tryon-events', { body: { garmentId } }).catch(() => undefined);
  };

  const handlePublishCover = async (created: MagazineCover): Promise<string> => {
    const rec = await api<{ id: string; cover: MagazineCover }>('/api/tryons', {
      body: { garmentId: created.garmentId, cover: created, origin: window.location.origin, caption: created.headline },
    });
    setFeed((f) => ({ ...f, tryOnCovers: [rec.cover, ...f.tryOnCovers] }));
    showToast('Published. Your try-on is live on Discover.');
    return rec.cover.qrCodeData;
  };

  const handleShareCover = async (cover: MagazineCover) => {
    if (!user) return requireSignIn();
    try {
      if (isTryOnCover(cover) && cover.creatorId === user.id) {
        setShareCover({ cover, link: cover.qrCodeData });
        return;
      }
      // Sharing someone else's pin creates YOUR tracked link for it.
      const rec = await api<{ id: string; cover: MagazineCover }>('/api/tryons', {
        body: { garmentId: cover.garmentId, cover: { coverImageUrl: cover.coverImageUrl, headline: cover.headline, subheading: cover.subheading, stylingTip: cover.stylingTip }, origin: window.location.origin },
      });
      setFeed((f) => ({ ...f, tryOnCovers: [rec.cover, ...f.tryOnCovers] }));
      setShareCover({ cover: rec.cover, link: rec.cover.qrCodeData });
    } catch (e: any) {
      showToast(e.message);
    }
  };

  const handleBuy = async (garmentId: string, tryOnId?: string) => {
    if (!user) return requireSignIn();
    try {
      await api('/api/orders', { body: { garmentId, tryOnId } });
      showToast('Order placed. The seller will confirm and contact you about payment and delivery.');
    } catch (e: any) {
      showToast(e.message);
    }
  };
  const handleBuyCover = (c: MagazineCover) => handleBuy(c.garmentId, isTryOnCover(c) ? tryOnIdOf(c) : undefined);

  const handleSwitchRole = async (r: Role) => {
    try {
      await switchRole(r);
      window.location.hash = '#/';
      setActiveTab(r === 'seller' ? 'studio' : 'discover');
    } catch (e: any) {
      showToast(e.message);
    }
  };

  const handleConfirmListResale = (garmentId: string, resalePrice: number, resaleDescription: string) => {
    saveCloset(
      closetGarments.map((g) => (g.id === garmentId ? { ...g, resaleStatus: 'listed' as const, resalePrice, resaleDescription } : g))
    );
    const g = closetGarments.find((x) => x.id === garmentId);
    if (g) {
      const resaleCover: MagazineCover = {
        id: `cover_resale_${Date.now()}`,
        garmentId: g.id,
        garment: { ...g, price: resalePrice, inStock: true },
        sellerId: userProfile.userId,
        sellerName: `${userProfile.name.toUpperCase()} THRIFT ARCHIVE`,
        masthead: `${userProfile.name.split(' ')[0].toUpperCase()} ARCHIVE`,
        issueTag: 'CIRCULAR THRIFT',
        headline: `PRE-LOVED ${g.brand.toUpperCase()}`,
        subheading: resaleDescription,
        editorialCopy: `Outgrown by ${userProfile.name}. Verified condition in ${g.fabric}.`,
        coverImageUrl: g.imageUrl,
        qrCodeData: '',
        affiliateCommissionRate: 0.1,
        tryOnCount: 0,
        likes: 0,
        stylingTip: `Sits at an exact ${g.measurements.waistMin}"-${g.measurements.waistMax}" waist.`,
      };
      setSessionCovers((p) => [resaleCover, ...p]);
    }
    showToast(`Listed for $${resalePrice}. (Resale listings are shown to you this session; open a seller shop to publish permanently.)`);
  };

  const handleAddNewGarment = (garment: Garment) => {
    saveCloset([garment, ...closetGarments]);
    showToast(`Added ${garment.title} to your wardrobe.`);
  };

  // ---- Screens ----
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0d10] flex items-center justify-center text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const publicRoute = route.name === 'profile' || route.name === 'tryon';

  if (!user && (showAuth || !publicRoute)) {
    return <AuthPage note={showAuth ? 'Sign in or create an account to continue.' : undefined} />;
  }

  const toast = toastMessage && (
    <div
      role="status"
      className="fixed top-16 sm:top-20 inset-x-3 sm:inset-x-auto sm:right-6 z-[60] bg-zinc-900 border border-white/20 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-start gap-2.5 text-xs font-semibold sm:max-w-sm"
    >
      <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
      <span>{toastMessage}</span>
    </div>
  );

  // Signed-out visitor following a shared link or a public profile
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0c0d10] text-[#f2f2f3]">
        {toast}
        <header className="sticky top-0 z-40 bg-[#0c0d10]/90 backdrop-blur-xl border-b border-white/10 h-14 px-3 sm:px-4 flex items-center justify-between">
          <a href="#/" className="font-masthead text-lg font-black tracking-[0.14em] uppercase">VIRDROBE</a>
          <button onClick={requireSignIn} className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold">Sign in</button>
        </header>
        {route.name === 'profile' && <ProfileView handle={route.handle} onTryOn={requireSignIn} onBuy={requireSignIn} />}
        {route.name === 'tryon' && <SharedTryOnPage id={route.id} signedIn={false} onTryOn={requireSignIn} onBuy={requireSignIn} />}
      </div>
    );
  }

  const isAffiliate = !!user.affiliate;

  return (
    <div className="min-h-screen bg-[#0c0d10] text-[#f2f2f3] flex flex-col selection:bg-rose-500/30">
      {toast}

      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={user}
        userProfile={userProfile}
        onOpenCalibration={() => setIsCalibrationOpen(true)}
        onSwitchRole={handleSwitchRole}
        onBecomeAffiliate={() => setRoleSetup('affiliate')}
        onBecomeSeller={() => setRoleSetup('seller')}
        onLogOut={logOut}
      />

      <main className="flex-1 pb-24 sm:pb-16">
        {route.name === 'profile' && (
          <ProfileView
            handle={route.handle}
            currentHandle={user.handle}
            onTryOn={handleTryOnCover}
            onBuy={(id, t) => handleBuy(id, t)}
          />
        )}
        {route.name === 'tryon' && (
          <SharedTryOnPage id={route.id} signedIn onTryOn={handleTryOnCover} onBuy={(id, t) => handleBuy(id, t)} />
        )}
        {route.name === 'me' && <ProfileEditor key={user.id} user={user} />}

        {route.name === 'home' && (
          <>
            {activeTab === 'discover' && (
              <SwipeableDiscoverFeed
                covers={covers}
                userProfile={userProfile}
                onTryOn={handleTryOnCover}
                onShareAffiliate={handleShareCover}
                onBuy={handleBuyCover}
                onOpenCalibration={() => setIsCalibrationOpen(true)}
                triedOnGarmentIds={triedOnGarmentIds}
              />
            )}

            {activeTab === 'closet' && (
              <MyVirdrobeCloset
                closetGarments={closetGarments}
                digitalTwin={digitalTwin}
                userProfile={userProfile}
                onUpdateOutfit={(newOutfit) => setDigitalTwin((prev) => ({ ...prev, activeOutfit: newOutfit }))}
                onMoveToResale={setSelectedResaleGarment}
                onAddNewGarment={() => setIsAddGarmentOpen(true)}
              />
            )}

            {activeTab === 'affiliate' && isAffiliate && <AffiliateHub user={user} onToast={showToast} />}
            {activeTab === 'studio' && user.seller && <SellerStudio user={user} onToast={showToast} onFeedChanged={loadFeed} />}
          </>
        )}
      </main>

      <footer className="hidden sm:block border-t border-white/10 py-6 px-4 bg-zinc-950/80 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <span className="font-masthead tracking-widest text-white uppercase font-bold">VIRDROBE · Where it fits</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Exact-fit matching
          </span>
        </div>
      </footer>

      <DigitalTwinOnboardingModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        profile={userProfile}
        digitalTwin={digitalTwin}
        onSaveProfile={handleSaveProfile}
      />

      <VirtualTryOnModal
        isOpen={!!selectedTryOnCover}
        onClose={() => setSelectedTryOnCover(null)}
        cover={selectedTryOnCover}
        userProfile={userProfile}
        digitalTwin={digitalTwin}
        onPublishCover={handlePublishCover}
        onDeductSellerToken={handleTryOnServed}
        isAffiliate={isAffiliate}
        onRegisterAffiliate={() => setRoleSetup('affiliate')}
      />

      <NoLongerFitsModal
        isOpen={!!selectedResaleGarment}
        onClose={() => setSelectedResaleGarment(null)}
        garment={selectedResaleGarment}
        userProfile={userProfile}
        onConfirmList={handleConfirmListResale}
      />

      <AddGarmentModal
        isOpen={isAddGarmentOpen}
        onClose={() => setIsAddGarmentOpen(false)}
        userProfile={userProfile}
        onSaveGarment={handleAddNewGarment}
      />

      {roleSetup && <RoleSetupModal kind={roleSetup} onClose={() => setRoleSetup(null)} onDone={showToast} />}

      {/* Share dialog: tracked link for this try-on */}
      {shareCover && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md sm:p-4" onClick={() => setShareCover(null)}>
          <div onClick={(e) => e.stopPropagation()} className="relative w-full sm:max-w-md bg-[#12141a] border border-amber-500/30 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl text-zinc-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-serif-editorial text-white">Share this look</h3>
              </div>
              <button onClick={() => setShareCover(null)} className="p-2 text-zinc-400 hover:text-white" aria-label="Close">✕</button>
            </div>

            <div className="flex flex-col items-center text-center">
              <QRCodeBadge data={shareCover.link} size={120} label="SCAN TO SHOP" showScanEffect />
              <h4 className="font-semibold text-white mt-3 text-sm">{shareCover.cover.garment.title}</h4>
              <p className="text-xs text-zinc-400 mt-0.5">{shareCover.cover.garment.brand} · ${shareCover.cover.garment.price}</p>

              {isAffiliate ? (
                <div className="mt-3 p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl w-full text-xs">
                  <span className="text-amber-300 font-bold block mb-1">You earn {pct(shareCover.cover.affiliateCommissionRate ?? 0.1)} when someone buys through this link</span>
                  <span className="text-xl font-bold font-mono text-white">+${(shareCover.cover.garment.price * (shareCover.cover.affiliateCommissionRate ?? 0.1)).toFixed(2)}</span>
                </div>
              ) : (
                <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-xl w-full text-xs text-zinc-300">
                  You can share this link, but you will not earn from it.
                  <button
                    onClick={() => {
                      setShareCover(null);
                      setRoleSetup('affiliate');
                    }}
                    className="mt-2 w-full py-2.5 rounded-lg bg-amber-500 text-black font-bold"
                  >
                    Register as a reseller to earn
                  </button>
                </div>
              )}

              <input readOnly value={shareCover.link} onFocus={(e) => e.currentTarget.select()} className="mt-3 w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-300 font-mono" />

              <div className="mt-3 flex gap-2 w-full">
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(shareCover.link);
                      showToast('Link copied.');
                    } catch {
                      showToast('Press and hold the link above to copy it.');
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-4 h-4" /> Copy link
                </button>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={() => navigator.share({ title: shareCover.cover.garment.title, url: shareCover.link }).catch(() => undefined)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
