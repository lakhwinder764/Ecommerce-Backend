/**
 * Bulk seed script - adds ~200 products (MacBook, iPhone, Android, Smartwatch, Redmi, etc.)
 * Uses Unsplash images (https://images.unsplash.com)
 */
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Product } from '../products/product.entity';
import { Category } from '../categories/category.entity';

dotenv.config();

// Unsplash image URLs for electronics - various laptops, phones, watches
const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
  'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400',
  'https://images.unsplash.com/photo-1587616211892-f7f3d8a81d8e?w=400',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
  'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',
  'https://images.unsplash.com/photo-1592286927505-d0d0c2e3e8e8?w=400',
  'https://images.unsplash.com/photo-1592286927505-d0d0c2e3e8e8?w=400',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
  'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400',
  'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=400',
  'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400',
  'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400',
  'https://images.unsplash.com/photo-1612444530582-fc66183b16f7?w=400',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400',
  'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
  'https://images.unsplash.com/photo-1587616211892-f7f3d8a81d8e?w=400',
  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
  'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400',
  'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400',
  'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=400',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
  'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400',
];

// Product templates: [title, description, features, basePriceRange]
const PRODUCT_TEMPLATES = [
  // MacBooks
  ['MacBook Air M1 13"', 'Apple MacBook Air with M1 chip, 8GB RAM, 256GB SSD. Lightweight and powerful.', 'M1 Chip, 8GB RAM, 256GB SSD, Retina Display, 18hr battery', 999],
  ['MacBook Air M2 13"', 'Apple MacBook Air with M2 chip. Faster performance, stunning display.', 'M2 Chip, 8GB RAM, 256GB SSD, Liquid Retina, MagSafe', 1199],
  ['MacBook Pro 14" M3', 'MacBook Pro with M3 chip. Pro performance for creators.', 'M3 Pro, 18GB RAM, 512GB SSD, XDR Display, 17hr battery', 1999],
  ['MacBook Pro 16" M3 Max', 'Ultimate MacBook Pro. M3 Max chip for demanding workflows.', 'M3 Max, 36GB RAM, 1TB SSD, XDR Display, 22hr battery', 3499],
  ['MacBook Air M3 15"', 'Largest MacBook Air ever. M3 chip, spacious display.', 'M3 Chip, 8GB RAM, 256GB SSD, 15.3" Retina, MagSafe', 1299],
  // iPhones
  ['iPhone 15 Pro', 'iPhone 15 Pro with A17 Pro chip. Titanium design.', 'A17 Pro, 256GB, Pro camera system, Action button', 999],
  ['iPhone 15 Pro Max', 'Largest iPhone with Pro camera. 5x optical zoom.', 'A17 Pro, 256GB, 5x zoom, Titanium, 29hr battery', 1199],
  ['iPhone 15', 'iPhone 15 with Dynamic Island. USB-C.', 'A16 Bionic, 128GB, Dual camera, 6.1" Super Retina', 799],
  ['iPhone 15 Plus', 'Bigger iPhone 15. All-day battery life.', 'A16 Bionic, 128GB, 6.7" display, 26hr battery', 899],
  ['iPhone 14', 'iPhone 14. Proven performance. Great value.', 'A15 Bionic, 128GB, Dual camera, 6.1" display', 699],
  ['iPhone 14 Pro', 'iPhone 14 Pro with Pro camera. Always-On display.', 'A16 Bionic, 128GB, 48MP camera, Dynamic Island', 999],
  ['iPhone SE (3rd gen)', 'Compact iPhone with A15 chip. Affordable.', 'A15 Bionic, 64GB, Touch ID, 4.7" Retina', 429],
  // Android / Samsung
  ['Samsung Galaxy S24 Ultra', 'Galaxy S24 Ultra. AI-powered. S Pen included.', 'Snapdragon 8 Gen 3, 256GB, 200MP camera, S Pen', 1299],
  ['Samsung Galaxy S24+', 'Galaxy S24+. Big screen. AI features.', 'Snapdragon 8 Gen 3, 256GB, 50MP camera, 6.7"', 999],
  ['Samsung Galaxy S24', 'Compact Galaxy S24. Full flagship features.', 'Snapdragon 8 Gen 3, 128GB, 50MP camera, 6.2"', 799],
  ['Samsung Galaxy Z Fold 5', 'Foldable smartphone. Tablet in your pocket.', 'Snapdragon 8 Gen 2, 256GB, 7.6" foldable, S Pen', 1799],
  ['Samsung Galaxy Z Flip 5', 'Compact foldable. Fits in your pocket.', 'Snapdragon 8 Gen 2, 256GB, 6.7" foldable', 999],
  ['Google Pixel 8 Pro', 'Pixel 8 Pro. Best-in-class camera. Google AI.', 'Tensor G3, 128GB, 50MP camera, 6.7" LTPO', 999],
  ['Google Pixel 8', 'Pixel 8. Smart features. Great camera.', 'Tensor G3, 128GB, 50MP camera, 6.2"', 699],
  ['OnePlus 12', 'OnePlus 12. Fast charging. Smooth display.', 'Snapdragon 8 Gen 3, 256GB, 50MP, 100W charging', 799],
  ['OnePlus Open', 'OnePlus foldable. Premium build.', 'Snapdragon 8 Gen 2, 256GB, 7.82" foldable', 1699],
  // Redmi / Xiaomi
  ['Redmi Note 13 Pro+', 'Redmi Note 13 Pro+. 200MP camera. 120W charging.', 'Dimensity 7200, 256GB, 200MP, 120W HyperCharge', 349],
  ['Redmi Note 13 Pro', 'Redmi Note 13 Pro. Great value mid-ranger.', 'Snapdragon 7s Gen 2, 256GB, 200MP, 67W', 299],
  ['Redmi Note 13', 'Redmi Note 13. Everyday performance.', 'Snapdragon 685, 128GB, 108MP, 33W', 199],
  ['Redmi 13C', 'Redmi 13C. Budget champion.', 'Helio G85, 128GB, 50MP, 5000mAh', 149],
  ['Xiaomi 14', 'Xiaomi 14. Leica cameras. Snapdragon 8 Gen 3.', 'Snapdragon 8 Gen 3, 256GB, Leica triple camera', 899],
  ['Xiaomi 14 Ultra', 'Xiaomi 14 Ultra. Photography flagship.', 'Snapdragon 8 Gen 3, 512GB, Leica quad camera', 1299],
  ['Redmi K70', 'Redmi K70. Performance beast.', 'Snapdragon 8 Gen 2, 256GB, 120W, 2K display', 449],
  ['POCO F5', 'POCO F5. Gaming phone. Great value.', 'Snapdragon 7+ Gen 2, 256GB, 67W, 120Hz', 349],
  // Smartwatches
  ['Apple Watch Ultra 2', 'Apple Watch Ultra 2. Built for extremes.', '49mm, titanium, 36hr battery, dual-frequency GPS', 799],
  ['Apple Watch Series 9', 'Apple Watch Series 9. Double tap. Brighter.', 'S9 chip, 41mm/45mm, 18hr battery, gesture control', 399],
  ['Apple Watch SE', 'Apple Watch SE. Essential features.', 'S8 chip, 40mm/44mm, 18hr battery, fitness', 249],
  ['Samsung Galaxy Watch 6 Classic', 'Galaxy Watch 6 Classic. Rotating bezel.', 'Exynos W930, 47mm, 40hr, body composition', 369],
  ['Samsung Galaxy Watch 6', 'Galaxy Watch 6. Slim design.', 'Exynos W930, 40mm/44mm, 30hr, sleep coaching', 299],
  ['Google Pixel Watch 2', 'Pixel Watch 2. Fitbit integration.', 'Tensor G2, 41mm, 24hr, stress detection', 349],
  ['Garmin Fenix 7', 'Garmin Fenix 7. Adventure watch.', 'Solar charging, 47mm, 18 days battery, maps', 699],
  ['Garmin Venu 3', 'Garmin Venu 3. Health & fitness.', 'AMOLED, 45mm, 14 days, nap detection', 449],
  ['Amazfit GTR 4', 'Amazfit GTR 4. Long battery life.', '14 days battery, 46mm, dual-band GPS', 199],
  ['Fitbit Sense 2', 'Fitbit Sense 2. Stress management.', '6+ days battery, EDA sensor, sleep profile', 249],
  // More laptops
  ['Dell XPS 15', 'Dell XPS 15. InfinityEdge display. Premium build.', 'Intel i7, 16GB, 512GB SSD, 15.6" OLED', 1499],
  ['Dell XPS 13', 'Dell XPS 13. Ultra-portable.', 'Intel i5, 8GB, 256GB SSD, 13.4" FHD+', 999],
  ['HP Spectre x360', 'HP Spectre x360. 2-in-1 convertible.', 'Intel i7, 16GB, 512GB, 13.5" OLED touch', 1399],
  ['Lenovo ThinkPad X1 Carbon', 'ThinkPad X1 Carbon. Business classic.', 'Intel i7, 16GB, 512GB, 14" 2.8K', 1699],
  ['Lenovo Yoga 9i', 'Lenovo Yoga 9i. Premium 2-in-1.', 'Intel i7, 16GB, 512GB, 14" OLED, rotating soundbar', 1499],
  ['ASUS ROG Zephyrus G14', 'ASUS ROG Zephyrus G14. Gaming laptop.', 'Ryzen 9, RTX 4060, 16GB, 512GB, 14"', 1499],
  ['ASUS ZenBook 14', 'ASUS ZenBook 14. Compact powerhouse.', 'Intel i7, 16GB, 512GB, 14" OLED, NumberPad', 999],
  ['Microsoft Surface Laptop 5', 'Surface Laptop 5. Premium Windows.', 'Intel i5, 8GB, 256GB, 13.5" PixelSense', 999],
  ['Razer Blade 15', 'Razer Blade 15. Gaming. Thin.', 'Intel i7, RTX 4070, 16GB, 512GB, 15.6"', 2499],
  ['Acer Swift 3', 'Acer Swift 3. Value ultrabook.', 'Intel i5, 8GB, 256GB SSD, 14" FHD', 599],
  // More phones
  ['Sony Xperia 1 V', 'Sony Xperia 1 V. Cinema-grade camera.', 'Snapdragon 8 Gen 2, 256GB, 4K 120fps', 1399],
  ['Sony Xperia 5 V', 'Sony Xperia 5 V. Compact flagship.', 'Snapdragon 8 Gen 2, 128GB, 6.1"', 999],
  ['Nothing Phone (2)', 'Nothing Phone (2). Glyph interface.', 'Snapdragon 8+ Gen 1, 256GB, 50MP', 599],
  ['Nothing Phone (1)', 'Nothing Phone (1). Transparent design.', 'Snapdragon 778G+, 128GB, dual 50MP', 499],
  ['Motorola Edge 40', 'Motorola Edge 40. Curved display.', 'Dimensity 8020, 256GB, 144Hz pOLED', 449],
  ['Motorola Razr 40', 'Motorola Razr 40. Compact flip.', 'Snapdragon 7 Gen 1, 256GB, 6.9" foldable', 899],
  ['Oppo Find X6 Pro', 'Oppo Find X6 Pro. Hasselblad cameras.', 'Snapdragon 8 Gen 2, 256GB, triple 50MP', 999],
  ['Vivo X90 Pro', 'Vivo X90 Pro. Zeiss optics.', 'Dimensity 9200, 256GB, 50MP main', 899],
  ['Realme GT 3', 'Realme GT 3. 240W charging.', 'Snapdragon 8+ Gen 1, 256GB, 240W', 499],
  ['Honor Magic 5 Pro', 'Honor Magic 5 Pro. AI features.', 'Snapdragon 8 Gen 2, 512GB, 50MP', 899],
];

