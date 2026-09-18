
import ProductDetail from "./ProductDetail";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://api.vyojin.co.in/api/v1";

type Product = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number | string;
  compare_price?: number | string | null;
  sku?: string | null;
  stock: number;
  image?: string | null;
  images?: string[] | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  is_active?: boolean;
  is_featured?: boolean;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

type ProductsResponse = {
  data?:
    | Product[]
    | {
        data?: Product[];
      };
};

async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/products`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `Products API failed: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const result: ProductsResponse = await response.json();

    /*
     * Normal Laravel API response:
     *
     * {
     *   "data": [
     *     { ...product }
     *   ]
     * }
     */
    if (Array.isArray(result.data)) {
      return result.data;
    }

    /*
     * Laravel paginated response:
     *
     * {
     *   "data": {
     *     "current_page": 1,
     *     "data": [
     *       { ...product }
     *     ]
     *   }
     * }
     */
    if (result.data && Array.isArray(result.data.data)) {
      return result.data.data;
    }

    console.error("Unexpected products API response:", result);

    return [];
  } catch (error) {
    console.error("Products fetch error:", error);
    return [];
  }
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
          const response = await fetch(
          `${API_URL}/products/${encodeURIComponent(slug)}`,
          {
            cache: "force-cache",
          }
        );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    return result?.data ?? null;
  } catch (error) {
    console.error("Product fetch error:", error);
    return null;
  }
}

/*
 * Next.js uses this during the build to determine
 * which /product/[slug] pages should be generated.
 */
export async function generateStaticParams() {
  const products = await getProducts();

  return products
    .filter(
      (product) =>
        product &&
        typeof product.slug === "string" &&
        product.slug.trim() !== ""
    )
    .map((product) => ({
      slug: product.slug,
    }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#fffaf1] px-6">
        <div className="max-w-xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a87525]">
            Product not found
          </p>

          <h1 className="mt-3 font-serif text-4xl font-bold text-[#3b1714]">
            We couldn't find this product
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#806d65]">
            The product may have been removed or is currently unavailable.
          </p>

          <a
            href="/shop"
            className="mt-7 inline-flex rounded-full bg-[#8f1239] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#74102f]"
          >
            Back to Shop
          </a>
        </div>
      </main>
    );
  }

  return <ProductDetail product={product} />;
}

