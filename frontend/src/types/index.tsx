export type Category = {
  id: number;
  name: string;
  slug?: string;
};

export type Product = {
  id: number;
  slug: string;
  name: string;

  price: number | string;
  compare_price?: number | string | null;

  stock: number;

  description?: string | null;

  image?: string | null;
  images?: string[] | null;

  sizes?: string[] | null;
  colors?: string[] | null;

  sku?: string | null;

  is_active?: boolean;
  is_featured?: boolean;

  category?: Category | null;
};