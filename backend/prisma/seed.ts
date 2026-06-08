import { PrismaClient, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pickUnique<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(n, arr.length));
}

function randomPastDate(maxDaysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * maxDaysAgo));
  return d;
}

function makeVariants(
  skuBase: string,
  colors: { name: string; code: string }[],
  sizes: string[],
): VariantSeed[] {
  const out: VariantSeed[] = [];
  for (const color of colors) {
    for (const size of sizes) {
      out.push({
        color: color.name,
        size,
        stock: Math.floor(Math.random() * 51),
        sku: `${skuBase}-${color.code}-${size}`,
      });
    }
  }
  return out;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantSeed {
  color: string;
  size: string;
  stock: number;
  sku: string;
}

interface ProductSeed {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  variants: VariantSeed[];
}

// ─── Product data ─────────────────────────────────────────────────────────────
// Images are served from Next.js public/ — run `yarn download:images` first.

const PRODUCTS: ProductSeed[] = [
  // T-Shirts ──────────────────────────────────────────────────────────────────
  {
    name: 'Oversized Cotton Tee',
    slug: 'oversized-cotton-tee',
    description:
      'A relaxed, drop-shoulder cut from 100% organic cotton, garment-washed for immediate softness. The generous fit works over anything — joggers, shorts, or jeans. A genuine wardrobe cornerstone.',
    price: 24.99,
    category: 'T-Shirts',
    images: ['/images/products/tshirts/tshirt-1.jpg'],
    variants: [
      // XS + Black guaranteed stock:0 for the out-of-stock E2E test
      { color: 'Black', size: 'XS', stock: 0,  sku: 'TSH-OCT-BLK-XS' },
      { color: 'Black', size: 'S',  stock: 12, sku: 'TSH-OCT-BLK-S'  },
      // M + Black guaranteed stock:15 for add-to-cart E2E tests
      { color: 'Black', size: 'M',  stock: 15, sku: 'TSH-OCT-BLK-M'  },
      { color: 'Black', size: 'L',  stock: 8,  sku: 'TSH-OCT-BLK-L'  },
      { color: 'Black', size: 'XL', stock: 5,  sku: 'TSH-OCT-BLK-XL' },
      ...makeVariants('TSH-OCT', [{ name: 'White', code: 'WHT' }], ['XS', 'S', 'M', 'L', 'XL']),
    ],
  },
  {
    name: 'Slim Fit V-Neck Tee',
    slug: 'slim-fit-v-neck-tee',
    description:
      'A tailored v-neck in soft cotton-modal jersey that drapes cleanly against the body. Subtle enough to layer under a jacket, refined enough to wear alone. Hemmed to sit just below the waist.',
    price: 19.99,
    category: 'T-Shirts',
    images: ['/images/products/tshirts/tshirt-2.jpg'],
    variants: makeVariants(
      'TSH-SVN',
      [{ name: 'Navy', code: 'NAV' }, { name: 'Grey', code: 'GRY' }],
      ['S', 'M', 'L', 'XL'],
    ),
  },
  {
    name: 'Longline Graphic Tee',
    slug: 'longline-graphic-tee',
    description:
      'An extended-length tee on heavyweight 220gsm cotton with an original screen-printed graphic. The longer hem intentionally skims the hips, pairing well over joggers or shorts. Pre-shrunk and enzyme-washed.',
    price: 29.99,
    category: 'T-Shirts',
    images: ['/images/products/tshirts/tshirt-3.jpg'],
    variants: makeVariants(
      'TSH-LGT',
      [{ name: 'Black', code: 'BLK' }, { name: 'Olive', code: 'OLV' }],
      ['S', 'M', 'L', 'XL'],
    ),
  },
  {
    name: 'Essential Pocket Tee',
    slug: 'essential-pocket-tee',
    description:
      'A reliable regular-fit crew neck with a single chest patch pocket. Made from breathable 180gsm cotton jersey and finished with a clean, tubular hem. The tee you will always reach for first.',
    price: 22.99,
    category: 'T-Shirts',
    images: ['/images/products/tshirts/tshirt-4.jpg'],
    variants: makeVariants(
      'TSH-EPT',
      [{ name: 'White', code: 'WHT' }, { name: 'Beige', code: 'BGE' }],
      ['XS', 'S', 'M', 'L', 'XL'],
    ),
  },
  {
    name: 'Striped Breton Tee',
    slug: 'striped-breton-tee',
    description:
      'A sailor-inspired Breton stripe in a clean navy and ecru colourway, woven on a heavier 200gsm cotton for structure and longevity. Slight drop shoulder, boat neck, and a slightly cropped body length.',
    price: 27.99,
    category: 'T-Shirts',
    images: ['/images/products/tshirts/tshirt-5.jpg'],
    variants: makeVariants(
      'TSH-SBT',
      [{ name: 'Navy', code: 'NAV' }, { name: 'Cream', code: 'CRM' }],
      ['XS', 'S', 'M', 'L'],
    ),
  },

  // Hoodies ───────────────────────────────────────────────────────────────────
  {
    name: 'Classic Pullover Hoodie',
    slug: 'classic-pullover-hoodie',
    description:
      'Cut from a 350gsm brushed fleece, this is the hoodie you will wear every day for years. Kangaroo pocket, flat drawstrings, and ribbed cuffs that hold their shape after washing. Zero branding, all substance.',
    price: 54.99,
    category: 'Hoodies',
    images: ['/images/products/hoodies/hoodie-1.jpg'],
    variants: makeVariants(
      'HOD-CPH',
      [{ name: 'Black', code: 'BLK' }, { name: 'Grey', code: 'GRY' }],
      ['S', 'M', 'L', 'XL'],
    ),
  },
  {
    name: 'Zip-Up Fleece Hoodie',
    slug: 'zip-up-fleece-hoodie',
    description:
      'A full-zip hooded sweatshirt in a soft mid-weight polar fleece. Two external zip pockets, a contrast-lined hood for wind protection, and a YKK zipper that runs smooth after years of use.',
    price: 64.99,
    category: 'Hoodies',
    images: ['/images/products/hoodies/hoodie-2.jpg'],
    variants: makeVariants(
      'HOD-ZFH',
      [{ name: 'Navy', code: 'NAV' }, { name: 'Olive', code: 'OLV' }],
      ['S', 'M', 'L', 'XL'],
    ),
  },
  {
    name: 'Oversized Heavyweight Hoodie',
    slug: 'oversized-heavyweight-hoodie',
    description:
      'Our heaviest fleece at 420gsm, pre-washed to prevent shrinkage and ring-spun for a smoother hand feel. The drop-shoulder, boxy silhouette is intentional — wear it big or not at all.',
    price: 69.99,
    category: 'Hoodies',
    images: ['/images/products/hoodies/hoodie-3.jpg'],
    variants: makeVariants(
      'HOD-OHH',
      [{ name: 'Black', code: 'BLK' }, { name: 'White', code: 'WHT' }],
      ['XS', 'S', 'M', 'L', 'XL'],
    ),
  },
  {
    name: 'Lightweight Quarter-Zip',
    slug: 'lightweight-quarter-zip',
    description:
      'A versatile midlayer in a breathable 280gsm cotton-poly fleece. The quarter-zip collar allows quick temperature adjustment on the move. Slim-straight fit that layers cleanly under a jacket.',
    price: 49.99,
    category: 'Hoodies',
    images: ['/images/products/hoodies/hoodie-4.jpg'],
    variants: makeVariants(
      'HOD-LQZ',
      [{ name: 'Grey', code: 'GRY' }, { name: 'Slate', code: 'SLT' }],
      ['S', 'M', 'L', 'XL'],
    ),
  },

  // Trousers ──────────────────────────────────────────────────────────────────
  {
    name: 'Slim Fit Chinos',
    slug: 'slim-fit-chinos',
    description:
      'Tailored chinos cut close through the thigh and tapered to the ankle, made from a 97% cotton stretch twill that never pulls or binds. Finished with a clean coin pocket and bar-tacked stress points.',
    price: 44.99,
    category: 'Trousers',
    images: ['/images/products/trousers/trouser-1.jpg'],
    variants: makeVariants(
      'TRS-SFC',
      [{ name: 'Navy', code: 'NAV' }, { name: 'Beige', code: 'BGE' }],
      ['S', 'M', 'L', 'XL'],
    ),
  },
  {
    name: 'Relaxed Cargo Trousers',
    slug: 'relaxed-cargo-trousers',
    description:
      'Wide-leg cargos in heavyweight 12oz cotton canvas with six utility pockets and an elasticated waistband for all-day comfort. The fabric stiffens with wear, then softens beautifully over months of use.',
    price: 59.99,
    category: 'Trousers',
    images: ['/images/products/trousers/trouser-2.jpg'],
    variants: makeVariants(
      'TRS-RCT',
      [{ name: 'Olive', code: 'OLV' }, { name: 'Black', code: 'BLK' }],
      ['XS', 'S', 'M', 'L', 'XL'],
    ),
  },
  {
    name: 'Straight Leg Jeans',
    slug: 'straight-leg-jeans',
    description:
      'Classic five-pocket jeans in a clean straight cut — not skinny, not wide. Made from 12oz denim with minimal stretch to ensure they hold their shape. Fades naturally with wear for a unique patina.',
    price: 54.99,
    category: 'Trousers',
    images: ['/images/products/trousers/trouser-3.jpg'],
    variants: makeVariants(
      'TRS-SLJ',
      [{ name: 'Indigo', code: 'IND' }, { name: 'Black', code: 'BLK' }],
      ['S', 'M', 'L', 'XL'],
    ),
  },
  {
    name: 'Tapered Joggers',
    slug: 'tapered-joggers',
    description:
      'Relaxed through the seat and thigh, tapered sharply from the knee to a clean ankle. French terry cotton-blend for structure with comfort. Two side zip pockets keep items secure on the move.',
    price: 39.99,
    category: 'Trousers',
    images: ['/images/products/trousers/trouser-4.jpg'],
    variants: makeVariants(
      'TRS-TAJ',
      [{ name: 'Grey', code: 'GRY' }, { name: 'Black', code: 'BLK' }],
      ['XS', 'S', 'M', 'L', 'XL'],
    ),
  },

  // Jackets ───────────────────────────────────────────────────────────────────
  {
    name: 'Quilted Puffer Jacket',
    slug: 'quilted-puffer-jacket',
    description:
      'Channel-quilted puffer filled with 90g recycled polyester wadding and a DWR-coated shell. Packs down to its own chest pocket. Warm enough for real winters, light enough to forget you are wearing it.',
    price: 129.99,
    category: 'Jackets',
    images: ['/images/products/jackets/jacket-1.jpg'],
    variants: makeVariants(
      'JAC-QPJ',
      [{ name: 'Black', code: 'BLK' }, { name: 'Navy', code: 'NAV' }],
      ['S', 'M', 'L', 'XL'],
    ),
  },
  {
    name: 'Classic Harrington Jacket',
    slug: 'classic-harrington-jacket',
    description:
      'A Mod-era silhouette updated in mid-weight cotton-poly twill. Tartan-lined body, clean stand collar, and a set-in sleeve for a sharp shoulder. British heritage that refuses to date.',
    price: 89.99,
    category: 'Jackets',
    images: ['/images/products/jackets/jacket-2.jpg'],
    variants: makeVariants(
      'JAC-CHJ',
      [{ name: 'Olive', code: 'OLV' }, { name: 'Navy', code: 'NAV' }],
      ['S', 'M', 'L', 'XL'],
    ),
  },
  {
    name: 'Oversized Coach Jacket',
    slug: 'oversized-coach-jacket',
    description:
      'A hip-length boxy coach jacket in durable nylon ripstop. Snap-button closure, two welted flap pockets at the waist, and a clean unlined interior that keeps the weight minimal.',
    price: 79.99,
    category: 'Jackets',
    images: ['/images/products/jackets/jacket-3.jpg'],
    variants: makeVariants(
      'JAC-OCJ',
      [{ name: 'Black', code: 'BLK' }, { name: 'White', code: 'WHT' }],
      ['XS', 'S', 'M', 'L', 'XL'],
    ),
  },
  {
    name: 'Technical Shell Jacket',
    slug: 'technical-shell-jacket',
    description:
      'A three-layer hardshell with a 20K waterproof and 15K breathability rating. Fully seam-sealed, underarm vents for exertion, and a helmet-compatible hood. Built for the mountains, worn in the city.',
    price: 149.99,
    category: 'Jackets',
    images: ['/images/products/jackets/jacket-4.jpg'],
    variants: makeVariants(
      'JAC-TSJ',
      [{ name: 'Black', code: 'BLK' }, { name: 'Slate', code: 'SLT' }],
      ['S', 'M', 'L', 'XL'],
    ),
  },

  // Accessories ───────────────────────────────────────────────────────────────
  {
    name: 'Ribbed Knit Beanie',
    slug: 'ribbed-knit-beanie',
    description:
      'A fine-rib beanie knit from a merino-acrylic blend that is soft against skin and quick to dry after rain. One-size construction with a generous turn-up that keeps ears covered on cold days.',
    price: 14.99,
    category: 'Accessories',
    images: ['/images/products/accessories/accessory-1.jpg'],
    variants: [
      { color: 'Black', size: 'ONE SIZE', stock: 30, sku: 'ACC-RKB-BLK-OS' },
      { color: 'Grey',  size: 'ONE SIZE', stock: 25, sku: 'ACC-RKB-GRY-OS' },
      { color: 'Navy',  size: 'ONE SIZE', stock: 20, sku: 'ACC-RKB-NAV-OS' },
    ],
  },
  {
    name: 'Canvas Tote Bag',
    slug: 'canvas-tote-bag',
    description:
      'Heavy-duty 12oz canvas tote with reinforced stress-point stitching and a 50cm drop handle. Fits a 15" laptop comfortably. Screen-printed logo. 100% cotton, zero plastic.',
    price: 19.99,
    category: 'Accessories',
    images: ['/images/products/accessories/accessory-2.jpg'],
    variants: [
      { color: 'Natural', size: 'ONE SIZE', stock: 40, sku: 'ACC-CTB-NAT-OS' },
      { color: 'Black',   size: 'ONE SIZE', stock: 35, sku: 'ACC-CTB-BLK-OS' },
    ],
  },
  {
    name: 'Merino Wool Scarf',
    slug: 'merino-wool-scarf',
    description:
      'Generously sized at 200 x 35cm, woven from 100% extra-fine merino that is naturally temperature-regulating and machine washable. Finished with hand-knotted fringe on both ends.',
    price: 34.99,
    category: 'Accessories',
    images: ['/images/products/accessories/accessory-3.jpg'],
    variants: [
      { color: 'Charcoal', size: 'ONE SIZE', stock: 18, sku: 'ACC-MWS-CHR-OS' },
      { color: 'Camel',    size: 'ONE SIZE', stock: 22, sku: 'ACC-MWS-CAM-OS' },
    ],
  },
];

// ─── Order plan ───────────────────────────────────────────────────────────────

const ORDER_PLAN: { customerIdx: number; status: OrderStatus; itemCount: number }[] = [
  { customerIdx: 0, status: 'DELIVERED',  itemCount: 3 },
  { customerIdx: 1, status: 'SHIPPED',    itemCount: 2 },
  { customerIdx: 2, status: 'PAID',       itemCount: 4 },
  { customerIdx: 3, status: 'DELIVERED',  itemCount: 1 },
  { customerIdx: 4, status: 'CANCELLED',  itemCount: 2 },
  { customerIdx: 0, status: 'PAID',       itemCount: 1 },
  { customerIdx: 1, status: 'DELIVERED',  itemCount: 3 },
  { customerIdx: 2, status: 'SHIPPED',    itemCount: 2 },
  { customerIdx: 3, status: 'CANCELLED',  itemCount: 4 },
  { customerIdx: 4, status: 'DELIVERED',  itemCount: 2 },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database…\n');

  // 1. Wipe existing data (reverse FK order)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash passwords
  const [adminHash, customerHash] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('password123', 10),
  ]);

  // 3. Create admin
  await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@store.com', passwordHash: adminHash, role: 'ADMIN' },
  });

  // 4. Create customers
  const customerDefs = [
    { name: 'James Thornton', email: 'customer1@test.com' },
    { name: 'Sophie Patel',   email: 'customer2@test.com' },
    { name: 'Marcus Webb',    email: 'customer3@test.com' },
    { name: 'Ella Morrison',  email: 'customer4@test.com' },
    { name: 'Daniel Kim',     email: 'customer5@test.com' },
  ];

  const customers = await Promise.all(
    customerDefs.map((c) =>
      prisma.user.create({
        data: { name: c.name, email: c.email, passwordHash: customerHash, role: 'CUSTOMER' },
      }),
    ),
  );

  // 5. Create addresses
  await prisma.address.createMany({
    data: [
      { userId: customers[0].id, line1: '12 Baker Street',  line2: 'Flat 3',  city: 'London',     postcode: 'NW1 6XE',  country: 'GB' },
      { userId: customers[0].id, line1: '8 Victoria Road',                    city: 'Manchester', postcode: 'M14 5TJ',  country: 'GB' },
      { userId: customers[1].id, line1: '45 Princes Street',                  city: 'Edinburgh',  postcode: 'EH2 2BY',  country: 'GB' },
      { userId: customers[2].id, line1: '7 Park Lane',      line2: 'Suite 2', city: 'Birmingham', postcode: 'B1 2JA',   country: 'GB' },
      { userId: customers[2].id, line1: '23 Queens Road',                     city: 'Bristol',    postcode: 'BS8 1QU',  country: 'GB' },
      { userId: customers[3].id, line1: '90 High Street',                     city: 'Oxford',     postcode: 'OX1 4BH',  country: 'GB' },
      { userId: customers[4].id, line1: '3 Castle Street',                    city: 'Cardiff',    postcode: 'CF10 1BS', country: 'GB' },
      { userId: customers[4].id, line1: '55 Elm Avenue',                      city: 'Leeds',      postcode: 'LS6 2JG',  country: 'GB' },
    ],
  });

  // 6. Create products + variants (individual creates to get IDs back)
  const createdProducts = await Promise.all(
    PRODUCTS.map((p) =>
      prisma.product.create({
        data: {
          name:        p.name,
          slug:        p.slug,
          description: p.description,
          price:       p.price,
          category:    p.category,
          images:      p.images,
          variants:    { create: p.variants },
        },
        include: { variants: true },
      }),
    ),
  );

  const allVariants = createdProducts.flatMap((p) =>
    p.variants.map((v) => ({ ...v, productPrice: Number(p.price) })),
  );

  // 7. Create orders
  for (const plan of ORDER_PLAN) {
    const customer = customers[plan.customerIdx];
    const chosenVariants = pickUnique(allVariants, plan.itemCount);

    const items = chosenVariants.map((v) => ({
      variantId:       v.id,
      quantity:        Math.floor(Math.random() * 3) + 1,
      priceAtPurchase: v.productPrice,
    }));

    const total =
      Math.round(
        items.reduce((sum, i) => sum + i.priceAtPurchase * i.quantity, 0) * 100,
      ) / 100;

    await prisma.order.create({
      data: {
        userId:    customer.id,
        status:    plan.status,
        total,
        createdAt: randomPastDate(90),
        items:     { create: items },
      },
    });
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log(`✅  ${customers.length + 1} users created`);
  console.log(`✅  ${createdProducts.length} products created (${allVariants.length} variants)`);
  console.log(`✅  ${ORDER_PLAN.length} orders created`);
  console.log('');
  console.log(`🔑  Admin login:    admin@store.com / admin123`);
  console.log(`👤  Customer login: customer1@test.com / password123`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
