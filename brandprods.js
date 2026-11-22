/* Quick Art: real products for Categories > Brands.
   Every price is a real INR price copied from an Indian store (Sitaram Stationers or Amazon.in) on 22 Nov 2026;
   each option keeps its source link. Images are the brands' own product photos, saved in img/bp/.
   These products are looked up by id (P) for the product page and cart, but are kept out of PRODUCTS,
   so search, category lists and Home are unchanged. */

const SITARAM = 'https://sitaramstationers.com/product/';
const S$ = (slug) => ({ store: 'Sitaram Stationers', url: SITARAM + slug + '/' });
const AMZ = (asin) => ({ store: 'Amazon.in', url: 'https://www.amazon.in/dp/' + asin });
const PRICE_CHECKED = '22 Nov 2026';

/* [id, name, brand, store category, sub, options [label, price, mrp, source], description, specs, brand page] */
const BP_ROWS = [
  // Faber-Castell
  ['bp-fc1', 'Pitt Artist Pen India Ink, Wallet of 8, Black', 'Faber-Castell', 'markers', 'Artist pens',
    [['Wallet of 8', 950, 950, S$('faber-castell-pitt-artist-pens-black-set-of-8')]],
    'Eight black Pitt Artist Pens with pigmented India ink in different tips, from fine liners to brush. Waterproof and lightfast once dry.',
    { Ink: 'Pigmented India ink', Colour: 'Black (199)', Pens: '8 tips' }, 'https://www.faber-castell.in/products/PittArtistPenIndiainkpenwalletof8black/167137'],
  ['bp-fc2', 'Castell 9000 Graphite Pencils, Tin of 6', 'Faber-Castell', 'pencils', 'Graphite',
    [['Tin of 6', 500, 500, S$('faber-castell-castell-9000-graphite-pencil-tin-set-of-6')]],
    'Six Castell 9000 graphite pencils in assorted grades for writing, drawing and sketching, in a metal tin.',
    { Pencils: '6, assorted grades', Pack: 'Metal tin' }, 'https://www.faber-castell.in/products/Castell9000graphitepenciltinof6/119063'],
  ['bp-fc3', 'Polychromos Colour Pencils, Tin', 'Faber-Castell', 'pencils', 'Colour pencils',
    [['Tin of 12', 2100, 2100, S$('faber-castell-polychromos-color-pencil-sets')], ['Tin of 24', 4200, 4200, S$('faber-castell-polychromos-color-pencil-sets')], ['Tin of 60', 11000, 11000, S$('faber-castell-polychromos-color-pencil-sets')]],
    "Faber-Castell's artist-grade oil-based colour pencils, in a metal tin.",
    { Type: 'Oil-based colour pencils', Pack: 'Metal tin' }, 'https://www.faber-castell.in/products/Polychromoscolourpenciltinof12/110012'],
  // Staedtler
  ['bp-st1', 'pigment liner 308 Fineliner', 'Staedtler', 'markers', 'Fineliners',
    [['Single pen', 250, 250, S$('staedtler-pigment-liner-pens-open-stock')]],
    'Fineliner with pigmented ink that is indelible, lightfast and waterproof on paper once dry.',
    { Ink: 'Pigment, waterproof on paper', Widths: '0.05 to 1.2 mm' }, 'https://www.staedtler.com/intl/en/products/products-for-colouring/fineliners/pigment-liner-308-fineliner-m308/'],
  ['bp-st2', 'Mars Lumograph black, Tin of 6', 'Staedtler', 'pencils', 'Graphite',
    [['Tin of 6', 825, 825, S$('staedtler-mars-lumograph-black-artist-pencils-in-6-assorted-degrees-set')]],
    'Drawing pencils with a high carbon content for deep, matt black tones. Six degrees: 8B, 7B, 6B, 4B, 2B and HB.',
    { Degrees: '8B, 7B, 6B, 4B, 2B, HB', Finish: 'Matt black' }, 'https://www.staedtler.com/us/en/products/pencils-and-accessories/graphite-pencils/mars-lumograph-black-100b-drawing-pencil-100b-g6/'],
  ['bp-st3', 'Mars Lumograph charcoal, Set of 4', 'Staedtler', 'pencils', 'Charcoal',
    [['Set of 4', 525, 525, S$('staedtler-mars-lumograph-charcoal-pencil-set-of-4')]],
    'Charcoal pencils in soft, medium and hard with a paper stump, for deep matt blacks.',
    { Degrees: 'Soft, medium, hard', Includes: '3 pencils + paper stump' }, 'https://www.staedtler.com/intl/en/products/pencils-and-accessories/graphite-pencils/mars-lumograph-charcoal-100c-charcoal-pencil-100c-sbk4/'],
  // Maped
  ['bp-mp1', "Graph'Peps Fineliners, Set of 10", 'Maped', 'markers', 'Fineliners',
    [['Set of 10', 375, 375, S$('maped-graph-peps-fineliners-assorted-set-of-10-20')]],
    'Ten 0.4 mm fineliners in assorted colours with a metal-protected tip for use with rulers.',
    { Tip: '0.4 mm', Colours: '10 assorted' }, 'https://us.maped.com/product/graphpeps-fine-felt-tipped-pens-x10/'],
  ['bp-mp2', "Color'Peps Triangular Colour Pencils", 'Maped', 'pencils', 'Colour pencils',
    [['Set of 12', 145, 145, S$('maped-colorpeps-star-coloured-pencils-set-of-12-24-36-48-72')], ['Set of 24', 285, 285, S$('maped-colorpeps-star-coloured-pencils-set-of-12-24-36-48-72')], ['Set of 36', 475, 475, S$('maped-colorpeps-star-coloured-pencils-set-of-12-24-36-48-72')], ['Set of 48', 650, 650, S$('maped-colorpeps-star-coloured-pencils-set-of-12-24-36-48-72')], ['Set of 72', 1125, 1125, S$('maped-colorpeps-star-coloured-pencils-set-of-12-24-36-48-72')]],
    'Triangular colour pencils with a break-resistant core; the shape stops them rolling off the desk.',
    { Shape: 'Triangular', Core: 'Break-resistant' }, 'https://us.maped.com/product/triangular-colored-pencils-x24/'],
  // Derwent
  ['bp-dw1', 'Graphic Pencils, Tin of 6', 'Derwent', 'pencils', 'Graphite',
    [['Tin of 6 (2H to 8B)', 670, 670, S$('derwent-graphic-pencil-set-of-6-tin-2h-8b')]],
    'Six Derwent Graphic graphite pencils from 2H to 8B, in a tin.',
    { Grades: '2H to 8B', Pack: 'Tin of 6' }, 'https://www.derwentart.com/en-gb/p/0700835/professional-products/pencils/derwent-graphic-pencils-6-tin'],
  ['bp-dw2', 'Charcoal Pencils, Tin of 6', 'Derwent', 'pencils', 'Charcoal',
    [['Tin of 6', 1299, 1299, S$('derwent-charcoal-tin-set-of-6')]],
    'Six Derwent charcoal pencils for rich, dark sketching tones, in a tin.',
    { Pack: 'Tin of 6' }, 'https://www.derwentart.com/en-gb/p/0700838/professional-products/pencils/derwent-charcoal-6-pencils-tin'],
  ['bp-dw3', 'Graphic Soft Pencils, Tin of 12', 'Derwent', 'pencils', 'Graphite',
    [['Tin of 12 (9B to H)', 1299, 1299, S$('derwent-graphic-pencil-set-of-12-soft-9b-h')]],
    'Twelve soft Derwent Graphic pencils from 9B to H for shading and tonal drawing.',
    { Grades: '9B to H', Pack: 'Tin of 12' }, 'https://www.derwentart.com/en-gb/p/34215/professional-products/pencils/derwent-graphic-soft-pencils-12-tin'],
  // Pentel
  ['bp-pe1', 'Brush Sign Pen, 6 Colours', 'Pentel', 'markers', 'Brush pens',
    [['Set of 6', 894, 894, S$('pentel-brush-sign-pens-set-of-6')]],
    'Flexible brush-tip pens for lettering and illustration, in a set of six colours.',
    { Tip: 'Flexible brush', Pens: '6' }, 'https://www.pentel.com.au/category/wallets-brush-pen'],
  ['bp-pe2', 'Dual Metallic Brush Pen', 'Pentel', 'markers', 'Brush pens',
    [['Single pen', 549, 549, S$('pentel-dual-metallic-brush-pens-open-stock')]],
    'Brush pen with a metallic shimmer over a second colour, for lettering and cards.',
    { Tip: 'Brush', Ink: 'Dual metallic' }, 'https://www.pentel.com.au/category/home-dual-metallic-brush'],
  ['bp-pe3', 'Paint Marker MMP20, Medium', 'Pentel', 'markers', 'Paint markers',
    [['Single marker', 199, 199, S$('pentel-mmp20-paint-marker-colours-open-stock')]],
    'Medium bullet-point paint marker that writes on glass, metal, wood, plastic and more.',
    { Tip: 'Medium, 4.6 mm', Type: 'Paint marker' }, 'https://www.pentel.com.au/category/paint-marker'],
  // Sakura
  ['bp-sk1', 'Pigma Micron Pens, Set', 'Sakura', 'markers', 'Fineliners',
    [['Set of 6', 725, 725, S$('sakura-pigma-micron-set-of-6-assorted-nibs-xsdk-6')], ['Set of 8', 975, 975, S$('sakura-pigma-micron-set-of-8-assorted-nibs-including-1-pn-nib-xsdk-8')], ['Set of 12', 1495, 1495, S$('sakura-pigma-micron-set-of-12-assorted-nibs-black-12a')]],
    'Pigma Micron archival pigment-ink pens in assorted nib sizes, for inking and fine line work.',
    { Ink: 'Pigma archival ink', Nibs: 'Assorted sizes' }, 'https://www.sakuraofamerica.com/product/pigma-micron/'],
  ['bp-sk2', 'Koi Coloring Brush Pen', 'Sakura', 'markers', 'Brush pens',
    [['Single pen', 110, 110, S$('sakura-koi-coloring-brush-pen-open-stock')]],
    'Water-based brush pen with a flexible tip for colouring and blending.',
    { Tip: 'Flexible brush', Ink: 'Water-based' }, 'https://www.sakuraofamerica.com/product/koi-coloring-brush-pens/'],
  ['bp-sk3', 'Koi Water Brush', 'Sakura', 'brushes', 'Water brushes',
    [['Medium, 4 ml', 300, 300, S$('sakura-koi-waterbrush-loose')], ['Large, 4 ml', 300, 300, S$('sakura-koi-waterbrush-loose')], ['Medium, 9 ml', 350, 350, S$('sakura-koi-waterbrush-loose')], ['Large, 9 ml', 350, 350, S$('sakura-koi-waterbrush-loose')]],
    'Refillable water brush: squeeze the barrel to wet the brush, for watercolour on the go.',
    { Barrel: 'Refillable water tank' }, 'https://www.sakuraofamerica.com/product/koi-water-brush/'],
  // Posca
  ['bp-po1', 'Posca PC-5M Paint Marker, Medium', 'Posca', 'markers', 'Paint markers',
    [['Single marker', 150, 150, S$('uni-ball-posca-pc-5m-paint-art-marker-pen-fine-point')]],
    'Water-based paint marker with a medium bullet tip, for paper, canvas, wood, glass, fabric and more.',
    { Tip: 'Medium bullet', Ink: 'Water-based paint' }, 'https://www.posca.com/ec/product/pc-5m/'],
  ['bp-po2', 'Posca PC-3M Paint Marker, Fine', 'Posca', 'markers', 'Paint markers',
    [['Single marker', 150, 150, S$('uni-ball-posca-pc-3m-paint-art-marker-pen')]],
    'Fine bullet-tip paint marker for detail work on almost any surface.',
    { Tip: 'Fine bullet', Ink: 'Water-based paint' }, 'https://www.posca.com/ec/product/pc-3m/'],
  ['bp-po3', 'Posca PC-1MR Paint Marker, Ultra-fine', 'Posca', 'markers', 'Paint markers',
    [['Single marker', 150, 150, S$('uni-ball-posca-pc-1mr-paint-art-marker-pen-fine-point')]],
    'Ultra-fine pin-tip paint marker for outlines and the smallest details.',
    { Tip: 'Ultra-fine pin', Ink: 'Water-based paint' }, 'https://www.posca.com/ec/product/pc-1mr/'],
  // Uni-ball
  ['bp-ub1', 'uni-ball Eye UB-157 Roller Pen, 0.7 mm', 'Uni-ball', 'markers', 'Roller pens',
    [['Black, pack of 3', 233, 240, AMZ('B07PJKY6MS')], ['Black, pack of 12', 912, 960, AMZ('B003GIS2RG')], ['Assorted, wallet of 8', 640, 640, S$('uni-ball-eye-ub-157-roller-pen-wallet-assorted-color-pack-of-8')]],
    'Liquid-ink rollerball with a 0.7 mm tip and an ink window in the barrel.',
    { Tip: '0.7 mm', Ink: 'Liquid ink' }, 'https://uniball.co.uk/brands/eye/uni-ball-eye-ub-157/'],
  ['bp-ub2', 'uni-ball Eye Micro UB-150 Roller Pen, 0.5 mm', 'Uni-ball', 'markers', 'Roller pens',
    [['Blue, pack of 3', 225, 225, AMZ('B00J4LA9TI')]],
    'Micro 0.5 mm liquid-ink rollerball for neat, fine lines.',
    { Tip: '0.5 mm', Ink: 'Liquid ink' }, 'https://uniball.co.uk/brands/eye/uni-ball-eye-micro-ub-150/'],
  ['bp-ub3', 'uni-ball Jetstream SX-101 Roller Pen, 0.7 mm', 'Uni-ball', 'markers', 'Roller pens',
    [['Blue, pack of 12', 570, 570, AMZ('B07SQ37LS9')]],
    'Jetstream rollerball with quick-drying ink that is good for left-handers.',
    { Tip: '0.7 mm', Ink: 'Jetstream, quick drying' }, 'https://uniball.com.au/product/uni-jetstream-101-rollerball-pen/'],
  // Sharpie
  ['bp-sh1', 'Sharpie Permanent Marker, Fine Point', 'Sharpie', 'markers', 'Permanent markers',
    [['Black, single', 70, 70, S$('sharpie-fine-tip-black-permanent-marker-pen')], ['Black, pack of 2', 145, 145, S$('sharpie-fine-tip-black-2pcs-set')], ['Assorted, pack of 4', 310, 310, S$('sharpie-fine-tip-assorted-4pcs-set')]],
    'Fine-point permanent marker that marks paper, plastic, metal and most other surfaces; quick drying and fade resistant.',
    { Tip: 'Fine point', Ink: 'Permanent' }, 'https://www.sharpie.com/markers/permanent-markers/sharpie-permanent-markers-fine-point/SAP_1756292.html'],

  /* Batch 2 (prices checked 22 Nov 2026) */
  // Mont Marte
  ['bp-mm1', 'Signature Acrylic Colour Paint Set, 36 Colours', 'Mont Marte', 'paints', 'Acrylic paints',
    [['Set of 36', 2399, 2399, S$('mont-marte-signature-acrylic-colour-paint-set-of-36')]],
    'Thirty-six acrylic colours in tubes for students and hobby painters.',
    { Colours: '36', Type: 'Acrylic' }, 'https://www.montmarte.com/products/acrylic-colour-paint-set-signature-36pc-x-36ml-1-2oz'],
  ['bp-mm2', 'Woodless Graphite Pencils, Set of 6', 'Mont Marte', 'pencils', 'Graphite',
    [['Set of 6', 406, 406, S$('mont-marte-signature-woodless-graphite-pencils-6pcs')]],
    'Solid graphite pencils with no wood casing, so you can shade with the side as well as the tip.',
    { Pencils: '6', Type: 'Woodless graphite' }, 'https://www.montmarte.com/products/woodless-graphite-pencils-signature-6pc'],
  ['bp-mm3', 'Detail & Liner Brush Set, 5 Brushes', 'Mont Marte', 'brushes', 'Brushes',
    [['Set of 5', 719, 719, S$('mont-marte-signature-detail-liner-brush-set-of-5')]],
    'Five fine detail and liner brushes for small work and lines.',
    { Brushes: '5', Use: 'Detail and liner work' }, 'https://www.montmarte.com/products/detail-liner-brush-set-signature-5pc'],
  // Mungyo
  ['bp-mg1', 'Gallery Artist Soft Pastels, Full Length', 'Mungyo', 'paints', 'Soft pastels',
    [['12 shades', 599, 599, S$('gallery-mungyo-soft-pastel-sets-made-in-korea')], ['24 shades', 970, 970, S$('gallery-mungyo-soft-pastel-sets-made-in-korea')], ['36 shades', 1199, 1199, S$('gallery-mungyo-soft-pastel-sets-made-in-korea')], ['48 shades', 1699, 1699, S$('gallery-mungyo-soft-pastel-sets-made-in-korea')]],
    'Square, full-length soft pastels made in Korea, for blending and layering.',
    { Shape: 'Square, full length', Made: 'Korea' }, 'http://en.mungyo.co.kr/35/?idx=21'],
  ['bp-mg2', 'Gallery Artist Soft Oil Pastels, 48 Colours', 'Mungyo', 'paints', 'Oil pastels',
    [['Set of 48', 2250, 2250, S$('mungyo-gallery-artist-soft-oil-pastels-set-of-24-36-48-assorted-colours')]],
    'Soft, creamy artist oil pastels in 48 colours.',
    { Colours: '48', Type: 'Soft oil pastel' }, 'http://en.mungyo.co.kr/34/?idx=15'],
  // Tombow
  ['bp-tb1', 'ABT Dual Brush Pen', 'Tombow', 'markers', 'Brush pens',
    [['Single pen, any colour', 190, 190, S$('tombow-abt-dual-tip-brush-pen-individual-colours')]],
    'Water-based marker with a flexible brush tip and a fine bullet tip; colours blend with water.',
    { Tips: 'Brush + fine bullet', Ink: 'Water-based' }, 'https://tombowusa.com/products/dual-brush-pen'],
  ['bp-tb2', 'MONO Zero Round Eraser with Refills', 'Tombow', 'pencils', 'Erasers',
    [['Eraser + refill pack', 450, 450, S$('tombow-mono-zero-eraser-refill-pack-open-stock')]],
    'Pen-style precision eraser with a 2.3 mm round tip for highlights and fine corrections.',
    { Tip: '2.3 mm round' }, 'https://tombowusa.com/products/mono-zero-erasers-silver-round-refill-pack'],
  // Prismacolor
  ['bp-pc1', 'Premier Soft Core Colour Pencil', 'Prismacolor', 'pencils', 'Colour pencils',
    [['Single pencil, any colour', 225, 225, S$('prismacolor-premier-coloured-pencil-open-stock')]],
    'Soft, creamy wax-based colour pencil for smooth blending and shading.',
    { Core: 'Soft wax', Sold: 'Single pencil' }, 'https://www.prismacolor.com/colored-pencils/premier-soft-core-colored-pencil-singles/SAP_1800047.html'],
  ['bp-pc2', 'Scholar Colour Pencils, Set of 12', 'Prismacolor', 'pencils', 'Colour pencils',
    [['Set of 12', 1200, 1200, S$('prismacolor-scholar-colored-pencils-set-of-12')]],
    'Student-grade colour pencils with a slightly harder core that resists breaking.',
    { Pencils: '12' }, 'https://www.prismacolor.com/colored-pencils/scholar-colored-pencil-sets/SP_48524.html'],
  ['bp-pc3', 'Premier Soft Core Colour Pencil Sets', 'Prismacolor', 'pencils', 'Colour pencils',
    [['Set of 12', 2499, 2499, S$('prismacolor-premier-color-pencil-sets')], ['Set of 24', 4999, 4999, S$('prismacolor-premier-color-pencil-sets')], ['Set of 36', 6499, 6499, S$('prismacolor-premier-color-pencil-sets')], ['Set of 48', 8999, 8999, S$('prismacolor-premier-color-pencil-sets')], ['Set of 72', 11499, 11499, S$('prismacolor-premier-color-pencil-sets')], ['Set of 150', 22999, 22999, S$('prismacolor-premier-color-pencil-sets')]],
    'Artist colour pencils with a soft, thick core and rich pigment. The photo shows the 150 set.',
    { Core: 'Soft wax' }, 'https://www.prismacolor.com/colored-pencils/premier-soft-core-colored-pencil-sets/SP_1360278.html'],
  // Liquitex
  ['bp-lq2', 'Professional Acrylic Ink, Set of 6', 'Liquitex', 'paints', 'Acrylic inks',
    [['Essentials, 6 colours', 2700, 2700, S$('liquitex-professional-acrylic-ink-set-of-3-6')], ['Iridescents, 6 colours', 3099, 3099, S$('liquitex-professional-acrylic-ink-set-of-3-6')]],
    'Fluid, highly pigmented acrylic inks for washes, pouring, dip pens and airbrush. The photo shows the Essentials set.',
    { Bottles: '6 x 30 ml' }, 'https://www.liquitex.com/products/acrylic-ink-set-6x30ml-essentials'],
  ['bp-lq3', 'Professional Acrylic Marker Set, Vibrants', 'Liquitex', 'markers', 'Paint markers',
    [['Set of 6', 1790, 1790, S$('liquitex-professional-acrylic-marker-sets')]],
    'Acrylic paint markers with Liquitex paint inside, for paper, canvas, wood and more.',
    { Markers: '6' }, 'https://www.liquitex.com/products/acrylic-marker-set-6x2mm-vibrants'],
  ['bp-lq4', 'Flow Aid Additive, 118 ml', 'Liquitex', 'paints', 'Mediums',
    [['118 ml', 849, 849, S$('liquitex-flow-aid-118ml')]],
    'Additive that makes acrylic paint flow and level more easily, for smooth flat colour.',
    { Volume: '118 ml' }, 'https://www.liquitex.com/products/professional-flow-aid-additive'],
  // Winsor & Newton
  ['bp-wn2', 'Art Masking Fluid, 75 ml', 'Winsor & Newton', 'paints', 'Mediums',
    [['75 ml', 920, 920, S$('winsor-newton-art-masking-fluid-75ml')]],
    'Masking fluid that protects white paper during watercolour washes, then rubs away.',
    { Volume: '75 ml' }, 'https://www.winsornewton.com/products/watercolour-medium-art-masking-fluid'],
  // Canson
  ['bp-cn1', 'XL Mixed Media Textured Pad, 300 gsm', 'Canson', 'paper', 'Mixed media paper',
    [['A5', 390, 390, S$('canson-xl-mix-media-pads')], ['A4', 780, 780, S$('canson-xl-mix-media-pads')], ['A3', 1495, 1495, S$('canson-xl-mix-media-pads')]],
    'Heavy 300 gsm spiral pad for wet and dry media, with a textured side and a smoother side.',
    { Weight: '300 gsm', Binding: 'Spiral, short side' }, 'https://en.canson.com/xl-mix-media-spiral-bound-pad-300-gm-medium-grain'],
  ['bp-cn2', '"C" à grain Drawing Pad, 224 gsm', 'Canson', 'paper', 'Drawing paper',
    [['A5, 30 sheets', 395, 395, S$('canson-c-a-grain-pad-224gsm')]],
    'Fine-grain acid-free drawing paper for pencil, pastel and charcoal that also takes light wet media.',
    { Weight: '224 gsm', Size: 'A5' }, 'https://en.canson.com/c-grainr-224-gsm'],
  ['bp-cn3', 'Inspiration Art Book, A5, 96 gsm', 'Canson', 'paper', 'Sketchbooks',
    [['A5, 30 sheets', 650, 650, S$('canson-artbook-inspiration-a6-a5-with-24-30-sheets-96gsm-sketchbook-open-stock')]],
    'Light sketchbook with rounded corners for quick studies, notes and everyday sketching.',
    { Weight: '96 gsm', Sheets: '30' }, 'https://en.canson.com/inspiration-art-booktm'],
  // Rotring
  ['bp-ro1', 'Isograph Technical Drawing Pen', 'Rotring', 'drafting', 'Technical pens',
    [['0.1 mm', 1995, 1995, S$('rotring-isograph-drawing-pen-open-stock')], ['0.2 mm', 1995, 1995, S$('rotring-isograph-drawing-pen-open-stock')], ['0.3 mm', 1995, 1995, S$('rotring-isograph-drawing-pen-open-stock')], ['0.4 mm', 1995, 1995, S$('rotring-isograph-drawing-pen-open-stock')], ['0.5 mm', 1995, 1995, S$('rotring-isograph-drawing-pen-open-stock')], ['0.6 mm', 1995, 1995, S$('rotring-isograph-drawing-pen-open-stock')]],
    'Refillable technical pen for precise, even lines in drafting and illustration. Ink sold separately.',
    { Type: 'Refillable technical pen' }, 'https://www.rotring.com/pens-pencils/technical-pens/isograph-drawing-pen/SP_124519.html'],
  // Daler-Rowney
  ['bp-dr1', 'System3 Acrylic Ink, 29.5 ml', 'Daler-Rowney', 'paints', 'Acrylic inks',
    [['Portrait Pink', 400, 400, S$('daler-rowney-system-3-acrylic-ink-29-5ml-open-stock')], ['Crimson', 450, 450, S$('daler-rowney-system-3-acrylic-ink-29-5ml-open-stock')], ['Titanium White', 500, 500, S$('daler-rowney-system-3-acrylic-ink-29-5ml-open-stock')]],
    'Opaque, pigment-based acrylic ink that thins with water and is water resistant once dry.',
    { Volume: '29.5 ml' }, 'https://daler-rowney.com/product/system3-acrylic-ink-29-5ml/'],
  ['bp-dr3', 'Simply Acrylic Paint Markers, Black & White', 'Daler-Rowney', 'markers', 'Paint markers',
    [['Set of 2', 600, 600, S$('daler-rowney-simply-acrylic-paint-markers')]],
    'Water-based acrylic paint markers that dry fast on many surfaces.',
    { Markers: '2 (black and white)' }, 'https://daler-rowney.com/product/simply-acrylic-marker-black-white-set/'],
  // Fabriano
  ['bp-fb1', 'Tiziano Pastel Block, White, 160 gsm', 'Fabriano', 'paper', 'Pastel paper',
    [['23 x 30.5 cm', 1188, 1188, S$('fabriano-tiziano-pastel-blocks-white-160-gsm-23-x-30-5-cm')]],
    'Acid-free 160 gsm paper containing cotton, for pastel, pencil, charcoal and graphite.',
    { Weight: '160 gsm', Size: '23 x 30.5 cm' }, 'https://fabriano.com/en/product/tiziano/'],
];

