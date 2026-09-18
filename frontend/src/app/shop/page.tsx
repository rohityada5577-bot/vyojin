"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Filter,
  Heart,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.vyojin.co.in/api/v1";

type Category = {
  id: number;
  name: string;
  slug: string;
};

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
  category?: Category | null;
};

type LaravelPagination<T> = {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
};

type ProductsResponse = {
  success: boolean;
  data: LaravelPagination<Product>;
};

type CategoriesResponse = {
  success: boolean;
  data: Category[];
};

const fallbackCategories = [
  "All",
  "Chaniya Choli",
  "Lehengas",
  "Kurta Sets",
  "Dupattas",
];

const fallbackColors = [
  "Maroon",
  "Pink",
  "Purple",
  "Yellow",
  "Green",
  "Red",
];

const fallbackSizes = ["S", "M", "L", "XL", "XXL", "Free Size"];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] =
    useState<string[]>(fallbackCategories);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const [maxPrice, setMaxPrice] = useState(5000);
  const [sort, setSort] = useState("featured");

  const [mobileFilters, setMobileFilters] = useState(false);

  const [wishlist, setWishlist] = useState<number[]>([]);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  /*
   * LOAD CATEGORIES
   */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);

        if (!response.ok) {
          return;
        }

        const result: CategoriesResponse = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setCategories([
            "All",
            ...result.data
              .filter((item) => item)
              .map((item) => item.name),
          ]);
        }
      } catch {
        // Keep fallback categories
      }
    };

    loadCategories();
  }, []);

  /*
   * LOAD PRODUCTS
   */
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("per_page", "24");

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (category !== "All") {
          params.set("category", category);
        }

        if (sort === "featured") {
          params.set("featured", "1");
        }

        const response = await fetch(
          `${API_URL}/products?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(`Products API returned ${response.status}`);
        }

        const result: ProductsResponse = await response.json();

        if (!result.success || !result.data) {
          throw new Error("Invalid products response.");
        }

        setProducts(result.data.data || []);
        setLastPage(result.data.last_page || 1);
      } catch (err) {
        console.error("Products API error:", err);

        setProducts([]);
        setError(
          "Unable to load products. Please make sure the Laravel server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [page, search, category, sort]);

  /*
   * RESET PAGE WHEN FILTER CHANGES
   */
  useEffect(() => {
    setPage(1);
  }, [search, category, sort]);

  /*
   * FILTER SIZE / COLOR / PRICE
   */
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const price = Number(product.price || 0);

      const productSizes = Array.isArray(product.sizes)
        ? product.sizes
        : [];

      const productColors = Array.isArray(product.colors)
        ? product.colors
        : [];

      const matchesPrice = price <= maxPrice;

      const matchesSize =
        selectedSizes.length === 0 ||
        selectedSizes.some((size) =>
          productSizes
            .map((item) => String(item).toLowerCase())
            .includes(size.toLowerCase())
        );

      const matchesColor =
        selectedColors.length === 0 ||
        selectedColors.some((color) =>
          productColors
            .map((item) => String(item).toLowerCase())
            .includes(color.toLowerCase())
        );

      return matchesPrice && matchesSize && matchesColor;
    });

    if (sort === "price-low") {
      result = [...result].sort(
        (a, b) => Number(a.price) - Number(b.price)
      );
    }

    if (sort === "price-high") {
      result = [...result].sort(
        (a, b) => Number(b.price) - Number(a.price)
      );
    }

    return result;
  }, [
    products,
    selectedSizes,
    selectedColors,
    maxPrice,
    sort,
  ]);

  /*
   * SIZE
   */
  const toggleSize = (size: string) => {
    setSelectedSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : [...current, size]
    );
  };

  /*
   * COLOR
   */
  const toggleColor = (color: string) => {
    setSelectedColors((current) =>
      current.includes(color)
        ? current.filter((item) => item !== color)
        : [...current, color]
    );
  };

  /*
   * WISHLIST
   */
  const toggleWishlist = (id: number) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  /*
   * CLEAR FILTERS
   */
  const clearFilters = () => {
    setCategory("All");
    setSearch("");
    setSelectedSizes([]);
    setSelectedColors([]);
    setMaxPrice(5000);
    setSort("featured");
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-[#fffaf1] text-[#3b1714]">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#7f1d1d]/10">
        <div className="absolute -right-32 -top-40 h-[500px] w-[500px] rounded-full bg-[#d7b35d]/15 blur-3xl" />

        <div className="container-main relative py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">

            <div className="mb-5 flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] text-[#a87525]">
              <Link href="/" className="hover:text-[#8f1239]">
                HOME
              </Link>

              <span>/</span>

              <span>SHOP</span>
            </div>

            <p className="text-[11px] font-bold tracking-[0.3em] text-[#8f1239]">
              THE NAVRANG EDIT
            </p>

            <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1] sm:text-6xl lg:text-7xl">
              Festive pieces,
              <br />

              <span className="gold-text italic">
                made to shine.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#75645c] sm:text-base">
              Discover Chaniya Cholis, Lehengas, Kurta Sets and festive
              accessories designed for every colour and every night of
              Navratri.
            </p>

          </div>
        </div>
      </section>

      {/* CATEGORY NAV */}
      <section className="border-b border-[#7f1d1d]/10 bg-white">
        <div className="container-main overflow-x-auto">

          <div className="flex min-w-max items-center gap-8 py-5">

            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`relative pb-1 text-sm font-semibold transition ${
                  category === item
                    ? "text-[#8f1239]"
                    : "text-[#6d5b54] hover:text-[#8f1239]"
                }`}
              >
                {item}

                {category === item && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-[#8f1239]" />
                )}
              </button>
            ))}

          </div>

        </div>
      </section>

      {/* SHOP */}
      <section className="py-10 sm:py-14">
        <div className="container-main">

          {/* CONTROLS */}
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            {/* SEARCH */}
            <div className="relative w-full lg:max-w-md">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#806d65]"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search festive styles..."
                className="h-12 w-full rounded-full border border-[#7f1d1d]/10 bg-white pl-11 pr-5 text-sm outline-none transition focus:border-[#8f1239]/40"
              />

            </div>

            <div className="flex items-center justify-between gap-3">

              <button
                onClick={() => setMobileFilters(true)}
                className="flex h-11 items-center gap-2 rounded-full border border-[#7f1d1d]/15 bg-white px-5 text-sm font-semibold lg:hidden"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>

              <div className="flex items-center gap-3">

                <span className="hidden text-sm text-[#806d65] sm:block">
                  {loading
                    ? "Loading..."
                    : `${filteredProducts.length} Products`}
                </span>

                <div className="relative">

                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="h-11 appearance-none rounded-full border border-[#7f1d1d]/15 bg-white pl-5 pr-10 text-sm font-semibold outline-none"
                  >
                    <option value="featured">
                      Featured
                    </option>

                    <option value="price-low">
                      Price: Low to High
                    </option>

                    <option value="price-high">
                      Price: High to Low
                    </option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                  />

                </div>

              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="mt-10 grid gap-10 lg:grid-cols-[230px_1fr]">

            {/* DESKTOP FILTER */}
            <aside className="hidden lg:block">

              <FilterPanel
                selectedSizes={selectedSizes}
                selectedColors={selectedColors}
                maxPrice={maxPrice}
                toggleSize={toggleSize}
                toggleColor={toggleColor}
                setMaxPrice={setMaxPrice}
                clearFilters={clearFilters}
              />

            </aside>

            {/* PRODUCTS */}
            <div>

              {loading ? (
                <ProductSkeleton />
              ) : error ? (
                <ErrorState
                  message={error}
                  retry={() => window.location.reload()}
                />
              ) : filteredProducts.length === 0 ? (
                <EmptyState clearFilters={clearFilters} />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">

                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        wished={wishlist.includes(product.id)}
                        onWishlist={() =>
                          toggleWishlist(product.id)
                        }
                      />
                    ))}

                  </div>

                  {/* PAGINATION */}
                  {lastPage > 1 && (
                    <Pagination
                      page={page}
                      lastPage={lastPage}
                      setPage={setPage}
                    />
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL BANNER */}
      <section className="pb-20">
        <div className="container-main">

          <div className="relative overflow-hidden rounded-[30px] bg-[#74152d] px-7 py-14 text-white sm:px-12 lg:px-20">

            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-[#e8c96d]/20" />

            <div className="absolute -bottom-40 right-40 h-96 w-96 rounded-full border border-[#e8c96d]/10" />

            <div className="relative z-10 max-w-2xl">

              <p className="text-[10px] font-bold tracking-[0.3em] text-[#efd37c]">
                NAVRATRI 2026
              </p>

              <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
                Nine nights.
                <br />

                <span className="italic text-[#f1d98b]">
                  Nine expressions.
                </span>
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-white/65">
                Dress for every colour, every celebration and every
                unforgettable Garba night.
              </p>

              <Link
                href="/shop"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#f4d77f] px-6 py-3 text-sm font-bold text-[#74152d]"
              >
                Explore Collection
                <ArrowRight size={16} />
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* MOBILE FILTER */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">

          <button
            onClick={() => setMobileFilters(false)}
            className="absolute inset-0 bg-black/40"
            aria-label="Close filters"
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-[#fffaf1] p-6">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <p className="text-[10px] font-bold tracking-[0.25em] text-[#a87525]">
                  FILTER COLLECTION
                </p>

                <h3 className="mt-1 font-serif text-2xl font-bold">
                  Refine your look
                </h3>
              </div>

              <button
                onClick={() => setMobileFilters(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
              >
                <X size={18} />
              </button>

            </div>

            <FilterPanel
              selectedSizes={selectedSizes}
              selectedColors={selectedColors}
              maxPrice={maxPrice}
              toggleSize={toggleSize}
              toggleColor={toggleColor}
              setMaxPrice={setMaxPrice}
              clearFilters={clearFilters}
            />

            <button
              onClick={() => setMobileFilters(false)}
              className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-[#8f1239] text-sm font-bold text-white"
            >
              Show {filteredProducts.length} Products
            </button>

          </div>
        </div>
      )}

    </main>
  );
}

/* =========================================================
   FILTER PANEL
========================================================= */

function FilterPanel({
  selectedSizes,
  selectedColors,
  maxPrice,
  toggleSize,
  toggleColor,
  setMaxPrice,
  clearFilters,
}: {
  selectedSizes: string[];
  selectedColors: string[];
  maxPrice: number;
  toggleSize: (size: string) => void;
  toggleColor: (color: string) => void;
  setMaxPrice: (price: number) => void;
  clearFilters: () => void;
}) {
  return (
    <div className="space-y-9">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">
          <Filter size={16} />
          <h3 className="text-sm font-bold">
            Filters
          </h3>
        </div>

        <button
          onClick={clearFilters}
          className="text-xs font-semibold text-[#8f1239]"
        >
          Clear All
        </button>

      </div>

      {/* PRICE */}
      <div>

        <h4 className="text-sm font-bold">
          Price
        </h4>

        <div className="mt-5">

          <input
            type="range"
            min="500"
            max="5000"
            step="100"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(Number(e.target.value))
            }
            className="w-full accent-[#8f1239]"
          />

          <div className="mt-3 flex justify-between text-xs text-[#806d65]">
            <span>₹500</span>

            <span>
              ₹{maxPrice.toLocaleString("en-IN")}
            </span>
          </div>

        </div>
      </div>

      {/* SIZE */}
      <div>

        <h4 className="text-sm font-bold">
          Size
        </h4>

        <div className="mt-4 flex flex-wrap gap-2">

          {fallbackSizes.map((size) => {

            const active = selectedSizes.includes(size);

            return (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-xs font-semibold transition ${
                  active
                    ? "border-[#8f1239] bg-[#8f1239] text-white"
                    : "border-[#7f1d1d]/15 bg-white hover:border-[#8f1239]"
                }`}
              >
                {size}
              </button>
            );
          })}

        </div>
      </div>

      {/* COLOR */}
      <div>

        <h4 className="text-sm font-bold">
          Colour
        </h4>

        <div className="mt-4 space-y-3">

          {fallbackColors.map((color) => {

            const active = selectedColors.includes(color);

            return (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className="flex w-full items-center justify-between text-sm"
              >
                <span className="text-[#66544d]">
                  {color}
                </span>

                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    active
                      ? "border-[#8f1239] bg-[#8f1239] text-white"
                      : "border-[#7f1d1d]/20 bg-white"
                  }`}
                >
                  {active && <Check size={12} />}
                </span>
              </button>
            );
          })}

        </div>
      </div>

      {/* DELIVERY */}
      <div className="rounded-2xl bg-[#f5ecde] p-4">

        <p className="text-[10px] font-bold tracking-[0.15em] text-[#8f1239]">
          FESTIVE DELIVERY
        </p>

        <p className="mt-2 text-xs leading-5 text-[#6d5b54]">
          Free shipping on orders above ₹1999 across India.
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  wished,
  onWishlist,
}: {
  product: Product;
  wished: boolean;
  onWishlist: () => void;
}) {
  const price = Number(product.price || 0);

  const comparePrice = product.compare_price
    ? Number(product.compare_price)
    : 0;

  const discount =
    comparePrice > price
      ? Math.round(
          ((comparePrice - price) / comparePrice) * 100
        )
      : 0;

  const image = getProductImage(product);

  const categoryName =
    product.category?.name || "Navratri Collection";

  return (
    <article className="group">

      <div className="relative">

        <Link href={`/product/${product.slug}`}>

          <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-[#eadcca]">

            {image ? (
              <img
                src={image}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#806d65]">
                No image
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />

            {product.is_featured && (
              <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-[9px] font-bold tracking-[0.12em] text-[#7f1d1d] shadow-sm">
                FEATURED
              </span>
            )}

            {discount > 0 && !product.is_featured && (
              <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-[9px] font-bold tracking-[0.12em] text-[#7f1d1d] shadow-sm">
                {discount}% OFF
              </span>
            )}

            {product.stock <= 0 && (
              <span className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1.5 text-[9px] font-bold tracking-[0.12em] text-white">
                SOLD OUT
              </span>
            )}

          </div>

        </Link>

        <button
          onClick={onWishlist}
          aria-label="Add to wishlist"
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition ${
            wished
              ? "text-[#8f1239]"
              : "text-[#3b1714] opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          }`}
        >
          <Heart
            size={16}
            fill={wished ? "currentColor" : "none"}
          />
        </button>

      </div>

      <div className="pt-4">

        <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#a87525]">
          {categoryName}
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-1 line-clamp-2 min-h-[42px] text-sm font-bold leading-5 text-[#3b1714] transition hover:text-[#8f1239]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1">
          <span className="text-xs text-[#b38332]">
            ★
          </span>

          <span className="text-xs font-semibold">
            New Collection
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">

          <span className="text-sm font-bold text-[#7f1d1d]">
            ₹{price.toLocaleString("en-IN")}
          </span>

          {comparePrice > price && (
            <span className="text-xs text-[#9b8b84] line-through">
              ₹{comparePrice.toLocaleString("en-IN")}
            </span>
          )}

        </div>

        <Link
          href={`/product/${product.slug}`}
          className={`mt-4 hidden h-10 w-full items-center justify-center gap-2 rounded-full border border-[#7f1d1d]/20 text-xs font-bold transition sm:flex ${
            product.stock <= 0
              ? "pointer-events-none opacity-50"
              : "hover:bg-[#8f1239] hover:text-white"
          }`}
        >
          {product.stock > 0 ? "View Product" : "Sold Out"}

          <ArrowRight size={14} />
        </Link>

      </div>

    </article>
  );
}

/* =========================================================
   PRODUCT IMAGE
========================================================= */

function getProductImage(product: Product) {
  let image = product.image;

  if (!image && Array.isArray(product.images)) {
    image = product.images[0];
  }

  if (!image) {
    return "";
  }

  /*
   * Laravel storage URL
   */
  if (image.startsWith("storage/")) {
    return `https://api.vyojin.co.in/${image}`;
  }

  /*
   * Relative image path
   */
  if (image.startsWith("/")) {
    return `https://api.vyojin.co.in${image}`;
  }

  /*
   * Already complete URL
   */
  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `https://api.vyojin.co.in/storage/${image}`;
}

/* =========================================================
   PAGINATION
========================================================= */

function Pagination({
  page,
  lastPage,
  setPage,
}: {
  page: number;
  lastPage: number;
  setPage: (page: number) => void;
}) {
  return (
    <div className="mt-12 flex items-center justify-center gap-2">

      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="rounded-full border border-[#7f1d1d]/15 bg-white px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <span className="px-4 text-sm font-semibold text-[#806d65]">
        {page} / {lastPage}
      </span>

      <button
        disabled={page === lastPage}
        onClick={() => setPage(page + 1)}
        className="rounded-full border border-[#7f1d1d]/15 bg-white px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>

    </div>
  );
}

/* =========================================================
   LOADING SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">

      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="animate-pulse">

          <div className="aspect-[4/5] rounded-[20px] bg-[#eadcca]" />

          <div className="mt-4 h-3 w-24 rounded bg-[#eadcca]" />

          <div className="mt-2 h-4 w-full rounded bg-[#eadcca]" />

          <div className="mt-2 h-4 w-2/3 rounded bg-[#eadcca]" />

          <div className="mt-3 h-4 w-24 rounded bg-[#eadcca]" />

        </div>
      ))}

    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="flex min-h-[450px] flex-col items-center justify-center rounded-[28px] bg-[#f5ecde] px-6 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#8f1239]">
        <X size={24} />
      </div>

      <h3 className="mt-5 font-serif text-3xl font-bold">
        Something went wrong
      </h3>

      <p className="mt-3 max-w-md text-sm leading-6 text-[#75645c]">
        {message}
      </p>

      <button
        onClick={retry}
        className="mt-6 rounded-full bg-[#8f1239] px-6 py-3 text-sm font-bold text-white"
      >
        Try Again
      </button>

    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  clearFilters,
}: {
  clearFilters: () => void;
}) {
  return (
    <div className="flex min-h-[450px] flex-col items-center justify-center rounded-[28px] bg-[#f5ecde] px-6 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#8f1239]">
        <Search size={24} />
      </div>

      <h3 className="mt-5 font-serif text-3xl font-bold">
        Nothing found
      </h3>

      <p className="mt-3 max-w-sm text-sm leading-6 text-[#75645c]">
        We couldn't find pieces matching your current filters.
        Try changing your search or explore the complete collection.
      </p>

      <button
        onClick={clearFilters}
        className="mt-6 rounded-full bg-[#8f1239] px-6 py-3 text-sm font-bold text-white"
      >
        Clear Filters
      </button>

    </div>
  );
}