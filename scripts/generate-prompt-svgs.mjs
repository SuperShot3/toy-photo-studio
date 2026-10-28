// Generates the placeholder illustrations for the Prompt Builder.
// Run: node scripts/generate-prompt-svgs.mjs
// Output: public/prompt-builder/<step>/<id>.svg (200x200, flat shapes).
// Later, replace any file with a real image (same name, or edit `image` in config/promptSteps.ts).
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'prompt-builder');

const C = {
  bg: '#fdf2f8',
  card: '#ffffff',
  ink: '#475569',
  inkLight: '#94a3b8',
  rose: '#f472b6',
  roseDark: '#db2777',
  pink: '#fbcfe8',
  white: '#ffffff',
  green: '#4ade80',
  greenDark: '#16a34a',
  kraft: '#e8c9a0',
  kraftDark: '#c9a273',
  sky: '#bae6fd',
  sun: '#fbbf24',
  skin: '#f5c9a8',
  cam: '#334155',
  accent: '#6366f1',
};

const svg = (body, bg = C.bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200" font-family="Arial, Helvetica, sans-serif">` +
  `<rect width="200" height="200" fill="${bg}"/>${body}</svg>`;

const g = (x, y, s, body, rot = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${body}</g>`;

// ---- reusable shapes (drawn around local origin 0,0) ----------------------------------------

/** Bouquet: flower heads on top, kraft cone below. Origin is the middle of the whole bouquet. */
const bouquet = (s = 1, x = 0, y = 0, rot = 0) =>
  g(
    x,
    y,
    s,
    `<path d="M-6 -12 L-14 -34 M6 -12 L16 -32" stroke="${C.greenDark}" stroke-width="3"/>
     <ellipse cx="-24" cy="-26" rx="9" ry="5" fill="${C.green}" transform="rotate(-30 -24 -26)"/>
     <ellipse cx="25" cy="-24" rx="9" ry="5" fill="${C.green}" transform="rotate(30 25 -24)"/>
     <path d="M-24 -10 L24 -10 L7 40 L-7 40 Z" fill="${C.kraft}" stroke="${C.kraftDark}" stroke-width="2" stroke-linejoin="round"/>
     <circle cx="-14" cy="-24" r="12" fill="${C.rose}"/>
     <circle cx="14" cy="-24" r="12" fill="${C.white}" stroke="${C.pink}" stroke-width="2"/>
     <circle cx="0" cy="-34" r="12" fill="${C.pink}" stroke="${C.rose}" stroke-width="2"/>
     <circle cx="0" cy="-22" r="4" fill="${C.roseDark}"/>
     <rect x="-8" y="2" width="16" height="5" rx="2" fill="${C.roseDark}"/>`,
    rot,
  );

const balloon = (x, y, color, s = 1) =>
  g(
    x,
    y,
    s,
    `<path d="M0 22 C-2 38 4 48 0 62" stroke="${C.inkLight}" stroke-width="1.5" fill="none"/>
     <ellipse cx="0" cy="0" rx="16" ry="21" fill="${color}"/>
     <path d="M-4 22 L4 22 L0 27 Z" fill="${color}"/>
     <ellipse cx="-6" cy="-7" rx="3.5" ry="6" fill="#fff" opacity=".5"/>`,
  );

const balloons = (s = 1, x = 0, y = 0) =>
  g(
    x,
    y,
    s,
    balloon(-22, -14, C.rose) + balloon(22, -12, '#a78bfa') + balloon(0, -30, '#fcd34d') + balloon(0, 4, C.sky),
  );

const teddy = (s = 1, x = 0, y = 0) =>
  g(
    x,
    y,
    s,
    `<circle cx="-17" cy="-30" r="8" fill="#c08457"/><circle cx="17" cy="-30" r="8" fill="#c08457"/>
     <ellipse cx="0" cy="22" rx="24" ry="26" fill="#c08457"/>
     <ellipse cx="0" cy="26" rx="14" ry="16" fill="#e5c19e"/>
     <circle cx="-26" cy="14" r="9" fill="#c08457"/><circle cx="26" cy="14" r="9" fill="#c08457"/>
     <circle cx="-14" cy="48" r="9" fill="#c08457"/><circle cx="14" cy="48" r="9" fill="#c08457"/>
     <circle cx="0" cy="-18" r="22" fill="#c08457"/>
     <ellipse cx="0" cy="-11" rx="10" ry="8" fill="#e5c19e"/>
     <circle cx="-8" cy="-23" r="2.5" fill="#3b2a1e"/><circle cx="8" cy="-23" r="2.5" fill="#3b2a1e"/>
     <ellipse cx="0" cy="-14" rx="3.5" ry="2.5" fill="#3b2a1e"/>
     <path d="M-9 4 L9 4 L0 10 Z" fill="${C.roseDark}"/>`,
  );

const giftBox = (s = 1, x = 0, y = 0) =>
  g(
    x,
    y,
    s,
    `<rect x="-30" y="-14" width="60" height="48" rx="3" fill="${C.pink}" stroke="${C.rose}" stroke-width="2"/>
     <rect x="-33" y="-24" width="66" height="14" rx="3" fill="${C.rose}"/>
     <rect x="-5" y="-24" width="10" height="58" fill="${C.white}"/>
     <path d="M0 -24 C-18 -46 -28 -24 0 -24 C28 -24 18 -46 0 -24Z" fill="${C.white}" stroke="${C.pink}" stroke-width="2"/>`,
  );

const flower = (r = 30, x = 0, y = 0, color = C.rose) => {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return `<circle cx="${(Math.cos(a) * r * 0.62).toFixed(1)}" cy="${(Math.sin(a) * r * 0.62).toFixed(1)}" r="${(r * 0.42).toFixed(1)}" fill="${color}"/>`;
  }).join('');
  return g(x, y, 1, `${petals}<circle r="${(r * 0.3).toFixed(1)}" fill="${C.sun}"/>`);
};

const camera = (x, y, rot = 0, s = 1) =>
  g(
    x,
    y,
    s,
    `<rect x="-13" y="-9" width="26" height="18" rx="4" fill="${C.cam}"/>
     <rect x="-6" y="-13" width="10" height="5" rx="1.5" fill="${C.cam}"/>
     <circle cx="0" cy="0" r="6.5" fill="${C.sky}" stroke="#fff" stroke-width="2"/>`,
    rot,
  );

/** Dashed sight line between two points, ending in an arrow head. */
const sight = (x1, y1, x2, y2) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx = (d) => (x2 - Math.cos(a + d) * 8).toFixed(1);
  const hy = (d) => (y2 - Math.sin(a + d) * 8).toFixed(1);
  return (
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.accent}" stroke-width="2" stroke-dasharray="5 4"/>` +
    `<path d="M${x2} ${y2} L${hx(0.45)} ${hy(0.45)} M${x2} ${y2} L${hx(-0.45)} ${hy(-0.45)}" stroke="${C.accent}" stroke-width="2" stroke-linecap="round"/>`
  );
};

