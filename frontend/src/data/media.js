
const placeholder = (width, height, color = 'd6d0c8') =>
  `https://placehold.co/${width}x${height}/${color}/ffffff?text=Campaign+Placeholder`

export const media = {
  hero: placeholder(1600, 900, '92877d'),

  collections: [
    placeholder(800, 1100, 'c7b9a9'),
    placeholder(800, 1100, 'a99e93'),
  ],

  products: [
    placeholder(800, 1100, 'd6d0c8'),
    placeholder(800, 1100, 'c5b8aa'),
    placeholder(800, 1100, 'b5aaa0'),
    placeholder(800, 1100, 'e0d9d1'),
  ],

  campaignVideo: '',
}
