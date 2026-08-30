import type { StyleSceneRef } from '../types';

export const BUILT_IN_STYLE_REFS: StyleSceneRef[] = [
  {
    id: 'luxury-woman-hold-noface',
    style: 'luxury-promo',
    name: 'Woman holding bouquet',
    prompt:
      'Luxury florist campaign, understated, romantic, realistic.\n\nWoman cropped from just below the nose to mid-thigh; eyes and most of the face out of frame. Dark hair pulled neatly back. Minimal sleeveless ivory/white V-neck fitted dress, very delicate understated jewelry.\n\nShe holds the exact reference bouquet with both hands at waist level, slightly to the right of her body. Bouquet is large and dominant, covering much of her torso, blooms facing slightly toward the camera, occupying about half the frame width.\n\nPlain warm-gray seamless studio. No furniture, decorations, or extra objects. Soft diffused studio light, slightly directional, gentle shadows, muted neutrals, realistic skin and flower texture — not glossy or overly bright.\n\nModel slightly left of center; bouquet centered/right as the main focus. Leave a calm lower band (~24%) for product-name type.',
    imageUrl: '/style-refs/luxury/luxury-woman-hold-noface.png',
    builtIn: true,
  },
  {
    id: 'luxury-travertine-plinth',
    style: 'luxury-promo',
    name: 'Travertine plinth',
    prompt:
      'Empty high-end studio: the product sits on a minimalist architectural travertine stone plinth. Warm dramatic directional light with a subtle amber rim, deep charcoal falloff, authentic stone texture. Keep the lower quarter of the frame calm and uncluttered for headline type. No extra props, no text.',
    imageUrl: '/style-refs/luxury/luxury-travertine-plinth.jpg',
    builtIn: true,
  },
  {
    id: 'luxury-draped-silk',
    style: 'luxury-promo',
    name: 'Draped silk',
    prompt:
      'Empty luxury set: softly draped champagne and charcoal silk fabric as the surface and backdrop, elegant folds catching warm rim light. Rich, deep, refined tonality. Gift-like prestige. Leave a calm dark-to-soft lower band (about 24%) free of objects for product-name type. No text, no logos.',
    imageUrl: '/style-refs/luxury/luxury-draped-silk.jpg',
    builtIn: true,
  },
  {
    id: 'luxury-dark-marble',
    style: 'luxury-promo',
    name: 'Dark marble',
    prompt:
      'Empty editorial studio: dark honed marble pedestal with polished reflections and a warm gold rim light in a moody, deep studio. Dramatic yet soft directional falloff. Keep the lower third quiet and dark so a product name can sit on the photo. No extra props competing with the hero, no text.',
    imageUrl: '/style-refs/luxury/luxury-dark-marble.jpg',
    builtIn: true,
  },
  {
    id: 'promo-nursery-wood',
    style: 'styled-promo',
    name: 'Nursery wood',
    prompt:
      'Empty lifestyle set: a smooth blonde wooden play table in a sunlit Scandinavian nursery, pale walls, soft shallow depth-of-field blur. Warm golden daylight. Place the product as the crisp hero in the upper two-thirds. Leave a clean, uncluttered lower band (about 22%) with soft falloff for a product-name headline. No text.',
    imageUrl: '/style-refs/promo/promo-nursery-wood.jpg',
    builtIn: true,
  },
  {
    id: 'promo-linen-table',
    style: 'styled-promo',
    name: 'Linen table',
    prompt:
      'Empty lifestyle set: a sunlit natural linen table with airy window light, cream and beige palette, gentle bokeh. Warm commercial atmosphere. Keep the product sharp in the upper two-thirds. Leave about the bottom 22% calm and uncluttered for a product name and selling line. No busy props, no text.',
    imageUrl: '/style-refs/promo/promo-linen-table.jpg',
    builtIn: true,
  },
  {
    id: 'promo-pale-marble',
    style: 'styled-promo',
    name: 'Pale marble',
    prompt:
      'Empty lifestyle set: a pale marble counter in an airy boutique or florist-shop interior, soft natural daylight, cream and sage background bokeh. Tasteful, warm, commercial. Product stays the crisp foreground hero in the upper two-thirds. Leave a clean lower band (about 22%) for headline type. No text, no logos.',
    imageUrl: '/style-refs/promo/promo-pale-marble.jpg',
    builtIn: true,
  },
];
