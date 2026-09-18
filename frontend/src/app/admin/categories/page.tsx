"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  FolderTree,
  Package,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = "http://api.vyojin.co.in/api/v1";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  products_count?: number;
  created_at?: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: Category[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  message?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("admin_token");
  };

  const fetchCategories = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("per_page", "15");

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status) {
        params.set("status", status);
      }

      const response = await fetch(
        `${API_URL}/admin/categories?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
        return;
      }

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load categories.");
      }

      setCategories(result.data.data);

      setPagination({
        current_page: result.data.current_page,
        last_page: result.data.last_page,
        total: result.data.total,
        per_page: result.data.per_page,
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCategories(1);
  };

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(category.id);
      setError("");
      setMessage("");

      const token = getToken();

      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/categories/${category.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete category.");
      }

      setMessage(result.message || "Category deleted successfully.");

      await fetchCategories(
        categories.length === 1 && pagination.current_page > 1
          ? pagination.current_page - 1
          : pagination.current_page
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete category."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const activeCount = categories.filter(
    (category) => category.is_active
  ).length;

  const inactiveCount = categories.filter(
    (category) => !category.is_active
  ).length;

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Link
                href="/admin/dashboard"
                className="transition hover:text-gray-900"
              >
                Dashboard
              </Link>

              <span>/</span>

              <span className="text-gray-900">Categories</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Categories
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your product categories and visibility.
            </p>
          </div>

          <Link
            href="/admin/categories/create"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
          >
            <Plus size={18} />
            Add Category
          </Link>
        </div>

        {/* Alerts */}
        {message && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle size={18} />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Categories</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {pagination.total}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <FolderTree size={21} className="text-gray-700" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {activeCount}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                <CheckCircle2 size={21} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactive</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {inactiveCount}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <XCircle size={21} className="text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 lg:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search category name or slug..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
              />
            </div>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);

                setTimeout(() => {
                  fetchCategories(1);
                }, 0);
              }}
              className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-gray-400"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <Search size={17} />
              Search
            </button>

            <button
              type="button"
              onClick={() => fetchCategories(pagination.current_page)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </form>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Slug
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Products
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Created
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-sm text-gray-500"
                    >
                      Loading categories...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center"
                    >
                      <FolderTree
                        size={40}
                        className="mx-auto text-gray-300"
                      />

                      <p className="mt-3 text-sm font-medium text-gray-900">
                        No categories found
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Create your first category to get started.
                      </p>
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr
                      key={category.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {category.name}
                          </p>

                          {category.description && (
                            <p className="mt-1 max-w-[350px] truncate text-sm text-gray-500">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-xs text-gray-600">
                          {category.slug}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-gray-700">
                          <Package size={16} className="text-gray-400" />
                          {category.products_count ?? 0}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-center">
                        {category.is_active ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-500">
                        {formatDate(category.created_at)}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/categories/${category.id}/edit`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(category)}
                            disabled={deletingId === category.id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === category.id ? (
                              <RefreshCw
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="space-y-3 md:hidden">
          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <FolderTree
                size={40}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 font-medium text-gray-900">
                No categories found
              </p>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {category.name}
                    </h3>

                    <p className="mt-1 font-mono text-xs text-gray-500">
                      {category.slug}
                    </p>
                  </div>

                  {category.is_active ? (
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                      Inactive
                    </span>
                  )}
                </div>

                {category.description && (
                  <p className="mt-3 text-sm text-gray-500">
                    {category.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Package size={16} />
                    {category.products_count ?? 0} products
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700"
                    >
                      <Edit size={15} />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      disabled={deletingId === category.id}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-100 px-3 text-sm font-medium text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.last_page > 1 && (
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Page{" "}
              <span className="font-semibold text-gray-900">
                {pagination.current_page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {pagination.last_page}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.current_page <= 1}
                onClick={() =>
                  fetchCategories(pagination.current_page - 1)
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                type="button"
                disabled={
                  pagination.current_page >= pagination.last_page
                }
                onClick={() =>
                  fetchCategories(pagination.current_page + 1)
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}