// Expand to ~200 by repeating templates with variants
const STORAGE_VARIANTS = [' 128GB', ' 256GB', ' 512GB', ' 1TB'];
const COLOR_VARIANTS = [' Space Gray', ' Silver', ' Gold', ' Midnight', ' Blue', ' Black'];

function generateProducts(): Array<{ title: string; description: string; features: string; price: number }> {
  const products: Array<{ title: string; description: string; features: string; price: number }> = [];

  for (let i = 0; i < 200; i++) {
    const t = PRODUCT_TEMPLATES[i % PRODUCT_TEMPLATES.length] as [string, string, string, number];
    const [baseTitle, desc, features, basePrice] = t;
    const storage = STORAGE_VARIANTS[i % STORAGE_VARIANTS.length];
    const color = COLOR_VARIANTS[Math.floor(i / STORAGE_VARIANTS.length) % COLOR_VARIANTS.length];
    const title = `${baseTitle}${storage}${color}`;
    const priceOffset = (i % 10) * 25 + (i % 5) * 10;
    products.push({
      title,
      description: desc,
      features,
      price: basePrice + priceOffset,
    });
  }

  return products;
}

async function run() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'nest_databases',
    entities: [Product, Category],
    synchronize: false,
  });

  await dataSource.initialize();
  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);

  // Create or get categories
  const categoryNames = ['Laptops', 'Smartphones', 'Smartwatches', 'Tablets', 'Accessories'];
  const categories: Record<string, Category> = {};

  for (const name of categoryNames) {
    let cat = await categoryRepo.findOne({ where: { name } });
    if (!cat) {
      cat = categoryRepo.create({ name });
      await categoryRepo.save(cat);
      console.log(`Created category: ${name}`);
    }
    categories[name] = cat;
  }

  const catKeys = Object.keys(categories);
  const products = generateProducts();

  console.log(`Seeding ${products.length} products...`);

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const imgUrl = UNSPLASH_IMAGES[i % UNSPLASH_IMAGES.length];
    const catName = catKeys[i % catKeys.length];
    const category = categories[catName];

    const product = productRepo.create({
      title: p.title,
      description: p.description,
      features: p.features,
      price: p.price,
      imageUrl: imgUrl,
      category,
      isActive: true,
    });

    await productRepo.save(product);
    if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${products.length} products seeded`);
  }

  console.log(`Done! Seeded ${products.length} products.`);
  await dataSource.destroy();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