const ground = (y = 168) => `<rect x="0" y="${y}" width="200" height="${200 - y}" fill="#fce7f3"/><line x1="0" y1="${y}" x2="200" y2="${y}" stroke="${C.pink}" stroke-width="2"/>`;

const label = (text, x, y, size = 12, fill = C.ink, anchor = 'middle') =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="700" fill="${fill}" text-anchor="${anchor}">${text}</text>`;

const head = (x, y, r = 12, color = C.skin) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
const body = (x, y, w, h, color = '#a5b4fc') =>
  `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" rx="${w / 3}" fill="${color}"/>`;
const hand = (x, y, r = 6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.skin}" stroke="#e8a87c" stroke-width="1"/>`;
const arm = (x1, y1, x2, y2, color = '#a5b4fc', w = 9) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;

/** Viewfinder frame with a thirds grid. */
const frame = (x, y, w, h, grid = true) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#fff" stroke="${C.inkLight}" stroke-width="2"/>` +
  (grid
    ? `<g stroke="${C.pink}" stroke-width="1"><line x1="${x + w / 3}" y1="${y}" x2="${x + w / 3}" y2="${y + h}"/><line x1="${x + (2 * w) / 3}" y1="${y}" x2="${x + (2 * w) / 3}" y2="${y + h}"/><line x1="${x}" y1="${y + h / 3}" x2="${x + w}" y2="${y + h / 3}"/><line x1="${x}" y1="${y + (2 * h) / 3}" x2="${x + w}" y2="${y + (2 * h) / 3}"/></g>`
    : '');

const clip = (id, x, y, w, h) => `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/></clipPath>`;

// ---- top view (looking down) used for horizontal camera angles -------------------------------

const topViewBouquet = (x, y) =>
  `<circle cx="${x}" cy="${y}" r="26" fill="${C.kraft}" stroke="${C.kraftDark}" stroke-width="2"/>` +
  `<circle cx="${x - 8}" cy="${y - 5}" r="11" fill="${C.rose}"/><circle cx="${x + 9}" cy="${y - 4}" r="11" fill="${C.white}" stroke="${C.pink}" stroke-width="2"/>` +
  `<circle cx="${x}" cy="${y + 9}" r="11" fill="${C.pink}" stroke="${C.rose}" stroke-width="2"/>`;

