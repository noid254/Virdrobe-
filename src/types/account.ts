/** Shapes returned by the account API (see server/store.ts). */
export type Role = 'client' | 'affiliate' | 'seller';

export interface ProfileInfo {
  displayName: string;
  avatarUrl: string;
  bio: string;
  city: string;
  country: string;
  instagram: string;
  tiktok: string;
  website: string;
}

export interface SellerInfo {
  shopName: string;
  tagline: string;
  description: string;
  category: string;
  address: string;
  city: string;
  country: string;
  openingHours: string;
  returnsPolicy: string;
  shippingInfo: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  website: string;
  instagram: string;
  logoUrl: string;
  bannerUrl: string;
  defaultCommissionRate: number;
  tokenBalance: number;
  tryOnsServed: number;
  verified: boolean;
  createdAt: string;
}

export interface AffiliateInfo {
  registeredAt: string;
  code: string;
  payoutMethod: string;
  payoutDetails: string;
}

/** The signed-in person's OWN account (private fields included). */
export interface AccountUser {
  id: string;
  email: string;
  handle: string;
  roles: Role[];
  activeRole: Role;
  profile: ProfileInfo;
  fit: any | null;
  twin: any | null;
  closet: any[];
  affiliate: AffiliateInfo | null;
  seller: SellerInfo | null;
  createdAt: string;
}

export interface TryOnView {
  id: string;
  caption: string;
  createdAt: string;
  views: number;
  inStock: boolean;
  cover: any; // MagazineCover
  creator: { handle: string; displayName: string; avatarUrl: string; isAffiliate: boolean } | null;
}

export interface PublicProfile {
  handle: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  city: string;
  country: string;
  instagram: string;
  tiktok: string;
  website: string;
  memberSince: string;
  isAffiliate: boolean;
  isSeller: boolean;
  seller: null | {
    shopName: string;
    tagline: string;
    description: string;
    category: string;
    address: string;
    city: string;
    country: string;
    openingHours: string;
    returnsPolicy: string;
    shippingInfo: string;
    contactEmail: string;
    contactPhone: string;
    whatsapp: string;
    website: string;
    instagram: string;
    logoUrl: string;
    bannerUrl: string;
    verified: boolean;
    commissionOffered: number;
    memberSince: string;
    listings: { garment: any; cover: any | null; commissionRate: number }[];
  };
  shop: null | { tryOns: TryOnView[] };
  sharedCount: number;
  sharedTryOns: TryOnView[];
}
