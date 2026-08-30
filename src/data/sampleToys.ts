import { SampleToy, StyleOption, ScaleOption } from '../types';

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

// Helper to create crisp sample toy base64 SVGs for instant zero-friction testing
function createSvgDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_TOYS: SampleToy[] = [
  {
    id: 'plush-bear',
    name: 'Cinnamon Plush Teddy Bear',
    sizeCm: 28,
    description: 'Handcrafted honey-brown plush bear with soft velvet bow tie and stitched felt paws. Vintage heirloom look.',
    thumbnail: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#fdfbf7"/>
        <g transform="translate(200, 220)">
          <!-- Bear Body -->
          <ellipse cx="0" cy="50" rx="70" ry="85" fill="#a06030" stroke="#7a421b" stroke-width="4"/>
          <!-- Belly patch -->
          <ellipse cx="0" cy="55" rx="45" ry="55" fill="#dfb383"/>
          <!-- Legs -->
          <ellipse cx="-50" cy="115" rx="30" ry="22" fill="#a06030" stroke="#7a421b" stroke-width="3"/>
          <ellipse cx="50" cy="115" rx="30" ry="22" fill="#a06030" stroke="#7a421b" stroke-width="3"/>
          <ellipse cx="-50" cy="115" rx="18" ry="14" fill="#dfb383"/>
          <ellipse cx="50" cy="115" rx="18" ry="14" fill="#dfb383"/>
          <!-- Arms -->
          <ellipse cx="-75" cy="40" rx="22" ry="45" transform="rotate(20 -75 40)" fill="#a06030" stroke="#7a421b" stroke-width="3"/>
          <ellipse cx="75" cy="40" rx="22" ry="45" transform="rotate(-20 75 40)" fill="#a06030" stroke="#7a421b" stroke-width="3"/>
          <!-- Bow Tie -->
          <polygon points="-25,-12 0,-3 25,-12 20,4 0, -2 -20,4" fill="#dc2626"/>
          <circle cx="0" cy="-3" r="6" fill="#991b1b"/>
          <!-- Head -->
          <circle cx="0" cy="-60" r="65" fill="#a06030" stroke="#7a421b" stroke-width="4"/>
          <!-- Ears -->
          <circle cx="-50" cy="-110" r="24" fill="#a06030" stroke="#7a421b" stroke-width="3"/>
          <circle cx="-50" cy="-110" r="14" fill="#dfb383"/>
          <circle cx="50" cy="-110" r="24" fill="#a06030" stroke="#7a421b" stroke-width="3"/>
          <circle cx="50" cy="-110" r="14" fill="#dfb383"/>
          <!-- Snout -->
          <ellipse cx="0" cy="-45" rx="30" ry="22" fill="#dfb383"/>
          <polygon points="-8,-52 8,-52 0,-42" fill="#2d1810"/>
          <path d="M 0,-42 L 0,-34 M -8,-34 Q 0,-30 8,-34" stroke="#2d1810" stroke-width="3" fill="none"/>
          <!-- Eyes -->
          <circle cx="-22" cy="-70" r="7" fill="#1e1008"/>
          <circle cx="-20" cy="-72" r="2.5" fill="#ffffff"/>
          <circle cx="22" cy="-70" r="7" fill="#1e1008"/>
          <circle cx="24" cy="-72" r="2.5" fill="#ffffff"/>
        </g>
      </svg>
    `),
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="#fdfbf7"/>
        <g transform="translate(300, 320)">
          <!-- Bear Body -->
          <ellipse cx="0" cy="70" rx="100" ry="120" fill="#a06030" stroke="#7a421b" stroke-width="5"/>
          <!-- Belly patch -->
          <ellipse cx="0" cy="75" rx="65" ry="80" fill="#dfb383"/>
          <!-- Legs -->
          <ellipse cx="-70" cy="165" rx="42" ry="32" fill="#a06030" stroke="#7a421b" stroke-width="4"/>
          <ellipse cx="70" cy="165" rx="42" ry="32" fill="#a06030" stroke="#7a421b" stroke-width="4"/>
          <ellipse cx="-70" cy="165" rx="25" ry="20" fill="#dfb383"/>
          <ellipse cx="70" cy="165" rx="25" ry="20" fill="#dfb383"/>
          <!-- Arms -->
          <ellipse cx="-105" cy="55" rx="30" ry="65" transform="rotate(20 -105 55)" fill="#a06030" stroke="#7a421b" stroke-width="4"/>
          <ellipse cx="105" cy="55" rx="30" ry="65" transform="rotate(-20 105 55)" fill="#a06030" stroke="#7a421b" stroke-width="4"/>
          <!-- Bow Tie -->
          <polygon points="-38,-15 0,-4 38,-15 30,8 0,-2 -30,8" fill="#dc2626"/>
          <circle cx="0" cy="-4" r="9" fill="#991b1b"/>
          <!-- Head -->
          <circle cx="0" cy="-85" r="90" fill="#a06030" stroke="#7a421b" stroke-width="5"/>
          <!-- Ears -->
          <circle cx="-70" cy="-155" r="34" fill="#a06030" stroke="#7a421b" stroke-width="4"/>
          <circle cx="-70" cy="-155" r="20" fill="#dfb383"/>
          <circle cx="70" cy="-155" r="34" fill="#a06030" stroke="#7a421b" stroke-width="4"/>
          <circle cx="70" cy="-155" r="20" fill="#dfb383"/>
          <!-- Snout -->
          <ellipse cx="0" cy="-65" rx="42" ry="30" fill="#dfb383"/>
          <polygon points="-12,-74 12,-74 0,-60" fill="#2d1810"/>
          <path d="M 0,-60 L 0,-48 M -12,-48 Q 0,-42 12,-48" stroke="#2d1810" stroke-width="4" fill="none"/>
          <!-- Eyes -->
          <circle cx="-32" cy="-100" r="10" fill="#1e1008"/>
          <circle cx="-29" cy="-103" r="3.5" fill="#ffffff"/>
          <circle cx="32" cy="-100" r="10" fill="#1e1008"/>
          <circle cx="35" cy="-103" r="3.5" fill="#ffffff"/>
        </g>
      </svg>
    `),
  },
  {
    id: 'wooden-train',
    name: 'Nordic Beechwood Locomotive',
    sizeCm: 18,
    description: 'Eco-friendly solid beechwood steam train engine with brass rivets, rotating natural wooden wheels, and minimalist Scandinavian finish.',
    thumbnail: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#f8fafc"/>
        <g transform="translate(40, 150)">
          <!-- Cabin -->
          <rect x="200" y="30" width="90" height="110" rx="8" fill="#d97706" stroke="#b45309" stroke-width="4"/>
          <rect x="215" y="45" width="60" height="40" rx="4" fill="#fef3c7" stroke="#b45309" stroke-width="3"/>
          <polygon points="190,30 300,30 290,15 200,15" fill="#78350f"/>
          <!-- Boiler -->
          <rect x="60" y="65" width="145" height="75" rx="10" fill="#d97706" stroke="#b45309" stroke-width="4"/>
          <!-- Smokestack -->
          <polygon points="90,65 110,65 118,25 82,25" fill="#78350f" stroke="#451a03" stroke-width="3"/>
          <rect x="75" y="20" width="50" height="8" rx="2" fill="#b45309"/>
          <!-- Front Dome -->
          <rect x="150" y="45" width="28" height="20" rx="5" fill="#78350f"/>
          <!-- Chassis base -->
          <rect x="40" y="135" width="265" height="22" rx="4" fill="#78350f"/>
          <!-- Wheels -->
          <circle cx="95" cy="165" r="28" fill="#fef3c7" stroke="#78350f" stroke-width="6"/>
          <circle cx="95" cy="165" r="8" fill="#b45309"/>
          <circle cx="170" cy="165" r="28" fill="#fef3c7" stroke="#78350f" stroke-width="6"/>
          <circle cx="170" cy="165" r="8" fill="#b45309"/>
          <circle cx="250" cy="165" r="34" fill="#fef3c7" stroke="#78350f" stroke-width="6"/>
          <circle cx="250" cy="165" r="10" fill="#b45309"/>
          <!-- Connector Rod -->
          <rect x="95" y="160" width="155" height="8" rx="3" fill="#b45309"/>
        </g>
      </svg>
    `),
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="#f8fafc"/>
        <g transform="translate(70, 220)">
          <!-- Cabin -->
          <rect x="290" y="40" width="130" height="160" rx="10" fill="#d97706" stroke="#b45309" stroke-width="5"/>
          <rect x="315" y="60" width="80" height="55" rx="6" fill="#fef3c7" stroke="#b45309" stroke-width="4"/>
          <polygon points="275,40 435,40 420,20 290,20" fill="#78350f"/>
          <!-- Boiler -->
          <rect x="90" y="90" width="205" height="110" rx="14" fill="#d97706" stroke="#b45309" stroke-width="5"/>
          <!-- Smokestack -->
          <polygon points="130,90 160,90 172,35 118,35" fill="#78350f" stroke="#451a03" stroke-width="4"/>
          <rect x="110" y="26" width="70" height="12" rx="3" fill="#b45309"/>
          <!-- Front Dome -->
          <rect x="220" y="60" width="40" height="30" rx="7" fill="#78350f"/>
          <!-- Chassis base -->
          <rect x="60" y="195" width="375" height="30" rx="6" fill="#78350f"/>
          <!-- Wheels -->
          <circle cx="140" cy="240" r="40" fill="#fef3c7" stroke="#78350f" stroke-width="8"/>
          <circle cx="140" cy="240" r="12" fill="#b45309"/>
          <circle cx="245" cy="240" r="40" fill="#fef3c7" stroke="#78350f" stroke-width="8"/>
          <circle cx="245" cy="240" r="12" fill="#b45309"/>
          <circle cx="360" cy="240" r="48" fill="#fef3c7" stroke="#78350f" stroke-width="8"/>
          <circle cx="360" cy="240" r="14" fill="#b45309"/>
          <!-- Connector Rod -->
          <rect x="140" y="233" width="220" height="12" rx="4" fill="#b45309"/>
        </g>
      </svg>
    `),
  },
  {
    id: 'robot-bot',
    name: 'Astro-Bot Retro Space Explorer',
    sizeCm: 22,
    description: 'Tin-style teal and chrome retro robot figure with turning antenna, neon amber chest meter, and movable jointed pincers.',
    thumbnail: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#f0fdfa"/>
        <g transform="translate(200, 210)">
          <!-- Legs -->
          <rect x="-45" y="80" width="30" height="70" rx="6" fill="#0d9488" stroke="#115e59" stroke-width="3"/>
          <rect x="15" y="80" width="30" height="70" rx="6" fill="#0d9488" stroke="#115e59" stroke-width="3"/>
          <rect x="-55" y="145" width="50" height="20" rx="5" fill="#334155"/>
          <rect x="5" y="145" width="50" height="20" rx="5" fill="#334155"/>
          <!-- Arms -->
          <g transform="translate(-75, 10)">
            <rect x="-15" y="0" width="20" height="60" rx="5" fill="#0d9488" stroke="#115e59" stroke-width="3"/>
            <!-- Pincer -->
            <path d="M -15,60 C -30,70 -10,90 -5,80" stroke="#f59e0b" stroke-width="5" fill="none"/>
          </g>
          <g transform="translate(75, 10)">
            <rect x="-5" y="0" width="20" height="60" rx="5" fill="#0d9488" stroke="#115e59" stroke-width="3"/>
            <!-- Pincer -->
            <path d="M 15,60 C 30,70 10,90 5,80" stroke="#f59e0b" stroke-width="5" fill="none"/>
          </g>
          <!-- Torso -->
          <rect x="-60" y="-10" width="120" height="100" rx="10" fill="#0f766e" stroke="#134e4a" stroke-width="4"/>
          <!-- Chest screen -->
          <rect x="-40" y="5" width="80" height="45" rx="5" fill="#14b8a6"/>
          <circle cx="-20" cy="27" r="10" fill="#f59e0b"/>
          <circle cx="10" cy="27" r="8" fill="#ef4444"/>
          <circle cx="28" cy="27" r="5" fill="#eab308"/>
          <rect x="-35" y="60" width="70" height="15" rx="3" fill="#042f2e"/>
          <!-- Head -->
          <rect x="-45" y="-95" width="90" height="75" rx="12" fill="#0d9488" stroke="#115e59" stroke-width="4"/>
          <!-- Eyes -->
          <circle cx="-22" cy="-60" r="12" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>
          <circle cx="22" cy="-60" r="12" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>
          <circle cx="-22" cy="-60" r="5" fill="#1e293b"/>
          <circle cx="22" cy="-60" r="5" fill="#1e293b"/>
          <!-- Mouth -->
          <rect x="-20" y="-38" width="40" height="8" rx="2" fill="#334155"/>
          <!-- Antenna -->
          <line x1="0" y1="-95" x2="0" y2="-125" stroke="#115e59" stroke-width="4"/>
          <circle cx="0" cy="-130" r="10" fill="#ef4444"/>
        </g>
      </svg>
    `),
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="#f0fdfa"/>
        <g transform="translate(300, 300)">
          <!-- Legs -->
          <rect x="-65" y="110" width="45" height="100" rx="8" fill="#0d9488" stroke="#115e59" stroke-width="4"/>
          <rect x="20" y="110" width="45" height="100" rx="8" fill="#0d9488" stroke="#115e59" stroke-width="4"/>
          <rect x="-80" y="200" width="70" height="28" rx="6" fill="#334155"/>
          <rect x="10" y="200" width="70" height="28" rx="6" fill="#334155"/>
          <!-- Arms -->
          <g transform="translate(-105, 15)">
            <rect x="-20" y="0" width="28" height="85" rx="6" fill="#0d9488" stroke="#115e59" stroke-width="4"/>
            <path d="M -20,85 C -40,100 -15,125 -5,110" stroke="#f59e0b" stroke-width="7" fill="none"/>
          </g>
          <g transform="translate(105, 15)">
            <rect x="-8" y="0" width="28" height="85" rx="6" fill="#0d9488" stroke="#115e59" stroke-width="4"/>
            <path d="M 20,85 C 40,100 15,125 5,110" stroke="#f59e0b" stroke-width="7" fill="none"/>
          </g>
          <!-- Torso -->
          <rect x="-85" y="-15" width="170" height="140" rx="14" fill="#0f766e" stroke="#134e4a" stroke-width="5"/>
          <!-- Chest screen -->
          <rect x="-60" y="10" width="120" height="65" rx="8" fill="#14b8a6"/>
          <circle cx="-30" cy="42" r="14" fill="#f59e0b"/>
          <circle cx="15" cy="42" r="11" fill="#ef4444"/>
          <circle cx="42" cy="42" r="8" fill="#eab308"/>
          <rect x="-50" y="88" width="100" height="20" rx="4" fill="#042f2e"/>
          <!-- Head -->
          <rect x="-65" y="-135" width="130" height="105" rx="16" fill="#0d9488" stroke="#115e59" stroke-width="5"/>
          <!-- Eyes -->
          <circle cx="-32" cy="-85" r="17" fill="#fbbf24" stroke="#d97706" stroke-width="4"/>
          <circle cx="32" cy="-85" r="17" fill="#fbbf24" stroke="#d97706" stroke-width="4"/>
          <circle cx="-32" cy="-85" r="7" fill="#1e293b"/>
          <circle cx="32" cy="-85" r="7" fill="#1e293b"/>
          <!-- Mouth -->
          <rect x="-30" y="-55" width="60" height="12" rx="3" fill="#334155"/>
          <!-- Antenna -->
          <line x1="0" y1="-135" x2="0" y2="-175" stroke="#115e59" stroke-width="5"/>
          <circle cx="0" cy="-185" r="14" fill="#ef4444"/>
        </g>
      </svg>
    `),
  },
];
