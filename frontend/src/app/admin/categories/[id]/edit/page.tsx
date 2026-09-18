"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FolderTree,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://api.vyojin.co.in/api/v1";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  products_count?: number;
}

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    is_active: true,
  });

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("admin_token");
  };

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const fetchCategory = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/categories/${id}`,
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
        router.push("/admin/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load category."
        );
      }

      const data: Category = result.data;

      setCategory(data);

      setForm({
        name: data.name || "",
        slug: data.slug || "",
        description: data.description || "",
        is_active: Boolean(data.is_active),
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load category."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      name: value,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target;

    if (
      target instanceof HTMLInputElement &&
      target.type === "checkbox"
    ) {
      setForm((prev) => ({
        ...prev,
        [target.name]: target.checked,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [target.name]: target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Category slug is required.");
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/categories/${id}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name.trim(),
            slug: form.slug.trim(),
            description: form.description.trim() || null,
            is_active: form.is_active,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.errors) {
          const firstError = Object.values(result.errors)
            .flat()
            .find(Boolean);

          throw new Error(
            typeof firstError === "string"
              ? firstError
              : result.message || "Failed to update category."
          );
        }

        throw new Error(
          result.message || "Failed to update category."
        );
      }

      setSuccess(
        result.message || "Category updated successfully."
      );

      setTimeout(() => {
        router.push("/admin/categories");
      }, 700);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating category."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f7f8fa]">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Loader2 size={20} className="animate-spin" />
          Loading category...
        </div>
      </div>
    );
  }

  if (!category && error) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>

            <Link
              href="/admin/categories"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm"
            >
              <ArrowLeft size={16} />
              Back to Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/categories"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={17} />
            Back to Categories
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm">
              <FolderTree size={23} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Edit Category
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Update category information and visibility.
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* Basic Information */}
            <div className="border-b border-gray-100 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Category Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update the details of this category.
                </p>
              </div>

              <div className="space-y-6">

                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Category Name
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleNameChange}
                    placeholder="Women's Chaniya Choli"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
                  />
                </div>

                {/* Slug */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="slug"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Slug
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          slug: generateSlug(prev.name),
                        }))
                      }
                      className="text-xs font-semibold text-gray-500 transition hover:text-gray-900"
                    >
                      Generate from name
                    </button>
                  </div>

                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="womens-chaniya-choli"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-mono text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Example: womens-chaniya-choli
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Write a short description..."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
                  />
                </div>

                {/* Product Count */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Products
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Products currently assigned to this category.
                      </p>
                    </div>

                    <div className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-sm">
                      {category?.products_count ?? 0}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Active Category
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Active categories can be displayed on the
                        storefront.
                      </p>
                    </div>

                    <div className="relative">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={form.is_active}
                        onChange={handleChange}
                        className="peer sr-only"
                      />

                      <div className="h-7 w-12 rounded-full bg-gray-300 transition peer-checked:bg-gray-900" />

                      <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 bg-gray-50 p-6 sm:flex-row sm:items-center sm:justify-end md:px-8">
              <Link
                href="/admin/categories"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}