// ---- images -----------------------------------------------------------------------------------

const images = {};
const add = (step, id, markup, bg) => {
  (images[step] ??= {})[id] = svg(markup, bg);
};

// Camera angle ------------------------------------------------------------------------------
add('angle', 'eye-level', ground() + bouquet(1.15, 150, 118) + camera(38, 105, 0) + sight(58, 105, 112, 105) + label('eye level', 100, 28));
add(
  'angle',
  'three-quarter',
  `<circle cx="100" cy="95" r="62" fill="none" stroke="${C.pink}" stroke-dasharray="3 4"/>` +
    topViewBouquet(100, 95) +
    camera(52, 140, -45) +
    sight(64, 128, 86, 108) +
    label('top view · 45° to the side', 100, 28, 11),
);
add('angle', 'above-30', ground() + bouquet(1.1, 152, 120) + camera(40, 62, 20) + sight(56, 70, 120, 100) + `<path d="M76 106 A40 40 0 0 1 72 85" stroke="${C.ink}" fill="none" stroke-width="2"/>` + label('30°', 84, 126, 12) + `<line x1="40" y1="100" x2="130" y2="100" stroke="${C.inkLight}" stroke-dasharray="2 4"/>`);
add('angle', 'high-45', ground() + bouquet(1.1, 152, 120) + camera(46, 42, 38) + sight(60, 54, 128, 104) + label('45°', 82, 112, 12) + `<line x1="40" y1="100" x2="136" y2="100" stroke="${C.inkLight}" stroke-dasharray="2 4"/>`);
add('angle', 'top-down', ground() + bouquet(1.0, 100, 150, 90) + camera(100, 40, 90) + sight(100, 56, 100, 118) + label('directly above', 100, 24, 11));
add('angle', 'low', ground(150) + bouquet(1.1, 150, 98) + `<rect x="120" y="140" width="60" height="10" rx="3" fill="${C.kraftDark}"/>` + camera(40, 176, -22) + sight(56, 168, 118, 112) + label('looking up', 60, 28, 12));
add(
  'angle',
  'side',
  `<circle cx="100" cy="100" r="62" fill="none" stroke="${C.pink}" stroke-dasharray="3 4"/>` +
    topViewBouquet(88, 100) +
    camera(172, 100, 180) +
    sight(156, 100, 122, 100) +
    label('top view · 90°', 100, 28, 12),
);
add(
  'angle',
  'over-shoulder',
  ground() +
    bouquet(0.8, 140, 112) +
    `<circle cx="52" cy="112" r="26" fill="#3b2a1e"/>` +
    `<path d="M0 200 L0 168 Q50 128 108 168 L108 200 Z" fill="#a5b4fc"/>` +
    `<path d="M10 178 Q52 150 98 178" stroke="#818cf8" stroke-width="2" fill="none"/>` +
    label('over the shoulder', 118, 28, 11),
);
add('angle', 'detail', `<circle cx="100" cy="100" r="76" fill="#fff" stroke="${C.inkLight}" stroke-width="3"/>` + flower(46, 100, 100, C.rose) + `<circle cx="100" cy="100" r="76" fill="none" stroke="${C.accent}" stroke-width="3" stroke-dasharray="6 5"/>` + label('petals and texture', 100, 28, 11));

// Distance ----------------------------------------------------------------------------------
const distFrame = (inner) => `${clip('f', 30, 40, 140, 120)}${frame(30, 40, 140, 120, false)}<g clip-path="url(#f)">${inner}</g>`;
add('distance', 'macro', distFrame(flower(88, 100, 100, C.rose)) + label('macro', 100, 24));
add('distance', 'close', distFrame(bouquet(2.2, 100, 112)) + label('close-up', 100, 24));
add('distance', 'medium', distFrame(`<rect x="30" y="128" width="140" height="32" fill="#fce7f3"/>` + bouquet(1.15, 100, 108) + `<circle cx="58" cy="76" r="9" fill="${C.green}"/><circle cx="148" cy="82" r="7" fill="${C.green}"/>`) + label('medium', 100, 24));
add('distance', 'wide', distFrame(`<rect x="30" y="40" width="140" height="70" fill="${C.sky}"/><rect x="30" y="110" width="140" height="50" fill="#bbf7d0"/><circle cx="60" cy="110" r="18" fill="${C.green}"/><circle cx="150" cy="104" r="22" fill="${C.greenDark}"/>` + bouquet(0.42, 100, 138)) + label('wide', 100, 24));

