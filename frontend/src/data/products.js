
const image = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`

const placeholderImages = [
  image('photo-1539109136881-3be0616acf4b'),
  image('photo-1649937408746-4d2f603f91c8'),
  image('photo-1579419833240-d70be757967a'),
]

const standardSizes = ['XS', 'S', 'M', 'L', 'XL']

function makePlaceholderProduct({
  id,
  slug,
  name,
  price,
  category,
  createdAt,
  colors = ['Black', 'White'],
  sizes = standardSizes,
  availableSizes = sizes,
  imageIndex = 0,
}) {
  const palette = {
    White: '#ffffff',
    Black: '#000000',
    Brown: '#796e6d',
    'Dark Brown': '#49372c',
    Beige: '#ddcfbd',
    Grey: '#696969',
    Blue: '#d7f7fb',
  }

  const colorVariants = colors.map((color, index) => ({
    name: color,
    hex: palette[color] || '#b0aaa4',
    images: [
      placeholderImages[(imageIndex + index) % placeholderImages.length],
      placeholderImages[(imageIndex + index + 1) % placeholderImages.length],
    ],
  }))

  return {
    id,
    slug,
    name,
    price,
    currency: 'NGN',
    category,
    createdAt,
    description: `A considered ${name.toLowerCase()} with a contemporary silhouette and refined finishing. Designed to complement the modern wardrobe.`,
    features: [
      'Contemporary silhouette',
      'Thoughtfully considered details',
      'Designed for versatile styling',
      'Refer to the size guide for fit information',
    ],
    material: 'Premium fabric blend',
    madeIn: 'Nigeria',
    care: 'Follow the care instructions on the garment label.',
    colors: colorVariants,
    images: colorVariants[0].images,
    sizes,
    availableSizes,
    details: [
      { label: 'Color', value: colors.join(', ') },
      { label: 'Fit', value: 'Refer to the size guide for fit information' },
      { label: 'Material', value: 'Premium fabric blend' },
      { label: 'Care', value: 'Follow the care instructions on the garment label' },
      { label: 'Origin', value: 'Made in Nigeria' },
    ],
    delivery: {
      heading: 'Delivery information',
      paragraphs: [
        'Orders are processed after payment confirmation. Available delivery methods and charges are displayed at checkout.',
        'Delivery times depend on your location and courier. Tracking information will be shared when available.',
        'For assistance with delivery, exchanges or returns, contact our customer team.',
      ],
    },
    matchingProducts: [],
    featured: false,
    isPlaceholder: true,
  }
}

const products = [
  {
    id: '001',
    slug: 'wool-peplum-jacket',
    name: 'Wool Peplum Jacket',
    price: 745000,
    currency: 'NGN',
    category: 'Casual Wear',
    createdAt: '2026-10-01',
    description:
      'A fitted jacket crafted from a double-faced wool blend with a sculpted silhouette. Designed to contour the body, it features a defined waist, a feminine peplum hem and functional front button fastenings.',
    features: [
      'Double-faced wool blend',
      'Slim tailored fit with peplum',
      'Functional inset front pockets',
      'True to size — choose your usual size',
    ],
    material: '76% wool, 18% acrylic, 6% cashmere',
    madeIn: 'China',
    care: 'Do not wash. Do not bleach. Do not tumble dry. Iron at low temperature. Dry clean.',
    colors: [
      {
        name: 'Dark Brown',
        hex: '#49372c',
        images: [
          image('photo-1610935591850-9a3bf14810c0'),
          image('photo-1591047139829-d91aecb6caea'),
          image('photo-1539109136881-3be0616acf4b'),
        ],
      },
      {
        name: 'Black',
        hex: '#202020',
        images: [
          image('photo-1548126032-079a0fb0099d'),
          image('photo-1591047139829-d91aecb6caea'),
        ],
      },
    ],
    sizes: standardSizes,
    availableSizes: ['XS', 'S', 'M', 'XL'],
    details: [
      { label: 'Color', value: 'Dark Brown' },
      { label: 'Fit', value: 'The model is 177 cm and wears size XS' },
      { label: 'Care', value: 'Dry clean only. Iron at low temperature.' },
      { label: 'Material', value: '76% wool, 18% acrylic, 6% cashmere' },
      { label: 'Origin', value: 'Made in China' },
    ],
    delivery: {
      heading: 'Delivery information',
      paragraphs: [
        'Orders are processed after payment confirmation. Delivery estimates and available shipping methods are provided at checkout.',
        'Delivery times depend on your location and the courier. Tracking information will be shared when available.',
        'For returns, exchanges or delivery issues, contact our customer team before sending an item back.',
      ],
    },
    matchingProducts: ['002', '006'],
    featured: true,
  },

  {
    id: '002',
    slug: 'ruffled-wool-scarf',
    name: 'Ruffled Wool Scarf',
    price: 500000,
    currency: 'NGN',
    category: 'Accessories',
    createdAt: '2026-09-24',
    description:
      'A sculptural wool-blend scarf with soft, layered folds. An expressive finishing piece designed to complement tailored silhouettes.',
    features: [
      'Soft wool-blend fabric',
      'Sculptural layered shape',
      'Designed for versatile styling',
    ],
    material: 'Wool blend',
    care: 'Dry clean only.',
    colors: [
      {
        name: 'Dark Brown',
        hex: '#49372c',
        images: [
          image('photo-1601924994987-69e26d50dc26'),
          image('photo-1548624149-f0a6c9c7e7e1'),
        ],
      },
    ],
    sizes: ['One Size'],
    availableSizes: ['One Size'],
    details: [
      { label: 'Color', value: 'Dark Brown' },
      { label: 'Fit', value: 'One size' },
      { label: 'Material', value: 'Wool blend' },
      { label: 'Care', value: 'Dry clean only' },
    ],
    delivery: {
      heading: 'Delivery information',
      paragraphs: [
        'Orders are processed after payment confirmation. Available delivery methods and charges are displayed at checkout.',
        'For assistance with your order, delivery or returns, contact our customer team.',
      ],
    },
    matchingProducts: ['001', '006'],
    featured: true,
  },

  makePlaceholderProduct({
    id: '003', slug: 'ela-knitted-t-shirt',
    name: 'Ela Knitted T-Shirt', price: 320000,
    category: 'Casual Wear', createdAt: '2026-10-20',
    colors: ['White', 'Beige', 'Black'], imageIndex: 0,
  }),

  makePlaceholderProduct({
    id: '004', slug: 'sculpted-knit-top',
    name: 'Sculpted Knit Top', price: 285000,
    category: 'Casual Wear', createdAt: '2026-10-18',
    colors: ['Grey', 'Black'], imageIndex: 1,
  }),

  makePlaceholderProduct({
    id: '005', slug: 'high-waist-pencil-skirt',
    name: 'High Waist Pencil Skirt', price: 300000,
    category: 'Casual Wear', createdAt: '2026-10-15',
    colors: ['Black', 'White'], imageIndex: 2,
    availableSizes: ['XS', 'S', 'M', 'L'],
  }),

  makePlaceholderProduct({
    id: '006', slug: 'tailored-wool-coat',
    name: 'Tailored Wool Coat', price: 890000,
    category: 'Casual Wear', createdAt: '2026-10-12',
    colors: ['Brown', 'Black', 'Beige'], imageIndex: 0,
    availableSizes: ['S', 'M', 'L', 'XL'],
  }),

  makePlaceholderProduct({
    id: '007', slug: 'relaxed-linen-trousers',
    name: 'Relaxed Linen Trousers', price: 265000,
    category: 'Casual Wear', createdAt: '2026-10-10',
    colors: ['Beige', 'White', 'Black'], imageIndex: 1,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', '24', '26', '28', '30'],
  }),

  makePlaceholderProduct({
    id: '008', slug: 'oversized-tailored-blazer',
    name: 'Oversized Tailored Blazer', price: 560000,
    category: 'Casual Wear', createdAt: '2026-10-08',
    colors: ['Grey', 'Black', 'Beige'], imageIndex: 2,
  }),

  makePlaceholderProduct({
    id: '009', slug: 'draped-evening-dress',
    name: 'Draped Evening Dress', price: 480000,
    category: 'Casual Wear', createdAt: '2026-10-06',
    colors: ['Black', 'Blue', 'Brown'], imageIndex: 0,
    availableSizes: ['XS', 'S', 'M', 'XL'],
  }),

  makePlaceholderProduct({
    id: '010', slug: 'minimal-midi-dress',
    name: 'Minimal Midi Dress', price: 395000,
    category: 'Casual Wear', createdAt: '2026-10-04',
    colors: ['White', 'Beige', 'Black'], imageIndex: 1,
  }),

  makePlaceholderProduct({
    id: '011', slug: 'pleated-midi-skirt',
    name: 'Pleated Midi Skirt', price: 275000,
    category: 'Casual Wear', createdAt: '2026-09-29',
    colors: ['Beige', 'Grey', 'Black'], imageIndex: 2,
  }),

  makePlaceholderProduct({
    id: '012', slug: 'wide-leg-shorts',
    name: 'Wide Leg Shorts', price: 185000,
    category: 'Casual Wear', createdAt: '2026-09-22',
    colors: ['White', 'Brown'], imageIndex: 0,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
    availableSizes: ['XS', 'S', 'M', 'L', '24', '26', '28'],
  }),

  makePlaceholderProduct({
    id: '013', slug: 'minimal-swimwear-set',
    name: 'Minimal Swimwear Set', price: 210000,
    category: 'Casual Wear', createdAt: '2026-09-18',
    colors: ['Black', 'Blue', 'White'], imageIndex: 1,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availableSizes: ['XS', 'S', 'M', 'L'],
  }),

  makePlaceholderProduct({
    id: '014', slug: 'structured-shoulder-bag',
    name: 'Structured Shoulder Bag', price: 350000,
    category: 'Accessories', createdAt: '2026-09-15',
    colors: ['Black', 'Brown', 'Beige'], imageIndex: 2,
    sizes: ['One Size'],
    availableSizes: ['One Size'],
  }),

  makePlaceholderProduct({
    id: '015', slug: 'cropped-knit-cardigan',
    name: 'Cropped Knit Cardigan', price: 340000,
    category: 'Casual Wear', createdAt: '2026-09-10',
    colors: ['White', 'Blue', 'Grey'], imageIndex: 0,
  }),

  makePlaceholderProduct({
    id: '016', slug: 'classic-tailored-blazer',
    name: 'Classic Tailored Blazer', price: 525000,
    category: 'Blazers', createdAt: '2026-09-05',
    colors: ['Black', 'Brown'], imageIndex: 1,
    availableSizes: ['XS', 'S', 'M', 'L'],
  }),
]

export default products
