import { StyleOption, ScaleOption } from '../types';

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'clean-catalog',
    name: 'Clean Catalog',
    tagline: 'Pure White & Studio Lighting',
    badge: 'Amazon & Shopify Ready',
    description: 'Clean pure white studio background with soft realistic contact shadow, sharp edges, and true-to-life color fidelity.',
    bgPreview: 'from-neutral-100 to-white border-neutral-200',
    idealFor: 'Marketplaces, catalog grids, spec sheets',
    iconName: 'ShoppingBag',
  },
  {
    id: 'styled-promo',
    name: 'Styled Promo',
    tagline: 'Warm Commercial Lifestyle',
    badge: 'Name on photo',
    description: 'Lifestyle setting with the product name and a selling line printed on the photo — ready to post or sell.',
    bgPreview: 'from-amber-50 to-orange-50/50 border-amber-200/80',
    idealFor: 'Instagram, Pinterest, email promos, hero banners',
    iconName: 'Sparkles',
  },
  {
    id: 'luxury-promo',
    name: 'Luxury Promo',
    tagline: 'High-End Editorial Plinth',
    badge: 'Named gift look',
    description: 'Stone pedestal, draped textures, and dramatic rim light, with elegant product-name type printed on the image like a magazine ad.',
    bgPreview: 'from-stone-900/5 to-amber-950/10 border-stone-300',
    idealFor: 'Gifts, artisan pieces, luxury brand showcases',
    iconName: 'Crown',
  },
];

export const SCALE_OPTIONS: ScaleOption[] = [
  {
    id: 'none',
    name: 'Show No Person',
    subtitle: 'Solo product focus',
    icon: 'Maximize2',
  },
  {
    id: 'child',
    name: 'Show Child for Scale',
    subtitle: 'Realistic child size comparison',
    icon: 'Smile',
  },
  {
    id: 'adult',
    name: 'Show Adult for Scale',
    subtitle: 'Hand / adult proportion reference',
    icon: 'User',
  },
];