// Product position --------------------------------------------------------------------------
const posFrame = (inner, bg = '#fff') => `${clip('p', 30, 40, 140, 120)}${frame(30, 40, 140, 120)}<g clip-path="url(#p)">${inner}</g>`;
add('position', 'center', posFrame(bouquet(0.85, 100, 100)) + label('center', 100, 24));
add('position', 'left-third', posFrame(bouquet(0.85, 77, 100)) + label('left third', 100, 24));
add('position', 'right-third', posFrame(bouquet(0.85, 123, 100)) + label('right third', 100, 24));
add(
  'position',
  'foreground',
  posFrame(`<rect x="30" y="40" width="140" height="80" fill="${C.sky}" opacity=".6"/><circle cx="64" cy="82" r="16" fill="${C.green}" opacity=".5"/><circle cx="140" cy="76" r="22" fill="${C.greenDark}" opacity=".4"/>` + bouquet(1.6, 100, 140)) + label('foreground', 100, 24),
);
add('position', 'lower', posFrame(bouquet(0.75, 100, 130)) + label('lower part', 100, 24));

// Image set: what changes ---------------------------------------------------------------------
const trio = (a, b, c) => [a, b, c].map((m, i) => `<rect x="${12 + i * 63}" y="64" width="52" height="72" rx="5" fill="#fff" stroke="${C.inkLight}" stroke-width="2"/>${m(12 + i * 63)}`).join('');
add('imageSet', 'angle', trio(
  (x) => bouquet(0.55, x + 26, 100) + camera(x + 8, 124, -30, 0.6),
  (x) => bouquet(0.55, x + 26, 100) + camera(x + 26, 80, 90, 0.6),
  (x) => bouquet(0.55, x + 26, 100) + camera(x + 44, 124, 210, 0.6),
) + label('same scene · new viewpoint', 100, 40, 11) + label('1   2   3', 100, 164, 12, C.inkLight));
add('imageSet', 'distance', trio(
  (x) => bouquet(0.95, x + 26, 100),
  (x) => bouquet(0.65, x + 26, 100),
  (x) => bouquet(0.38, x + 26, 100),
) + label('same scene · closer / farther', 100, 40, 11) + label('1   2   3', 100, 164, 12, C.inkLight));
add('imageSet', 'position', trio(
  (x) => bouquet(0.55, x + 14, 100),
  (x) => bouquet(0.55, x + 26, 100),
  (x) => bouquet(0.55, x + 38, 100),
) + label('same scene · product moves', 100, 40, 11) + label('1   2   3', 100, 164, 12, C.inkLight));

// Product -----------------------------------------------------------------------------------
add('product', 'bouquet', ground() + bouquet(1.5, 100, 108));
add('product', 'balloons', ground() + balloons(1.35, 100, 96));
add('product', 'teddy', ground() + teddy(1.3, 100, 114));
add('product', 'gift-box', ground() + giftBox(1.55, 100, 118));
add('product', 'bouquet-teddy', ground() + teddy(0.95, 72, 124) + bouquet(1.15, 130, 112));
add('product', 'bouquet-balloons', ground() + balloons(0.9, 128, 66) + bouquet(1.15, 74, 116));
add('product', 'custom', `<rect x="48" y="52" width="104" height="96" rx="14" fill="#fff" stroke="${C.rose}" stroke-width="3" stroke-dasharray="7 6"/>` + `<path d="M72 128 L72 104 L116 60 L132 76 L88 120 Z" fill="${C.pink}" stroke="${C.roseDark}" stroke-width="2.5" stroke-linejoin="round"/>` + label('describe it', 100, 172, 12, C.ink));