/* Catalogue category for the Brands filter chips */
const SUB_TO_CCAT = { 'Artist pens': 'pens', Fineliners: 'pens', 'Roller pens': 'pens', Graphite: 'graphite', Charcoal: 'graphite', Erasers: 'graphite', 'Colour pencils': 'colour', 'Brush pens': 'markers', 'Paint markers': 'markers', 'Permanent markers': 'markers', 'Water brushes': 'brushes', Brushes: 'brushes', 'Acrylic paints': 'paints', 'Acrylic inks': 'paints', Mediums: 'paints', 'Soft pastels': 'pastels', 'Oil pastels': 'pastels', 'Mixed media paper': 'paper', 'Drawing paper': 'paper', 'Pastel paper': 'paper', Sketchbooks: 'sketchbooks', 'Technical pens': 'drafting' };
const BRAND_PRODUCTS = BP_ROWS.map(([id, name, brand, cat, sub, opts, desc, specs, brandPage]) => ({
  id, name, brand, cat, sub, desc, specs, brandPage, live: true, fields: [], ccat: SUB_TO_CCAT[sub] || null,
  art: { photo: 'img/bp/' + id + '.jpg' }, bg: '#FFFFFF', rating: 0, reviews: 0, dv: 0,
  variants: opts.map(([label, price, mrp, src]) => ({ label, price, mrp, stock: 10, src })),
}));
BRAND_PRODUCTS.forEach((p) => { P[p.id] = p; });

/* Brands shown in Categories > Brands, in the order the brief lists them; more are added batch by batch */
const LIVE_BRANDS = ['faber', 'staedtler', 'maped', 'derwent', 'pentel', 'sakura', 'posca', 'uniball', 'sharpie', 'copic',
  'montmarte', 'mungyo', 'tombow', 'prismacolor', 'liquitex', 'winsor', 'canson', 'rotring', 'daler', 'fabriano'];
/* Real products of a brand: the ones above plus Copic (priced at Indian MRP in data.js) */
function liveProductsOfBrand(id) {
  return [...BRAND_PRODUCTS.filter((p) => brandIdOf(p.brand) === id), ...PRODUCTS.filter((p) => INDIA_MRP.has(p.id) && brandIdOf(p.brand) === id)];
}
