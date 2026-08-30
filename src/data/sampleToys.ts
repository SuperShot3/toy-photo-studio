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
    badge: 'Social & Ads Favorite',
    description: 'Cozy, sunlit nursery or wooden playroom setting with gentle depth of field, keeping the exact toy as the crisp hero.',
    bgPreview: 'from-amber-50 to-orange-50/50 border-amber-200/80',
    idealFor: 'Instagram, Pinterest, email promos, hero banners',
    iconName: 'Sparkles',
  },
  {
    id: 'luxury-promo',
    name: 'Luxury Promo',
    tagline: 'High-End Editorial Plinth',
    badge: 'Premium Gift Look',
    description: 'Sophisticated stone pedestal, soft luxury draped textures, dramatic warm studio rim lighting and gift presentation.',
    bgPreview: 'from-stone-900/5 to-amber-950/10 border-stone-300',
    idealFor: 'Collector toys, artisan gifts, luxury brand showcases',
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
