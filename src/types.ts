// Store types for the NOIRÉ perfume application

export interface Product {
  id: string;
  name: string;
  image?: string;
  price: number;
  priceFormatted: string;
  notes: string[];
  family: 'woody' | 'floral' | 'fresh' | 'amber';
  concentration: string;
  description: string;
  longDescription: string;
  bottleColor: string;
  liquidColor: string;
  capColor: string;
  featured: boolean;
  bestSeller?: boolean;
  sizes: ProductSize[];
}

export interface ProductSize {
  ml: number;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: ProductSize;
}

export interface WishlistItem {
  productId: string;
}

export type FragranceFamily = 'all' | 'woody' | 'floral' | 'fresh' | 'amber';
export type SortOption = 'featured' | 'price-low' | 'price-high' | 'name';

export interface QuizAnswer {
  family: 'woody' | 'floral' | 'fresh' | 'amber' | null;
  occasion: 'everyday' | 'office' | 'evening' | 'special' | null;
  atmosphere: 'fresh' | 'warm' | 'bold' | 'soft' | null;
}
