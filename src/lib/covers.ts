import { Garment, MagazineCover } from '../types/schema';

/** A simple editorial cover so every listing can be tried on, even without the AI generator. */
export function makeBasicCover(garment: Partial<Garment>, shopName: string): Partial<MagazineCover> {
  return {
    masthead: shopName.toUpperCase(),
    issueTag: 'NEW IN STOCK',
    headline: (garment.title || 'NEW ARRIVAL').toUpperCase(),
    subheading: [garment.fabric, garment.color].filter(Boolean).join(' · ') || 'Measured for an exact fit.',
    editorialCopy: `${garment.title || 'This piece'} from ${shopName}. Exact measurements are listed so you know it fits before you buy.`,
    coverImageUrl: garment.imageUrl,
    stylingTip: 'Check the measurements against your digital twin for an exact fit.',
    tryOnCount: 0,
    likes: 0,
  };
}