// Background --------------------------------------------------------------------------------
const mini = (s = 0.7) => bouquet(s, 100, 128);
add('background', 'white-studio', `<ellipse cx="100" cy="164" rx="46" ry="8" fill="#e2e8f0"/>` + mini(0.95), '#ffffff');
add('background', 'solid-color', `<ellipse cx="100" cy="166" rx="46" ry="8" fill="#be185d" opacity=".25"/>` + mini(0.95) + `<circle cx="164" cy="38" r="12" fill="#fff" opacity=".7"/><circle cx="164" cy="38" r="8" fill="#f9a8d4"/>`, '#f9a8d4');
add('background', 'home', `<rect x="26" y="30" width="62" height="70" rx="3" fill="${C.sky}" stroke="#fff" stroke-width="5"/><line x1="57" y1="30" x2="57" y2="100" stroke="#fff" stroke-width="4"/><rect x="118" y="46" width="52" height="64" rx="3" fill="#fde68a" stroke="#fbbf24" stroke-width="2"/><circle cx="144" cy="78" r="14" fill="#fff" opacity=".7"/><rect x="0" y="150" width="200" height="50" fill="#d6b99a"/><rect x="104" y="130" width="76" height="22" rx="8" fill="#94a3b8"/>` + mini(0.65), '#fff7ed');
add('background', 'hotel', `<rect x="22" y="40" width="156" height="34" rx="6" fill="#92400e"/><rect x="14" y="86" width="172" height="56" rx="8" fill="#fff"/><rect x="14" y="108" width="172" height="34" rx="8" fill="#fbcfe8"/><rect x="26" y="90" width="44" height="18" rx="6" fill="#e2e8f0"/><rect x="130" y="90" width="44" height="18" rx="6" fill="#e2e8f0"/><rect x="0" y="160" width="200" height="40" fill="#d6b99a"/>` + bouquet(0.55, 100, 108), '#fef3c7');
add('background', 'cafe', `<rect x="22" y="26" width="156" height="84" rx="4" fill="${C.sky}" stroke="#fff" stroke-width="5"/><circle cx="64" cy="60" r="14" fill="${C.green}"/><circle cx="140" cy="70" r="18" fill="${C.greenDark}"/><ellipse cx="100" cy="134" rx="84" ry="14" fill="#a16207"/><rect x="94" y="146" width="12" height="46" fill="#78350f"/><rect x="124" y="108" width="22" height="20" rx="4" fill="#fff" stroke="${C.inkLight}"/><path d="M146 114 a6 6 0 1 1 0 10" fill="none" stroke="${C.inkLight}" stroke-width="2"/>` + bouquet(0.55, 76, 106), '#fff7ed');
add('background', 'tropical', `<path d="M0 200 L0 60 Q40 20 70 80 Q30 90 40 200Z" fill="${C.greenDark}"/><path d="M200 200 L200 50 Q160 10 130 76 Q172 90 160 200Z" fill="#15803d"/><path d="M40 200 Q60 120 100 110 Q80 150 90 200Z" fill="${C.green}"/><ellipse cx="148" cy="86" rx="22" ry="10" fill="${C.green}" transform="rotate(-30 148 86)"/><circle cx="52" cy="40" r="8" fill="${C.rose}"/><circle cx="168" cy="140" r="7" fill="${C.rose}"/>` + bouquet(0.6, 100, 138), '#dcfce7');
add('background', 'beach', `<rect width="200" height="96" fill="#fdba74"/><rect y="40" width="200" height="56" fill="#fb923c" opacity=".5"/><circle cx="100" cy="88" r="30" fill="#fde047"/><rect y="88" width="200" height="40" fill="#38bdf8"/><path d="M0 100 Q50 94 100 100 T200 100" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/><rect y="128" width="200" height="72" fill="#fde68a"/>` + bouquet(0.6, 100, 150), '#fdba74');
add('background', 'thai-temple', `<rect y="150" width="200" height="50" fill="#fde68a"/><path d="M100 22 L106 56 L116 56 L108 76 L122 76 L112 98 L130 98 L118 126 L142 126 L128 150 L72 150 L58 126 L82 126 L70 98 L88 98 L78 76 L92 76 L84 56 L94 56Z" fill="#fbbf24" stroke="#b45309" stroke-width="2" stroke-linejoin="round"/><rect x="90" y="110" width="20" height="40" rx="10" fill="#b45309" opacity=".7"/><path d="M20 150 L20 112 L32 98 L44 112 L44 150Z" fill="#f59e0b" opacity=".7"/><path d="M156 150 L156 112 L168 98 L180 112 L180 150Z" fill="#f59e0b" opacity=".7"/>` + bouquet(0.55, 100, 160), '#fef3c7');

