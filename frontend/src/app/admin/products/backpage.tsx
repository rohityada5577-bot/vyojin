"use client";

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Image as ImageIcon,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api/v1";

const IMAGE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL ||
  "http://127.0.0.1:8000/storage";

interface Category {
  id: number;
  name: string;
  slug?: string;
}

interface Product {
  id: number;
  category_id?: number | null;
  category?: Category | null;

  name: string;
  slug: string;
  description?: string | null;

  price: number | string;
  compare_price?: number | string | null;

  sku: string;
  stock: number;

  image?: string | null;
  images?: string[] | null;

  sizes?: string[] | null;
  colors?: string[] | null;

  is_active: boolean;
  is_featured: boolean;

  created_at?: string;
  updated_at?: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ProductsResponse {
  success: boolean;
  data:
    | Product[]
    | {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
  message?: string;
}
const pageVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const cardHover = {
  y: -3,
  transition: {
    duration: 0.25,
    ease: "easeOut",
  },
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("all");

  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
  });

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Authentication
  |--------------------------------------------------------------------------
  */

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("admin_token");
  };

  const handleUnauthorized = () => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch Categories
  |--------------------------------------------------------------------------
  */

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);

      const response = await fetch(
        `${API_URL}/categories`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to load categories."
        );
      }

      const categoryData: Category[] =
        Array.isArray(result.data)
          ? result.data
          : result.data?.data || [];

      setCategories(categoryData);
    } catch (err) {
      console.error(
        "Categories error:",
        err
      );
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Fetch Products
  |--------------------------------------------------------------------------
  */

  const fetchProducts = useCallback(
    async (page = 1) => {
      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      try {
        setLoading(true);
        setError("");
        setDeleteError("");

        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("per_page", "12");

        if (search.trim()) {
          params.set(
            "search",
            search.trim()
          );
        }

        if (categoryId) {
          params.set(
            "category_id",
            categoryId
          );
        }

        if (status !== "all") {
          params.set(
            "status",
            status
          );
        }

        const response = await fetch(
          `${API_URL}/admin/products?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        const result: ProductsResponse =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Unable to load products."
          );
        }

        /*
         * Laravel pagination:
         *
         * data: {
         *   data: [],
         *   current_page: 1,
         *   last_page: 2,
         *   per_page: 12,
         *   total: 20
         * }
         *
         * Also supports simple:
         *
         * data: []
         */

        if (Array.isArray(result.data)) {
          setProducts(result.data);

          setPagination({
            current_page: 1,
            last_page: 1,
            per_page: 12,
            total: result.data.length,
          });
        } else {
          setProducts(
            result.data.data || []
          );

          setPagination({
            current_page:
              result.data.current_page || 1,
            last_page:
              result.data.last_page || 1,
            per_page:
              result.data.per_page || 12,
            total:
              result.data.total ||
              result.data.data?.length ||
              0,
          });
        }
      } catch (err) {
        console.error(
          "Products error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    },
    [search, categoryId, status]
  );

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [
    search,
    categoryId,
    status,
    fetchProducts,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Delete Product
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (
    product: Product
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setDeletingId(product.id);
      setDeleteError("");

      const response = await fetch(
        `${API_URL}/admin/products/${product.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to delete product."
        );
      }

      /*
       * Remove immediately from UI
       */

      setProducts((current) =>
        current.filter(
          (item) =>
            item.id !== product.id
        )
      );

      setPagination((current) => ({
        ...current,
        total: Math.max(
          0,
          current.total - 1
        ),
      }));
    } catch (err) {
      console.error(
        "Delete product error:",
        err
      );

      setDeleteError(
        err instanceof Error
          ? err.message
          : "Unable to delete product."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Image URL
  |--------------------------------------------------------------------------
  */

  const getImageUrl = (
    image?: string | null
  ) => {
    if (!image) {
      return null;
    }

    /*
     * Already a full URL
     */

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    /*
     * If Laravel returns:
     *
     * products/image.webp
     *
     * use:
     *
     * /storage/products/image.webp
     */

    return `${IMAGE_URL}/${image.replace(
      /^\/+/,
      ""
    )}`;
  };

  /*
  |--------------------------------------------------------------------------
  | Format Price
  |--------------------------------------------------------------------------
  */

  const formatPrice = (
    price: number | string
  ) => {
    const value = Number(price || 0);

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(value);
  };

  /*
  |--------------------------------------------------------------------------
  | Stock Status
  |--------------------------------------------------------------------------
  */

  const getStockStatus = (
    stock: number
  ) => {
    if (stock <= 0) {
      return {
        label: "Out of Stock",
        className:
          "bg-red-50 text-red-700 border-red-100",
      };
    }

    if (stock <= 5) {
      return {
        label: "Low Stock",
        className:
          "bg-amber-50 text-amber-700 border-amber-100",
      };
    }

    return {
      label: "In Stock",
      className:
        "bg-green-50 text-green-700 border-green-100",
    };
  };

  /*
  |--------------------------------------------------------------------------
  | Clear Filters
  |--------------------------------------------------------------------------
  */

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setStatus("all");
  };

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const goToPage = (
    page: number
  ) => {
    if (
      page < 1 ||
      page > pagination.last_page ||
      page === pagination.current_page
    ) {
      return;
    }

    fetchProducts(page);
  };

  /*
  |--------------------------------------------------------------------------
  | Page Numbers
  |--------------------------------------------------------------------------
  */

  const getPageNumbers = () => {
    const pages: number[] = [];

    const current =
      pagination.current_page;

    const last =
      pagination.last_page;

    if (last <= 7) {
      for (
        let i = 1;
        i <= last;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (current > 3) {
      pages.push(-1);
    }

    const start = Math.max(
      2,
      current - 1
    );

    const end = Math.min(
      last - 1,
      current + 1
    );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    if (current < last - 2) {
      pages.push(-2);
    }

    pages.push(last);

    return pages;
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="pb-10">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a57945]">
            Catalog Management
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#241b1b] sm:text-4xl">
            Products
          </h1>

          <p className="mt-2 text-sm text-[#807575]">
            Manage your Navratri collection,
            inventory and product visibility.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              fetchProducts(
                pagination.current_page
              )
            }
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e8e0d7] bg-white px-5 py-3 text-sm font-bold text-[#665b55] transition hover:border-[#8f1239] hover:text-[#8f1239] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>

          <Link
            href="/admin/products/create"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#8f1239] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#8f1239]/10 transition hover:bg-[#74102f]"
          >
            <Plus size={18} />
            Add Product
          </Link>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          <AlertCircle
            size={19}
            className="mt-0.5 flex-shrink-0"
          />

          <div className="flex-1">
            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                fetchProducts(
                  pagination.current_page
                )
              }
              className="mt-2 font-black underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE ERROR
      ====================================================== */}

      {deleteError && (
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {deleteError}
        </div>
      )}

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <section className="mt-8 rounded-[1.5rem] border border-[#e8e0d7] bg-white p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_180px_auto]">
          {/* Search */}

          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a8f88]"
            />

            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search products by name or SKU..."
              className="w-full rounded-2xl border border-[#e8e0d7] bg-[#fcfaf7] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#8f1239] focus:bg-white"
            />
          </div>

          {/* Category */}

          <select
            value={categoryId}
            onChange={(e) =>
              setCategoryId(
                e.target.value
              )
            }
            disabled={
              loadingCategories
            }
            className="rounded-2xl border border-[#e8e0d7] bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-[#3f3632] outline-none transition focus:border-[#8f1239] focus:bg-white disabled:opacity-60"
          >
            <option value="">
              {loadingCategories
                ? "Loading..."
                : "All Categories"}
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>

          {/* Status */}

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
            className="rounded-2xl border border-[#e8e0d7] bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-[#3f3632] outline-none transition focus:border-[#8f1239] focus:bg-white"
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>

            <option value="featured">
              Featured
            </option>
          </select>

          {/* Clear */}

          {(search ||
            categoryId ||
            status !== "all") && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-2xl border border-[#e8e0d7] px-5 py-3 text-sm font-bold text-[#665b55] transition hover:border-[#8f1239] hover:text-[#8f1239]"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-[#e8e0d7] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#9a8f88]">
                Total Products
              </p>

              <p className="mt-2 text-2xl font-black text-[#241b1b]">
                {pagination.total}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f6ecdf] text-[#8f1239]">
              <Package size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#e8e0d7] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#9a8f88]">
                Showing
              </p>

              <p className="mt-2 text-2xl font-black text-[#241b1b]">
                {products.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <Eye size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#e8e0d7] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#9a8f88]">
                Current Page
              </p>

              <p className="mt-2 text-2xl font-black text-[#241b1b]">
                {pagination.current_page}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Package size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#e8e0d7] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#9a8f88]">
                Pages
              </p>

              <p className="mt-2 text-2xl font-black text-[#241b1b]">
                {pagination.last_page}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          PRODUCT TABLE
      ====================================================== */}

      <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#e8e0d7] bg-white">
        {/* Desktop header */}

        <div className="hidden border-b border-[#eee8e1] px-6 py-4 lg:grid lg:grid-cols-[minmax(280px,2fr)_1fr_120px_140px_120px_110px] lg:items-center lg:gap-4">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-[#9a8f88]">
            Product
          </p>

          <p className="text-xs font-black uppercase tracking-[0.15em] text-[#9a8f88]">
            Category
          </p>

          <p className="text-xs font-black uppercase tracking-[0.15em] text-[#9a8f88]">
            Price
          </p>

          <p className="text-xs font-black uppercase tracking-[0.15em] text-[#9a8f88]">
            Stock
          </p>

          <p className="text-xs font-black uppercase tracking-[0.15em] text-[#9a8f88]">
            Status
          </p>

          <p className="text-right text-xs font-black uppercase tracking-[0.15em] text-[#9a8f88]">
            Actions
          </p>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="text-center">
              <Loader2
                size={32}
                className="mx-auto animate-spin text-[#8f1239]"
              />

              <p className="mt-4 text-sm font-bold text-[#665b55]">
                Loading products...
              </p>
            </div>
          </div>
        ) : products.length === 0 ? (
          /* =================================================
             EMPTY
          ================================================== */

          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f6ecdf] text-[#8f1239]">
              <Package size={28} />
            </div>

            <h3 className="mt-5 text-lg font-black text-[#241b1b]">
              No products found
            </h3>

            <p className="mt-2 max-w-md text-sm text-[#807575]">
              {search ||
              categoryId ||
              status !== "all"
                ? "Try changing your search or filters."
                : "You have not added any products yet."}
            </p>

            {search ||
            categoryId ||
            status !== "all" ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-2xl bg-[#8f1239] px-5 py-3 text-sm font-black text-white hover:bg-[#74102f]"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                href="/admin/products/create"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#8f1239] px-5 py-3 text-sm font-black text-white hover:bg-[#74102f]"
              >
                <Plus size={17} />
                Add First Product
              </Link>
            )}
          </div>
        ) : (
          /* =================================================
             PRODUCTS
          ================================================== */

          <div>
            {products.map(
              (product) => {
                const imageUrl =
                  getImageUrl(
                    product.image
                  );

                const stockStatus =
                  getStockStatus(
                    Number(
                      product.stock || 0
                    )
                  );

                return (
                  <div
                    key={product.id}
                    className="border-b border-[#eee8e1] px-4 py-5 last:border-b-0 sm:px-6"
                  >
                    {/* Desktop */}

                    <div className="hidden lg:grid lg:grid-cols-[minmax(280px,2fr)_1fr_120px_140px_120px_110px] lg:items-center lg:gap-4">
                      {/* Product */}

                      <div className="flex min-w-0 items-center gap-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-[#f6ecdf]">
                          {imageUrl ? (
                            <img
                              src={
                                imageUrl
                              }
                              alt={
                                product.name
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#a57945]">
                              <ImageIcon
                                size={
                                  23
                                }
                              />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-black text-[#241b1b]">
                              {
                                product.name
                              }
                            </h3>

                            {product.is_featured && (
                              <span className="flex-shrink-0 rounded-full bg-[#f6ecdf] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#8f1239]">
                                Featured
                              </span>
                            )}
                          </div>

                          <p className="mt-1 truncate text-xs font-medium text-[#9a8f88]">
                            SKU:{" "}
                            {
                              product.sku
                            }
                          </p>
                        </div>
                      </div>

                      {/* Category */}

                      <div>
                        <p className="text-sm font-semibold text-[#4f4540]">
                          {product
                            .category
                            ?.name ||
                            "Uncategorized"}
                        </p>
                      </div>

                      {/* Price */}

                      <div>
                        <p className="text-sm font-black text-[#8f1239]">
                          {formatPrice(
                            product.price
                          )}
                        </p>

                        {product.compare_price &&
                          Number(
                            product.compare_price
                          ) >
                            Number(
                              product.price
                            ) && (
                            <p className="mt-1 text-xs text-[#9a8f88] line-through">
                              {formatPrice(
                                product.compare_price
                              )}
                            </p>
                          )}
                      </div>

                      {/* Stock */}

                      <div>
                        <p className="text-sm font-black text-[#3f3632]">
                          {
                            product.stock
                          }
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[10px] font-bold ${stockStatus.className}`}
                        >
                          {
                            stockStatus.label
                          }
                        </span>
                      </div>

                      {/* Status */}

                      <div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${
                            product.is_active
                              ? "border-green-100 bg-green-50 text-green-700"
                              : "border-gray-100 bg-gray-50 text-gray-600"
                          }`}
                        >
                          {product.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      {/* Actions */}

                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          title="Edit product"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e0d7] text-[#665b55] transition hover:border-[#8f1239] hover:text-[#8f1239]"
                        >
                          <Edit3
                            size={16}
                          />
                        </Link>

                        <button
                          type="button"
                          title="Delete product"
                          onClick={() =>
                            handleDelete(
                              product
                            )
                          }
                          disabled={
                            deletingId ===
                            product.id
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId ===
                          product.id ? (
                            <Loader2
                              size={
                                16
                              }
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2
                              size={
                                16
                              }
                            />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* =================================================
                       MOBILE / TABLET CARD
                    ================================================== */}

                    <div className="lg:hidden">
                      <div className="flex gap-4">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-[#f6ecdf]">
                          {imageUrl ? (
                            <img
                              src={
                                imageUrl
                              }
                              alt={
                                product.name
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#a57945]">
                              <ImageIcon
                                size={
                                  25
                                }
                              />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-black text-[#241b1b]">
                              {
                                product.name
                              }
                            </h3>

                            {product.is_featured && (
                              <span className="rounded-full bg-[#f6ecdf] px-2 py-1 text-[10px] font-black text-[#8f1239]">
                                Featured
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-[#9a8f88]">
                            SKU:{" "}
                            {
                              product.sku
                            }
                          </p>

                          <p className="mt-2 text-lg font-black text-[#8f1239]">
                            {formatPrice(
                              product.price
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-[#fcfaf7] p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9a8f88]">
                            Category
                          </p>

                          <p className="mt-1 truncate text-xs font-bold text-[#3f3632]">
                            {product
                              .category
                              ?.name ||
                              "Uncategorized"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#fcfaf7] p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9a8f88]">
                            Stock
                          </p>

                          <p className="mt-1 text-xs font-black text-[#3f3632]">
                            {
                              product.stock
                            }
                          </p>

                          <span
                            className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[9px] font-bold ${stockStatus.className}`}
                          >
                            {
                              stockStatus.label
                            }
                          </span>
                        </div>

                        <div className="rounded-xl bg-[#fcfaf7] p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9a8f88]">
                            Status
                          </p>

                          <span
                            className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[10px] font-bold ${
                              product.is_active
                                ? "border-green-100 bg-green-50 text-green-700"
                                : "border-gray-100 bg-gray-50 text-gray-600"
                            }`}
                          >
                            {product.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>

                        <div className="rounded-xl bg-[#fcfaf7] p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9a8f88]">
                            Sizes
                          </p>

                          <p className="mt-1 truncate text-xs font-bold text-[#3f3632]">
                            {product
                              .sizes
                              ?.join(
                                ", "
                              ) ||
                              "No sizes"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e8e0d7] px-4 py-3 text-xs font-black text-[#665b55] transition hover:border-[#8f1239] hover:text-[#8f1239]"
                        >
                          <Edit3
                            size={15}
                          />
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              product
                            )
                          }
                          disabled={
                            deletingId ===
                            product.id
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 px-4 py-3 text-xs font-black text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId ===
                          product.id ? (
                            <Loader2
                              size={
                                15
                              }
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2
                              size={
                                15
                              }
                            />
                          )}

                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          PAGINATION
      ====================================================== */}

      {!loading &&
        products.length > 0 &&
        pagination.last_page > 1 && (
          <div className="mt-6 flex flex-col gap-4 rounded-[1.5rem] border border-[#e8e0d7] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-[#807575]">
              Page{" "}
              <span className="font-black text-[#241b1b]">
                {
                  pagination.current_page
                }
              </span>{" "}
              of{" "}
              <span className="font-black text-[#241b1b]">
                {pagination.last_page}
              </span>
            </p>

            <div className="flex items-center justify-center gap-2">
              {/* Previous */}

              <button
                type="button"
                onClick={() =>
                  goToPage(
                    pagination.current_page -
                      1
                  )
                }
                disabled={
                  pagination.current_page ===
                  1
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8e0d7] text-[#665b55] transition hover:border-[#8f1239] hover:text-[#8f1239] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft
                  size={17}
                />
              </button>

              {/* Pages */}

              {getPageNumbers().map(
                (page, index) =>
                  page < 0 ? (
                    <span
                      key={`dots-${index}`}
                      className="flex h-10 w-8 items-center justify-center text-sm font-bold text-[#9a8f88]"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        goToPage(
                          page
                        )
                      }
                      className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-black transition ${
                        pagination.current_page ===
                        page
                          ? "bg-[#8f1239] text-white"
                          : "border border-[#e8e0d7] text-[#665b55] hover:border-[#8f1239] hover:text-[#8f1239]"
                      }`}
                    >
                      {page}
                    </button>
                  )
              )}

              {/* Next */}

              <button
                type="button"
                onClick={() =>
                  goToPage(
                    pagination.current_page +
                      1
                  )
                }
                disabled={
                  pagination.current_page ===
                  pagination.last_page
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8e0d7] text-[#665b55] transition hover:border-[#8f1239] hover:text-[#8f1239] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight
                  size={17}
                />
              </button>
            </div>
          </div>
        )}
    </div>
  );
}