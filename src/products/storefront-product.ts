import { Product } from './product.entity';

// Shape expected by the React storefront under /api. Prices are in paise,
// matching the frontend's FormatPrice (which divides by 100) and Stripe.

// Products have no stock column yet; this caps quantities in the cart.
export const DEFAULT_STOCK = 10;

export function toPaise(rupees: number | string): number {
  return Math.round(Number(rupees) * 100);
}

function companyFromTitle(title: string): string {
  if (/^(macbook|iphone|ipad|airpods|apple)\b/i.test(title)) return 'Apple';
  return title.split(' ')[0] ?? '';
}

export function toStorefrontImages(product: Product) {
  const url = product.image
    ? `/products/image/${product.id}`
    : product.imageUrl || '';
  // Always one entry: the product page indexes into this array.
  return [{ id: String(product.id), url, filename: product.title }];
}

export function toStorefrontProduct(product: Product) {
  return {
    id: product.id,
    name: product.title,
    company: companyFromTitle(product.title),
    price: toPaise(product.price),
    description: product.description,
    features: product.features,
    category: product.category?.name ?? '',
    colors: [] as string[],
    image: toStorefrontImages(product),
    stock: DEFAULT_STOCK,
    stars: 0,
    reviews: 0,
    featured: false,
  };
}