// Blur --------------------------------------------------------------------------------------
const blurDefs = (id, d) => `<defs><filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${d}"/></filter></defs>`;
const bgSpots = `<circle cx="40" cy="60" r="22" fill="${C.green}"/><circle cx="160" cy="50" r="28" fill="#a78bfa"/><circle cx="150" cy="140" r="24" fill="${C.sun}"/><circle cx="46" cy="140" r="20" fill="${C.rose}"/>`;
add('blur', 'none', bgSpots + bouquet(1.2, 100, 108) + label('all sharp', 100, 24, 12));
add('blur', 'soft', blurDefs('b', 7) + `<g filter="url(#b)">${bgSpots}</g>` + bouquet(1.2, 100, 108) + label('soft background', 100, 24, 12));
add('blur', 'bokeh', `<rect width="200" height="200" fill="#1e1b4b"/>` + [[36, 48, 20], [150, 40, 26], [170, 120, 18], [30, 130, 24], [96, 30, 12], [120, 168, 14], [60, 90, 9]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${['#fde68a', '#fbcfe8', '#fff'][i % 3]}" opacity=".55"/>`).join('') + bouquet(1.2, 100, 108) + label('bokeh', 100, 24, 12, '#fff'), '#1e1b4b');
add('blur', 'foreground', blurDefs('b', 6) + bouquet(1.2, 100, 108) + `<g filter="url(#b)"><ellipse cx="14" cy="170" rx="50" ry="22" fill="${C.green}" transform="rotate(-25 14 170)"/><ellipse cx="190" cy="176" rx="50" ry="20" fill="${C.greenDark}" transform="rotate(25 190 176)"/><circle cx="180" cy="30" r="22" fill="${C.pink}"/><circle cx="20" cy="26" r="18" fill="${C.pink}"/></g>` + label('blurred edges', 100, 24, 12));

// Person ------------------------------------------------------------------------------------
add('person', 'none', ground() + bouquet(1.3, 100, 112) + label('no people', 100, 28));
add('person', 'hands', ground(180) + arm(40, 190, 92, 120) + arm(160, 190, 108, 120) + hand(92, 116, 8) + hand(108, 116, 8) + bouquet(1.0, 100, 90) + label('hands only', 100, 24, 12));
add('person', 'partial', ground(190) + body(100, 96, 84, 110) + arm(62, 110, 90, 150) + arm(138, 110, 110, 150) + bouquet(1.0, 100, 134) + label('face not shown', 100, 24, 12));
add('person', 'full', ground(180) + head(100, 52, 14) + body(100, 68, 36, 64) + `<rect x="86" y="128" width="12" height="46" rx="5" fill="#64748b"/><rect x="102" y="128" width="12" height="46" rx="5" fill="#64748b"/>` + arm(84, 80, 94, 112) + arm(116, 80, 106, 112) + bouquet(0.55, 100, 116) + label('full person', 100, 20, 12));

// Interaction (two small figures; the product is a mini bouquet) -------------------------------
const figure = (x, flip = 1) => head(x, 62, 13) + body(x, 78, 34, 62) + `<rect x="${x - 13}" y="138" width="11" height="34" rx="4" fill="#64748b"/><rect x="${x + 2}" y="138" width="11" height="34" rx="4" fill="#64748b"/>`;
const mb = (x, y, r = 0) => bouquet(0.5, x, y, r);
add('interaction', 'holding', ground(176) + figure(100) + arm(88, 92, 96, 118) + arm(112, 92, 104, 118) + mb(100, 108) + label('holding in front', 100, 24, 12));
add('interaction', 'hugging', ground(176) + figure(100) + mb(100, 112, 90) + arm(86, 92, 112, 112) + arm(114, 92, 90, 118) + label('hugging', 100, 24, 12));
add('interaction', 'giving', ground(176) + figure(54) + figure(148) + arm(68, 94, 112, 106) + mb(116, 104, 90) + arm(134, 96, 122, 108) + label('giving', 100, 24, 12));
add('interaction', 'receiving', ground(176) + figure(54) + figure(148) + arm(134, 94, 90, 106) + mb(86, 104, -90) + arm(68, 96, 80, 108) + label('receiving', 100, 24, 12));
add('interaction', 'smelling', ground(176) + figure(100) + arm(88, 92, 96, 70) + arm(112, 92, 104, 70) + mb(100, 62, 0) + `<circle cx="100" cy="62" r="13" fill="${C.skin}" opacity=".0"/>` + label('smelling flowers', 100, 24, 12));
add('interaction', 'carrying', ground(176) + figure(100) + arm(84, 92, 82, 124, '#a5b4fc') + arm(116, 92, 120, 118) + mb(126, 108, -25) + label('carrying in arm', 100, 24, 12));
add('interaction', 'placing', ground(176) + figure(54) + `<rect x="104" y="124" width="84" height="10" rx="3" fill="#a16207"/><rect x="112" y="134" width="8" height="42" fill="#78350f"/><rect x="172" y="134" width="8" height="42" fill="#78350f"/>` + arm(68, 94, 110, 112) + mb(138, 106, 0) + label('placing on table', 100, 24, 12));

// Lighting ----------------------------------------------------------------------------------
add('lighting', 'soft-daylight', `<rect x="14" y="20" width="62" height="74" rx="3" fill="${C.sky}" stroke="#fff" stroke-width="5"/><path d="M76 30 L170 120 L120 150 L76 90Z" fill="#fff" opacity=".6"/><path d="M76 24 L180 130 L160 160 L76 84Z" fill="#fef9c3" opacity=".5"/>` + ground() + bouquet(1.05, 116, 120) + label('soft daylight', 100, 188, 11), '#fffbeb');
add('lighting', 'golden-hour', `<circle cx="150" cy="60" r="30" fill="#fde047"/><circle cx="150" cy="60" r="46" fill="#fb923c" opacity=".3"/>` + ground() + bouquet(1.1, 84, 118) + `<ellipse cx="124" cy="168" rx="40" ry="5" fill="#9a3412" opacity=".25"/>` + label('golden hour', 100, 188, 11), '#fed7aa');
add('lighting', 'bright-studio', `<rect x="44" y="18" width="112" height="30" rx="6" fill="#fff" stroke="${C.inkLight}" stroke-width="2"/><path d="M52 48 L28 140 M148 48 L172 140" stroke="#fde68a" stroke-width="2" stroke-dasharray="4 4"/><path d="M52 48 L148 48 L172 160 L28 160Z" fill="#fff" opacity=".75"/>` + `<ellipse cx="100" cy="166" rx="44" ry="7" fill="#e2e8f0"/>` + bouquet(1.0, 100, 118) + label('bright studio', 100, 188, 11), '#f8fafc');
add('lighting', 'warm-evening', `<rect width="200" height="200" fill="#431407"/><path d="M100 30 L40 160 L160 160Z" fill="#fbbf24" opacity=".28"/><rect x="92" y="26" width="16" height="6" fill="#92400e"/><path d="M84 52 Q100 24 116 52Z" fill="#f59e0b"/><circle cx="100" cy="54" r="7" fill="#fef08a"/>` + `<rect y="164" width="200" height="36" fill="#7c2d12"/>` + bouquet(1.0, 100, 120) + label('warm evening', 100, 190, 11, '#fed7aa'), '#431407');
add('lighting', 'overcast', `<g fill="#cbd5e1"><circle cx="62" cy="52" r="22"/><circle cx="90" cy="42" r="28"/><circle cx="124" cy="52" r="24"/><circle cx="148" cy="60" r="16"/><rect x="48" y="52" width="112" height="24" rx="12"/></g><g fill="#e2e8f0"><circle cx="80" cy="58" r="14"/><circle cx="108" cy="58" r="16"/></g>` + `<path d="M70 82 L60 140 M100 82 L100 140 M130 82 L140 140" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="2 6"/>` + ground() + bouquet(1.0, 100, 124) + label('overcast', 100, 190, 11), '#f1f5f9');

// Style -------------------------------------------------------------------------------------
add('style', 'ecommerce', `<rect x="30" y="26" width="140" height="148" rx="8" fill="#fff" stroke="#e2e8f0" stroke-width="2"/><ellipse cx="100" cy="150" rx="38" ry="6" fill="#e2e8f0"/>` + bouquet(1.15, 100, 104), '#f8fafc');
add('style', 'lifestyle', `<rect width="200" height="200" fill="#fef3c7"/><rect y="132" width="200" height="68" fill="#d6b99a"/><rect x="132" y="86" width="42" height="46" rx="5" fill="#fff"/><path d="M174 98 a10 10 0 1 1 0 20" fill="none" stroke="#fff" stroke-width="5"/><rect x="26" y="34" width="46" height="60" rx="3" fill="${C.sky}" stroke="#fff" stroke-width="5"/>` + bouquet(1.0, 92, 118), '#fef3c7');
add('style', 'editorial', `<rect x="20" y="12" width="160" height="176" fill="#fff" stroke="#0f172a" stroke-width="3"/><text x="100" y="46" font-size="22" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="3" font-family="Georgia, serif">BLOOM</text><line x1="34" y1="54" x2="166" y2="54" stroke="#0f172a" stroke-width="1.5"/>` + bouquet(1.0, 100, 114) + `<rect x="34" y="162" width="70" height="4" fill="#0f172a"/><rect x="34" y="171" width="44" height="3" fill="${C.inkLight}"/>`, '#e2e8f0');
add('style', 'film', `<rect width="200" height="200" fill="#1c1917"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${8 + i * 24}" y="10" width="12" height="8" rx="2" fill="#fafaf9"/><rect x="${8 + i * 24}" y="182" width="12" height="8" rx="2" fill="#fafaf9"/>`).join('')}<rect x="14" y="26" width="172" height="148" fill="#fde68a"/>` + bouquet(1.15, 100, 102) + `<rect x="14" y="26" width="172" height="148" fill="#b45309" opacity=".18"/>` + Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 47) % 172 + 14}" cy="${(i * 31) % 148 + 26}" r="1" fill="#44403c" opacity=".4"/>`).join(''), '#1c1917');
add('style', 'pastel', `<rect x="40" y="30" width="120" height="150" rx="60" fill="#e9d5ff"/><circle cx="150" cy="156" r="26" fill="#fbcfe8"/><circle cx="48" cy="164" r="16" fill="#bae6fd"/><ellipse cx="100" cy="158" rx="32" ry="5" fill="#c4b5fd" opacity=".6"/>` + bouquet(1.05, 100, 112), '#faf5ff');

