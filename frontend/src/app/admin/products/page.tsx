"use client";

import {
  AlertCircle,
  CheckCircle2,
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
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://api.vyojin.co.in/api/v1";

const IMAGE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL ||
  "http://api.vyojin.co.in/storage";

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

const ease = [0.22, 1, 0.36, 1] as const;

const pageVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease,
    },
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.42,
      ease,
    },
  },
};

const mobileCardVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease,
    },
  },
};

function SkeletonRow() {
  return (
    <div className="border-b border-[#eee7df] px-6 py-5 last:border-b-0">
      <div className="hidden lg:grid lg:grid-cols-[minmax(280px,2fr)_1fr_120px_140px_120px_110px] lg:items-center lg:gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-2xl bg-[#eee7df]" />
          <div className="flex-1">
            <div className="h-4 w-40 animate-pulse rounded-full bg-[#eee7df]" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded-full bg-[#f1ece7]" />
          </div>
        </div>

        <div className="h-4 w-24 animate-pulse rounded-full bg-[#eee7df]" />
        <div className="h-4 w-16 animate-pulse rounded-full bg-[#eee7df]" />

        <div>
          <div className="h-4 w-10 animate-pulse rounded-full bg-[#eee7df]" />
          <div className="mt-2 h-5 w-20 animate-pulse rounded-full bg-[#f1ece7]" />
        </div>

        <div className="h-7 w-20 animate-pulse rounded-full bg-[#eee7df]" />

        <div className="flex justify-end gap-2">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-[#eee7df]" />
          <div className="h-9 w-9 animate-pulse rounded-xl bg-[#eee7df]" />
        </div>
      </div>

      <div className="lg:hidden">
        <div className="flex gap-4">
          <div className="h-20 w-20 animate-pulse rounded-2xl bg-[#eee7df]" />
          <div className="flex-1">
            <div className="h-4 w-36 animate-pulse rounded-full bg-[#eee7df]" />
            <div className="mt-2 h-3 w-20 animate-pulse rounded-full bg-[#f1ece7]" />
            <div className="mt-3 h-5 w-24 animate-pulse rounded-full bg-[#eee7df]" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="h-16 animate-pulse rounded-xl bg-[#f6f1eb]" />
          <div className="h-16 animate-pulse rounded-xl bg-[#f6f1eb]" />
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

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

  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);

      const response = await fetch(`${API_URL}/categories`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load categories."
        );
      }

      const categoryData: Category[] = Array.isArray(result.data)
        ? result.data
        : result.data?.data || [];

      setCategories(categoryData);
    } catch (err) {
      console.error("Categories error:", err);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

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
          params.set("search", search.trim());
        }

        if (categoryId) {
          params.set("category_id", categoryId);
        }

        if (status !== "all") {
          params.set("status", status);
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

        const result: ProductsResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load products."
          );
        }

        if (Array.isArray(result.data)) {
          setProducts(result.data);

          setPagination({
            current_page: 1,
            last_page: 1,
            per_page: 12,
            total: result.data.length,
          });
        } else {
          setProducts(result.data.data || []);

          setPagination({
            current_page: result.data.current_page || 1,
            last_page: result.data.last_page || 1,
            per_page: result.data.per_page || 12,
            total:
              result.data.total ||
              result.data.data?.length ||
              0,
          });
        }
      } catch (err) {
        console.error("Products error:", err);

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

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, categoryId, status, fetchProducts]);

  const handleDelete = async (product: Product) => {
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

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to delete product."
        );
      }

      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );

      setPagination((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
      }));
    } catch (err) {
      console.error("Delete product error:", err);

      setDeleteError(
        err instanceof Error
          ? err.message
          : "Unable to delete product."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getImageUrl = (image?: string | null) => {
    if (!image) {
      return null;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${IMAGE_URL}/${image.replace(/^\/+/, "")}`;
  };

  const formatPrice = (price: number | string) => {
    const value = Number(price || 0);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) {
      return {
        label: "Out of Stock",
        dot: "bg-red-500",
        className:
          "border-red-100 bg-red-50 text-red-700",
      };
    }

    if (stock <= 5) {
      return {
        label: "Low Stock",
        dot: "bg-amber-500",
        className:
          "border-amber-100 bg-amber-50 text-amber-700",
      };
    }

    return {
      label: "In Stock",
      dot: "bg-emerald-500",
      className:
        "border-emerald-100 bg-emerald-50 text-emerald-700",
    };
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setStatus("all");
  };

  const goToPage = (page: number) => {
    if (
      page < 1 ||
      page > pagination.last_page ||
      page === pagination.current_page
    ) {
      return;
    }

    fetchProducts(page);
  };

  const getPageNumbers = () => {
    const pages: number[] = [];

    const current = pagination.current_page;
    const last = pagination.last_page;

    if (last <= 7) {
      for (let i = 1; i <= last; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (current > 3) {
      pages.push(-1);
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(last - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < last - 2) {
      pages.push(-2);
    }

    pages.push(last);

    return pages;
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (search.trim()) count++;
    if (categoryId) count++;
    if (status !== "all") count++;

    return count;
  }, [search, categoryId, status]);

  const activeProducts = useMemo(
    () => products.filter((product) => product.is_active).length,
    [products]
  );

  const featuredProducts = useMemo(
    () =>
      products.filter((product) => product.is_featured).length,
    [products]
  );

  const lowStockProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          Number(product.stock || 0) <= 5
      ).length,
    [products]
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="relative min-h-screen overflow-hidden pb-10"
    >
      {/* =====================================================
          PREMIUM AMBIENT BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, 15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#8f1239]/[0.045] blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -15, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[-150px] top-[420px] h-80 w-80 rounded-full bg-[#d8ad70]/[0.045] blur-3xl"
        />

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8ad70]/40 to-transparent" />
      </div>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e5d4bd] bg-[#fffaf4] px-3 py-1.5 shadow-sm">
              <Sparkles
                size={13}
                className="text-[#a57945]"
              />

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8f1239]">
                Catalog Management
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-[-0.04em] text-[#241b1b] sm:text-5xl">
              Products
              <span className="text-[#8f1239]">.</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#807575]">
              Manage your Navratri collection, product
              visibility, pricing and inventory from one
              premium workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() =>
                fetchProducts(pagination.current_page)
              }
              disabled={loading}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e6ddd4] bg-white px-5 py-3 text-sm font-black text-[#665b55] shadow-sm transition-all hover:border-[#b58b58] hover:text-[#8f1239] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : "transition-transform duration-500 group-hover:rotate-180"
                }
              />

              Refresh
            </motion.button>

            <Link href="/admin/products/create">
              <motion.div
                whileHover={{
                  y: -2,
                  scale: 1.01,
                }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#8f1239] px-5 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(143,18,57,0.18)] transition-all hover:bg-[#74102f] hover:shadow-[0_15px_35px_rgba(143,18,57,0.25)]"
              >
                <Plus size={18} />

                Add Product
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* =====================================================
            QUICK OVERVIEW
        ====================================================== */}

        <motion.div
          variants={itemVariants}
          className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4"
        >
          <motion.div
            whileHover={{ y: -3 }}
            className="group relative overflow-hidden rounded-3xl border border-[#e9dfd5] bg-white p-4 shadow-[0_8px_30px_rgba(55,32,22,0.035)] transition-shadow hover:shadow-[0_15px_40px_rgba(55,32,22,0.07)]"
          >
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[#8f1239]/[0.04] blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#9a8f88]">
                  Total
                </p>

                <p className="mt-1.5 text-2xl font-black tracking-tight text-[#241b1b]">
                  {pagination.total}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8eee3] text-[#8f1239] transition-transform duration-300 group-hover:scale-110">
                <Package size={19} />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="group relative overflow-hidden rounded-3xl border border-[#e9dfd5] bg-white p-4 shadow-[0_8px_30px_rgba(55,32,22,0.035)] transition-shadow hover:shadow-[0_15px_40px_rgba(55,32,22,0.07)]"
          >
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-emerald-500/[0.035] blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#9a8f88]">
                  Active
                </p>

                <p className="mt-1.5 text-2xl font-black tracking-tight text-[#241b1b]">
                  {activeProducts}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
                <CheckCircle2 size={19} />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="group relative overflow-hidden rounded-3xl border border-[#e9dfd5] bg-white p-4 shadow-[0_8px_30px_rgba(55,32,22,0.035)] transition-shadow hover:shadow-[0_15px_40px_rgba(55,32,22,0.07)]"
          >
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[#d8ad70]/[0.05] blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#9a8f88]">
                  Featured
                </p>

                <p className="mt-1.5 text-2xl font-black tracking-tight text-[#241b1b]">
                  {featuredProducts}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fbf2e6] text-[#a57945] transition-transform duration-300 group-hover:scale-110">
                <Sparkles size={19} />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="group relative overflow-hidden rounded-3xl border border-[#e9dfd5] bg-white p-4 shadow-[0_8px_30px_rgba(55,32,22,0.035)] transition-shadow hover:shadow-[0_15px_40px_rgba(55,32,22,0.07)]"
          >
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-amber-500/[0.04] blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#9a8f88]">
                  Attention
                </p>

                <p className="mt-1.5 text-2xl font-black tracking-tight text-[#241b1b]">
                  {lowStockProducts}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-transform duration-300 group-hover:scale-110">
                <TrendingUp size={19} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
              height: 0,
            }}
            animate={{
              opacity: 1,
              y: 0,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              y: -10,
              height: 0,
            }}
            className="mt-6 overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm">
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
                  className="mt-2 font-black underline underline-offset-2"
                >
                  Try again
                </button>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-lg p-1 hover:bg-red-100"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteError && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            className="mt-4"
          >
            <div className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              <span>{deleteError}</span>

              <button
                type="button"
                onClick={() => setDeleteError("")}
                className="rounded-lg p-1 hover:bg-red-100"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.25,
          duration: 0.45,
          ease,
        }}
        className="relative mt-7 overflow-hidden rounded-[1.7rem] border border-[#e7ddd3] bg-white p-5 shadow-[0_10px_40px_rgba(55,32,22,0.04)]"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8ad70]/50 to-transparent" />

        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-[#241b1b]">
              Product Filters
            </p>

            <p className="mt-0.5 text-xs text-[#9a8f88]">
              Find and manage products quickly.
            </p>
          </div>

          {activeFilterCount > 0 && (
            <span className="rounded-full bg-[#f8eee3] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#8f1239]">
              {activeFilterCount} active
            </span>
          )}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_210px_180px_auto]">
          {/* Search */}

          <div className="group relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9a8f88] transition-colors group-focus-within:text-[#8f1239]"
            />

            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by product name or SKU..."
              className="w-full rounded-2xl border border-[#e7ddd3] bg-[#fcfaf7] py-3.5 pl-11 pr-4 text-sm font-medium text-[#3f3632] outline-none transition-all placeholder:text-[#aaa09a] focus:border-[#b98a55] focus:bg-white focus:ring-4 focus:ring-[#8f1239]/[0.05]"
            />
          </div>

          {/* Category */}

          <select
            value={categoryId}
            onChange={(e) =>
              setCategoryId(e.target.value)
            }
            disabled={loadingCategories}
            className="rounded-2xl border border-[#e7ddd3] bg-[#fcfaf7] px-4 py-3.5 text-sm font-bold text-[#3f3632] outline-none transition-all focus:border-[#b98a55] focus:bg-white focus:ring-4 focus:ring-[#8f1239]/[0.05] disabled:opacity-60"
          >
            <option value="">
              {loadingCategories
                ? "Loading categories..."
                : "All Categories"}
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          {/* Status */}

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="rounded-2xl border border-[#e7ddd3] bg-[#fcfaf7] px-4 py-3.5 text-sm font-bold text-[#3f3632] outline-none transition-all focus:border-[#b98a55] focus:bg-white focus:ring-4 focus:ring-[#8f1239]/[0.05]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="featured">Featured</option>
          </select>

          {/* Clear */}

          {activeFilterCount > 0 ? (
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e7ddd3] bg-white px-5 py-3 text-sm font-black text-[#665b55] transition-all hover:border-[#8f1239] hover:text-[#8f1239] hover:shadow-sm"
            >
              <X size={16} />
              Clear
            </motion.button>
          ) : (
            <div className="hidden lg:block" />
          )}
        </div>
      </motion.section>

      {/* =====================================================
          PRODUCTS
      ====================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.3,
          duration: 0.5,
          ease,
        }}
        className="relative mt-6 overflow-hidden rounded-[1.7rem] border border-[#e7ddd3] bg-white shadow-[0_12px_45px_rgba(55,32,22,0.045)]"
      >
        {/* Top accent */}

        <div className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#d8ad70]/50 to-transparent" />

        {/* Table Header */}

        <div className="hidden border-b border-[#eee7df] bg-[#fffdfb] px-6 py-4 lg:grid lg:grid-cols-[minmax(280px,2fr)_1fr_120px_140px_120px_110px] lg:items-center lg:gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9a8f88]">
            Product
          </p>

          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9a8f88]">
            Category
          </p>

          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9a8f88]">
            Price
          </p>

          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9a8f88]">
            Inventory
          </p>

          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9a8f88]">
            Status
          </p>

          <p className="text-right text-[10px] font-black uppercase tracking-[0.18em] text-[#9a8f88]">
            Actions
          </p>
        </div>

        {/* Loading */}

        {loading ? (
          <div>
            {[1, 2, 3, 4, 5].map((item) => (
              <SkeletonRow key={item} />
            ))}
          </div>
        ) : products.length === 0 ? (
          /* =================================================
             EMPTY
          ================================================== */

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="flex min-h-[390px] flex-col items-center justify-center px-6 py-12 text-center"
          >
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-[#f8eee3] text-[#8f1239] shadow-inner"
            >
              <div className="absolute inset-0 rounded-[1.7rem] border border-[#d8ad70]/30" />

              <Package size={31} />
            </motion.div>

            <h3 className="mt-6 text-xl font-black tracking-tight text-[#241b1b]">
              No products found
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#807575]">
              {search ||
              categoryId ||
              status !== "all"
                ? "Try changing your search or filters to find what you are looking for."
                : "Your product catalog is currently empty. Start building your Navratri collection."}
            </p>

            {search ||
            categoryId ||
            status !== "all" ? (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-2xl bg-[#8f1239] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[#8f1239]/15 transition hover:bg-[#74102f]"
              >
                Clear Filters
              </motion.button>
            ) : (
              <Link href="/admin/products/create">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#8f1239] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[#8f1239]/15 transition hover:bg-[#74102f]"
                >
                  <Plus size={17} />
                  Add First Product
                </motion.div>
              </Link>
            )}
          </motion.div>
        ) : (
          /* =================================================
             PRODUCTS
          ================================================== */

          <>
            {/* Desktop */}

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="hidden lg:block"
            >
              <AnimatePresence mode="popLayout">
                {products.map((product) => {
                  const imageUrl = getImageUrl(
                    product.image
                  );

                  const stock = Number(
                    product.stock || 0
                  );

                  const stockStatus =
                    getStockStatus(stock);

                  const stockWidth = Math.min(
                    100,
                    Math.max(
                      stock <= 0 ? 0 : stock * 4,
                      5
                    )
                  );

                  return (
                    <motion.div
                      layout
                      key={product.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{
                        opacity: 0,
                        x: -20,
                        height: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                      }}
                      whileHover={{
                        backgroundColor:
                          "#fffdfa",
                      }}
                      className="group relative border-b border-[#eee7df] px-6 py-5 last:border-b-0"
                    >
                      {/* Hover line */}

                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{
                          duration: 0.3,
                        }}
                        className="absolute inset-y-0 left-0 w-[2px] origin-left bg-[#8f1239]"
                      />

                      <div className="grid grid-cols-[minmax(280px,2fr)_1fr_120px_140px_120px_110px] items-center gap-4">
                        {/* Product */}

                        <div className="flex min-w-0 items-center gap-4">
                          <motion.div
                            whileHover={{
                              scale: 1.06,
                            }}
                            className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-[#f7efe5] shadow-sm"
                          >
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[#a57945]">
                                <ImageIcon
                                  size={23}
                                />
                              </div>
                            )}

                            {product.is_featured && (
                              <div className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[#8f1239] shadow-sm backdrop-blur">
                                <Sparkles size={11} />
                              </div>
                            )}
                          </motion.div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-sm font-black text-[#241b1b] transition-colors group-hover:text-[#8f1239]">
                                {product.name}
                              </h3>

                              {product.is_featured && (
                                <motion.span
                                  initial={{
                                    opacity: 0,
                                    scale: 0.8,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    scale: 1,
                                  }}
                                  className="flex-shrink-0 rounded-full border border-[#ead8c1] bg-[#fbf2e7] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[#8f1239]"
                                >
                                  Featured
                                </motion.span>
                              )}
                            </div>

                            <p className="mt-1 truncate text-[11px] font-semibold text-[#9a8f88]">
                              SKU: {product.sku}
                            </p>
                          </div>
                        </div>

                        {/* Category */}

                        <div>
                          <span className="inline-flex rounded-xl bg-[#faf7f3] px-3 py-2 text-xs font-bold text-[#4f4540]">
                            {product.category?.name ||
                              "Uncategorized"}
                          </span>
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
                              <p className="mt-1 text-[10px] font-medium text-[#aaa09a] line-through">
                                {formatPrice(
                                  product.compare_price
                                )}
                              </p>
                            )}
                        </div>

                        {/* Inventory */}

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-[#3f3632]">
                              {stock}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-black ${stockStatus.className}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${stockStatus.dot} ${
                                  stock <= 5
                                    ? "animate-pulse"
                                    : ""
                                }`}
                              />

                              {stockStatus.label}
                            </span>
                          </div>

                          <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-[#eee7df]">
                            <motion.div
                              initial={{
                                width: 0,
                              }}
                              animate={{
                                width: `${stockWidth}%`,
                              }}
                              transition={{
                                duration: 0.8,
                                delay: 0.2,
                              }}
                              className={`h-full rounded-full ${
                                stock <= 0
                                  ? "bg-red-400"
                                  : stock <= 5
                                  ? "bg-amber-400"
                                  : "bg-emerald-500"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Status */}

                        <div>
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black ${
                              product.is_active
                                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                : "border-gray-100 bg-gray-50 text-gray-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                product.is_active
                                  ? "bg-emerald-500"
                                  : "bg-gray-400"
                              }`}
                            />

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
                          >
                            <motion.div
                              whileHover={{
                                y: -2,
                                scale: 1.05,
                              }}
                              whileTap={{
                                scale: 0.93,
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5ddd4] bg-white text-[#665b55] shadow-sm transition-colors hover:border-[#8f1239] hover:bg-[#fff9f4] hover:text-[#8f1239]"
                            >
                              <Edit3 size={16} />
                            </motion.div>
                          </Link>

                          <motion.button
                            whileHover={{
                              y: -2,
                              scale: 1.05,
                            }}
                            whileTap={{
                              scale: 0.93,
                            }}
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
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 shadow-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId ===
                            product.id ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={16}
                              />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* =================================================
                MOBILE / TABLET
            ================================================== */}

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-[#eee7df] lg:hidden"
            >
              {products.map((product) => {
                const imageUrl = getImageUrl(
                  product.image
                );

                const stock = Number(
                  product.stock || 0
                );

                const stockStatus =
                  getStockStatus(stock);

                return (
                  <motion.div
                    layout
                    key={product.id}
                    variants={mobileCardVariants}
                    className="p-4 sm:p-6"
                  >
                    <div className="rounded-[1.4rem] border border-[#eee5dc] bg-[#fffdfa] p-4 shadow-sm transition-all hover:shadow-md">
                      <div className="flex gap-4">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-[#f7efe5]">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#a57945]">
                              <ImageIcon
                                size={25}
                              />
                            </div>
                          )}

                          {product.is_featured && (
                            <div className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[#8f1239] shadow-sm">
                              <Sparkles size={11} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start gap-2">
                            <h3 className="line-clamp-2 text-sm font-black leading-5 text-[#241b1b]">
                              {product.name}
                            </h3>

                            {product.is_featured && (
                              <span className="rounded-full bg-[#f8eee3] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[#8f1239]">
                                Featured
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-[11px] font-semibold text-[#9a8f88]">
                            SKU: {product.sku}
                          </p>

                          <p className="mt-2 text-lg font-black text-[#8f1239]">
                            {formatPrice(
                              product.price
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2.5">
                        <div className="rounded-xl bg-white p-3 ring-1 ring-[#eee5dc]">
                          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#9a8f88]">
                            Category
                          </p>

                          <p className="mt-1 truncate text-xs font-black text-[#3f3632]">
                            {product.category
                              ?.name ||
                              "Uncategorized"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3 ring-1 ring-[#eee5dc]">
                          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#9a8f88]">
                            Stock
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs font-black text-[#3f3632]">
                              {stock}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-black ${stockStatus.className}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${stockStatus.dot}`}
                              />
                              {stockStatus.label}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-xl bg-white p-3 ring-1 ring-[#eee5dc]">
                          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#9a8f88]">
                            Status
                          </p>

                          <span
                            className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-black ${
                              product.is_active
                                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                : "border-gray-100 bg-gray-50 text-gray-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                product.is_active
                                  ? "bg-emerald-500"
                                  : "bg-gray-400"
                              }`}
                            />

                            {product.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>

                        <div className="rounded-xl bg-white p-3 ring-1 ring-[#eee5dc]">
                          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#9a8f88]">
                            Sizes
                          </p>

                          <p className="mt-1 truncate text-xs font-black text-[#3f3632]">
                            {product.sizes?.join(
                              ", "
                            ) || "No sizes"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="flex flex-1"
                        >
                          <motion.div
                            whileTap={{
                              scale: 0.97,
                            }}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e5ddd4] bg-white px-4 py-3 text-xs font-black text-[#665b55] transition-all hover:border-[#8f1239] hover:text-[#8f1239]"
                          >
                            <Edit3 size={15} />
                            Edit
                          </motion.div>
                        </Link>

                        <motion.button
                          whileTap={{
                            scale: 0.97,
                          }}
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
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-3 text-xs font-black text-red-500 transition-all hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId ===
                          product.id ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={15} />
                          )}

                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </motion.section>

      {/* =====================================================
          PAGINATION
      ====================================================== */}

      <AnimatePresence>
        {!loading &&
          products.length > 0 &&
          pagination.last_page > 1 && (
            <motion.div
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mt-5 flex flex-col gap-4 rounded-[1.5rem] border border-[#e7ddd3] bg-white p-4 shadow-[0_8px_30px_rgba(55,32,22,0.035)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-[#807575]">
                  Showing{" "}
                  <span className="font-black text-[#241b1b]">
                    {products.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-black text-[#241b1b]">
                    {pagination.total}
                  </span>{" "}
                  products
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#aaa09a]">
                  Page {pagination.current_page} of{" "}
                  {pagination.last_page}
                </p>
              </div>

              <div className="flex items-center justify-center gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={() =>
                    goToPage(
                      pagination.current_page - 1
                    )
                  }
                  disabled={
                    pagination.current_page ===
                    1
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5ddd4] bg-white text-[#665b55] transition-all hover:border-[#8f1239] hover:text-[#8f1239] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft size={17} />
                </motion.button>

                {getPageNumbers().map(
                  (page, index) =>
                    page < 0 ? (
                      <span
                        key={`dots-${index}`}
                        className="flex h-10 w-7 items-center justify-center text-sm font-bold text-[#aaa09a]"
                      >
                        ···
                      </span>
                    ) : (
                      <motion.button
                        whileHover={{
                          y: -1,
                        }}
                        whileTap={{
                          scale: 0.94,
                        }}
                        key={page}
                        type="button"
                        onClick={() =>
                          goToPage(page)
                        }
                        className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-black transition-all ${
                          pagination.current_page ===
                          page
                            ? "bg-[#8f1239] text-white shadow-md shadow-[#8f1239]/20"
                            : "border border-[#e5ddd4] bg-white text-[#665b55] hover:border-[#8f1239] hover:text-[#8f1239]"
                        }`}
                      >
                        {page}
                      </motion.button>
                    )
                )}

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={() =>
                    goToPage(
                      pagination.current_page + 1
                    )
                  }
                  disabled={
                    pagination.current_page ===
                    pagination.last_page
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5ddd4] bg-white text-[#665b55] transition-all hover:border-[#8f1239] hover:text-[#8f1239] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronRight size={17} />
                </motion.button>
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* =====================================================
          PAGE FOOTER
      ====================================================== */}

      {!loading && products.length > 0 && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.5,
          }}
          className="mt-5 flex items-center justify-between px-1"
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#aaa09a]">
              Catalog system online
            </span>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c0b6af]">
            Navratri Store
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}