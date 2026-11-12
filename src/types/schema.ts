/**
 * Virdrobe Core Database Schema & Domain Types
 * Exactly mirrors full-stack database tables and Gemini API structured schemas.
 */

export interface UserFitProfile {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
  gender: 'women' | 'men' | 'unisex' | 'non-binary';
  heightInches: number; // e.g. 68 -> 5'8"
  chestInches: number;  // e.g. 36
  waistInches: number;  // e.g. 28
  hipsInches: number;   // e.g. 38
  inseamInches: number; // e.g. 30
  shoeSizeUS: number;   // e.g. 8.5
  fitPreference: 'fitted' | 'tailored' | 'relaxed' | 'oversized';
  location: {
    city: string;
    state: string;
    zip: string;
    lat: number;
    lng: number;
  };
  radiusMiles: number; // Discovery geofence radius
}

export interface DigitalTwin {
  id: string;
  userId: string;
  photoUrl: string;
  pose: 'front-editorial' | 'runway' | 'candid-studio';
  skinTone: string;
  hairStyle: string;
  bodyType: 'hourglass' | 'athletic' | 'rectangle' | 'pear' | 'inverted-triangle';
  createdWithAi: boolean;
  activeOutfit: {
    topId?: string;
    bottomId?: string;
    outerwearId?: string;
    shoesId?: string;
    dressId?: string;
  };
}

export interface GarmentMeasurements {
  chestMin: number;
  chestMax: number;
  waistMin: number;
  waistMax: number;
  hipsMin: number;
  hipsMax: number;
  inseamMin?: number;
  inseamMax?: number;
  shoeSize?: number;
  labelSize: string; // e.g. "M / 38R", "US 6 / 28W", "9.5 US"
}

export interface Garment {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerBoutiqueType: 'vintage_curator' | 'independent_label' | 'consignment_studio' | 'personal_closet';
  sellerLocation: {
    city: string;
    distanceMiles: number;
  };
  title: string;
  brand: string;
  category: 'tops' | 'bottoms' | 'outerwear' | 'shoes' | 'dresses';
  color: string;
  fabric: string;
  condition: 'new_with_tags' | 'mint' | 'gently_loved' | 'vintage';
  price: number;
  originalRetailPrice: number;
  measurements: GarmentMeasurements;
  fitType: 'slim' | 'tailored' | 'regular' | 'relaxed' | 'oversized';
  imageUrl: string;
  cutoutImageUrl?: string;
  inStock: boolean;
  isOwnedByUser?: boolean;
  resaleStatus?: 'not_listed' | 'listed' | 'sold';
  resalePrice?: number;
  resaleDescription?: string;
  tags: string[];
  createdAt: string;
}

export interface MagazineCover {
  id: string;
  garmentId: string;
  garment: Garment;
  sellerId: string;
  sellerName: string;
  masthead: string; // e.g., "ATELIER SOHO", "VOGUE ARCHIVE", "LE MONDE DE STYLE"
  issueTag: string; // e.g., "OCTOBRE EDITION • VOL 14"
  headline: string; // e.g., "THE ARCHIVAL TRENCH"
  subheading: string; // e.g., "Sculptural Italian Gabardine tailored for the modern silhouette"
  editorialCopy: string;
  coverImageUrl: string;
  qrCodeData: string;
  affiliateCommissionRate: number; // 0.10 (10%)
  creatorId?: string;
  creatorName?: string;
  creatorAvatar?: string;
  isCreatorCover?: boolean;
  tryOnCount: number;
  likes: number;
  stylingTip: string;
  tryOnOutfitUrl?: string; // Generated try-on composite
}

export interface SellerTokenTransaction {
  id: string;
  type: 'try_on_deduction' | 'pack_purchase' | 'affiliate_payout';
  amount: number; // e.g. -1 for try on, +50 for pack purchase
  description: string;
  timestamp: string;
  shopperId?: string;
  garmentTitle?: string;
}

export interface SellerTokenLedger {
  sellerId: string;
  sellerName: string;
  balance: number;
  totalTryOnsServed: number;
  costPerTryOnUsd: number; // e.g. $0.15
  transactions: SellerTokenTransaction[];
}

export interface AffiliateOrder {
  id: string;
  creatorId: string;
  creatorName: string;
  garmentId: string;
  garmentTitle: string;
  orderTotal: number;
  commissionRate: number; // 0.10
  commissionEarned: number;
  status: 'pending' | 'cleared' | 'withdrawn';
  shopperCity: string;
  timestamp: string;
}

export interface AiGarmentAnalysisResult {
  category: 'tops' | 'bottoms' | 'outerwear' | 'shoes' | 'dresses';
  brand: string;
  title: string;
  color: string;
  fabric: string;
  fitType: 'slim' | 'tailored' | 'regular' | 'relaxed' | 'oversized';
  condition: 'new_with_tags' | 'mint' | 'gently_loved' | 'vintage';
  estimatedMeasurements: GarmentMeasurements;
  suggestedPrice: number;
  editorialHeadline: string;
  editorialSubheading: string;
  editorialStylingTip: string;
  resaleBlurb: string;
}