// Format ------------------------------------------------------------------------------------
const ratio = (w, h, text) => {
  const k = Math.min(140 / w, 140 / h);
  const rw = w * k;
  const rh = h * k;
  return `<rect x="${100 - rw / 2}" y="${100 - rh / 2}" width="${rw}" height="${rh}" rx="6" fill="#fff" stroke="${C.rose}" stroke-width="3"/>` + bouquet(Math.min(rw, rh) / 150, 100, 100) + label(text, 100, 190, 14, C.roseDark);
};
add('format', 'square', ratio(1, 1, '1:1'));
add('format', 'vertical-4-5', ratio(4, 5, '4:5'));
add('format', 'vertical-9-16', ratio(9, 16, '9:16'));
add('format', 'horizontal-16-9', ratio(16, 9, '16:9'));

// Purpose -----------------------------------------------------------------------------------
add('purpose', 'website', `<rect x="22" y="30" width="156" height="140" rx="8" fill="#fff" stroke="${C.inkLight}" stroke-width="2"/><rect x="22" y="30" width="156" height="20" rx="8" fill="#e2e8f0"/><circle cx="36" cy="40" r="3.5" fill="${C.rose}"/><circle cx="48" cy="40" r="3.5" fill="${C.sun}"/><circle cx="60" cy="40" r="3.5" fill="${C.green}"/>` + bouquet(0.85, 100, 106) + `<rect x="62" y="150" width="76" height="10" rx="5" fill="${C.rose}"/>`);
add('purpose', 'instagram', `<rect x="34" y="18" width="132" height="164" rx="8" fill="#fff" stroke="${C.inkLight}" stroke-width="2"/><circle cx="50" cy="34" r="7" fill="${C.rose}"/><rect x="62" y="31" width="46" height="6" rx="3" fill="#e2e8f0"/><rect x="34" y="48" width="132" height="102" fill="#fce7f3"/>` + bouquet(0.85, 100, 100) + `<path d="M50 168 c-9 -7 -9 -14 -3 -14 c3 0 3 3 3 3 c0 0 0 -3 3 -3 c6 0 6 7 -3 14Z" fill="${C.roseDark}"/><rect x="72" y="162" width="60" height="5" rx="2.5" fill="#e2e8f0"/>`);
add('purpose', 'stories', `<rect x="62" y="12" width="76" height="176" rx="12" fill="#fff" stroke="${C.ink}" stroke-width="3"/><rect x="72" y="24" width="56" height="12" rx="3" fill="${C.pink}" stroke="${C.rose}" stroke-dasharray="3 2"/><rect x="72" y="164" width="56" height="12" rx="3" fill="${C.pink}" stroke="${C.rose}" stroke-dasharray="3 2"/>` + bouquet(0.7, 100, 100) + label('text', 100, 33, 8, C.roseDark) + label('text', 100, 173, 8, C.roseDark));
add('purpose', 'banner', `<rect x="12" y="52" width="176" height="96" rx="8" fill="#fff" stroke="${C.inkLight}" stroke-width="2"/>` + bouquet(0.85, 56, 100) + `<rect x="104" y="76" width="68" height="8" rx="4" fill="${C.ink}"/><rect x="104" y="92" width="52" height="6" rx="3" fill="${C.inkLight}"/><rect x="104" y="112" width="34" height="12" rx="6" fill="${C.rose}"/>`);

// ---- write -------------------------------------------------------------------------------------
let count = 0;
for (const [step, byId] of Object.entries(images)) {
  mkdirSync(join(OUT, step), { recursive: true });
  for (const [id, markup] of Object.entries(byId)) {
    writeFileSync(join(OUT, step, `${id}.svg`), markup + '\n');
    count += 1;
  }
}
console.log(`Wrote ${count} placeholder SVGs to ${OUT}`);
