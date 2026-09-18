"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://api.vyojin.co.in/api/v1";

const STORAGE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL ||
  "http://api.vyojin.co.in/storage";

interface Category {
  id: number;
  name: string;
  slug?: string;
}

interface Product {
  id: number;
  category_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  compare_price: number | string | null;
  gst_rate: number;
  sku: string | null;
  stock: number;
  image: string | null;
  images: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
 
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    category_id: "",
    name: "",
    slug: "",
    description: "",
    price: "",
    compare_price: "",
    gst_rate: "0",
    sku: "",
    stock: "0",
    is_active: true,
    is_featured: false,
    is_new_arrival: false,
  });

  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");

  const [existingMainImage, setExistingMainImage] =
    useState<string | null>(null);

  const [existingImages, setExistingImages] =
    useState<string[]>([]);

  const [mainImage, setMainImage] =
    useState<File | null>(null);

  const [mainImagePreview, setMainImagePreview] =
    useState<string | null>(null);

  const [additionalImages, setAdditionalImages] =
    useState<File[]>([]);

  const [additionalImagePreviews, setAdditionalImagePreviews] =
    useState<string[]>([]);

  const [removeMainImage, setRemoveMainImage] =
    useState(false);

  const [removeExistingImages, setRemoveExistingImages] =
    useState<string[]>([]);

  /*
  |--------------------------------------------------------------------------
  | Authentication
  |--------------------------------------------------------------------------
  */

  const getToken = () => {
    if (typeof window === "undefined") return null;

    return localStorage.getItem("admin_token");
  };

  /*
  |--------------------------------------------------------------------------
  | Image URL
  |--------------------------------------------------------------------------
  */

  const getImageUrl = (image: string | null) => {
    if (!image) return "";

    if (image.startsWith("http://")) {
      return image;
    }

    if (image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/storage/")) {
      return `http://api.vyojin.co.in${image}`;
    }

    if (image.startsWith("storage/")) {
      return `http://api.vyojin.co.in/${image}`;
    }

    return `${STORAGE_URL}/${image}`;
  };

  /*
  |--------------------------------------------------------------------------
  | Load Categories
  |--------------------------------------------------------------------------
  */

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${API_URL}/categories`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load categories.");
      }

      const result = await response.json();

      let categoryData = [];

      if (Array.isArray(result?.data)) {
        categoryData = result.data;
      } else if (Array.isArray(result?.data?.data)) {
        categoryData = result.data.data;
      }

      setCategories(categoryData);
    } catch (err) {
      console.error("Category error:", err);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Load Product
  |--------------------------------------------------------------------------
  */

  const fetchProduct = async () => {
    const token = getToken();

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/products/${productId}`,
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
        router.replace("/admin/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load product."
        );
      }

      const product: Product = result.data;

      setForm({
        category_id: product.category_id
          ? String(product.category_id)
          : "",
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        price:
          product.price !== null &&
          product.price !== undefined
            ? String(product.price)
            : "",
        compare_price:
          product.compare_price !== null &&
          product.compare_price !== undefined
            ? String(product.compare_price)
            : "",
            gst_rate: String(product.gst_rate ?? 0),
        sku: product.sku || "",
        stock:
          product.stock !== null &&
          product.stock !== undefined
            ? String(product.stock)
            : "0",
        is_active: Boolean(product.is_active),
        is_featured: Boolean(product.is_featured),
        is_new_arrival: Boolean(product.is_new_arrival),
      });

      setSizes(
        Array.isArray(product.sizes)
          ? product.sizes
          : []
      );

      setColors(
        Array.isArray(product.colors)
          ? product.colors
          : []
      );

      setExistingMainImage(product.image || null);

      setExistingImages(
        Array.isArray(product.images)
          ? product.images
          : []
      );
    } catch (err: any) {
      console.error("Product error:", err);

      setError(
        err?.message ||
          "Something went wrong while loading the product."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productId) return;

    fetchCategories();
    fetchProduct();
  }, [productId]);

  /*
  |--------------------------------------------------------------------------
  | Form Change
  |--------------------------------------------------------------------------
  */

const handleChange = (
  e: ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
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

  /*
  |--------------------------------------------------------------------------
  | Slug
  |--------------------------------------------------------------------------
  */

  const generateSlug = () => {
    const slug = form.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setForm((prev) => ({
      ...prev,
      slug,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Sizes
  |--------------------------------------------------------------------------
  */

  const addSize = () => {
    const size = newSize.trim();

    if (!size) return;

    if (
      sizes.some(
        (item) =>
          item.toLowerCase() === size.toLowerCase()
      )
    ) {
      return;
    }

    setSizes((prev) => [...prev, size]);
    setNewSize("");
  };

  const removeSize = (index: number) => {
    setSizes((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Colors
  |--------------------------------------------------------------------------
  */

  const addColor = () => {
    const color = newColor.trim();

    if (!color) return;

    if (
      colors.some(
        (item) =>
          item.toLowerCase() === color.toLowerCase()
      )
    ) {
      return;
    }

    setColors((prev) => [...prev, color]);
    setNewColor("");
  };

  const removeColor = (index: number) => {
    setColors((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Main Image
  |--------------------------------------------------------------------------
  */

  const handleMainImage = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setMainImage(file);
    setRemoveMainImage(false);

    const preview = URL.createObjectURL(file);

    setMainImagePreview(preview);
  };

  const clearNewMainImage = () => {
    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
    }

    setMainImage(null);
    setMainImagePreview(null);
  };

  const deleteMainImage = () => {
    setRemoveMainImage(true);
    setExistingMainImage(null);
    clearNewMainImage();
  };

  /*
  |--------------------------------------------------------------------------
  | Additional Images
  |--------------------------------------------------------------------------
  */

  const handleAdditionalImages = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setAdditionalImages((prev) => [
      ...prev,
      ...files,
    ]);

    setAdditionalImagePreviews((prev) => [
      ...prev,
      ...previews,
    ]);

    e.target.value = "";
  };

  const removeNewAdditionalImage = (
    index: number
  ) => {
    const preview =
      additionalImagePreviews[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setAdditionalImages((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setAdditionalImagePreviews((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Existing Additional Images
  |--------------------------------------------------------------------------
  */

  const deleteExistingImage = (image: string) => {
    setRemoveExistingImages((prev) => [
      ...prev,
      image,
    ]);

    setExistingImages((prev) =>
      prev.filter((item) => item !== image)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const formData = new FormData();

      if (form.category_id) {
        formData.append(
          "category_id",
          form.category_id
        );
      }

      formData.append("name", form.name.trim());

      formData.append(
        "slug",
        form.slug.trim()
      );

      formData.append(
        "description",
        form.description
      );

      formData.append(
        "price",
        form.price
      );

      if (form.compare_price) {
        formData.append(
          "compare_price",
          form.compare_price
        );
      }

      if (form.sku.trim()) {
        formData.append(
          "sku",
          form.sku.trim()
        );
      }

      formData.append(
        "stock",
        form.stock
      );

      formData.append(
        "is_active",
        form.is_active ? "1" : "0"
      );

      formData.append(
        "is_featured",
        form.is_featured ? "1" : "0"
      );
      formData.append(
          "is_new_arrival",
          form.is_new_arrival ? "1" : "0"
        );
        formData.append(
          "gst_rate",
          form.gst_rate || "0"
        );

      /*
      | Sizes
      */

      sizes.forEach((size) => {
        formData.append(
          "sizes[]",
          size
        );
      });

      /*
      | Colors
      */

      colors.forEach((color) => {
        formData.append(
          "colors[]",
          color
        );
      });

      /*
      | Main image
      */

      if (mainImage) {
        formData.append(
          "image",
          mainImage
        );
      }

      /*
      | Existing main image removal
      */

      if (removeMainImage) {
        formData.append(
          "remove_image",
          "1"
        );
      }

      /*
      | Existing additional images
      */

      removeExistingImages.forEach(
        (image) => {
          formData.append(
            "remove_images[]",
            image
          );
        }
      );

      /*
      | New additional images
      */

      additionalImages.forEach(
        (file) => {
          formData.append(
            "images[]",
            file
          );
        }
      );

      /*
      |--------------------------------------------------------------------------
      | Laravel multipart update
      |--------------------------------------------------------------------------
      |
      | POST + _method=PUT is used because file uploads
      | with PUT/PATCH can be problematic in PHP/Laravel.
      |
      */

      formData.append(
        "_method",
        "PUT"
      );

      const response = await fetch(
        `${API_URL}/admin/products/${productId}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.status === 401) {
        localStorage.removeItem(
          "admin_token"
        );

        router.replace("/admin/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.errors) {
          const firstError =
            Object.values(result.errors)
              .flat()
              .find(
                (message) =>
                  typeof message === "string"
              );

          throw new Error(
            String(
              firstError ||
                result.message ||
                "Validation failed."
            )
          );
        }

        throw new Error(
          result.message ||
            "Failed to update product."
        );
      }

      setSuccess(
        "Product updated successfully."
      );

      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 700);
    } catch (err: any) {
      console.error(
        "Update product error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while updating the product."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#faf9f7]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

          <p className="text-sm text-gray-500">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#faf9f7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <Link
              href="/admin/products"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
            >
              <ArrowLeft
                size={19}
              />
            </Link>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
                Admin / Products
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                Edit Product
              </h1>
            </div>

          </div>

          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Back to Products
          </Link>

        </div>

        {/* Alerts */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Basic Information */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update the basic details of your product.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">

              {/* Name */}

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Product Name
                  <span className="text-red-500">
                    {" "}*
                  </span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Example: Premium Navratri Lehenga"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                />
              </div>

              {/* Slug */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Slug
                </label>

                <div className="flex gap-2">

                  <input
                    type="text"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="premium-navratri-lehenga"
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
                  />

                  <button
                    type="button"
                    onClick={generateSlug}
                    className="rounded-xl border border-gray-200 px-4 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Generate
                  </button>

                </div>
              </div>

              {/* Category */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>

                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
                >
                  <option value="">
                    Select category
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
              </div>

              {/* Description */}

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Write product description..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
                />
              </div>

            </div>

          </section>

          {/* Pricing & Inventory */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Pricing & Inventory
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage product pricing, SKU and stock.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {/* Price */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Price *
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-xl border border-gray-200 py-3 pl-8 pr-4 text-sm outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              {/* Compare Price */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Compare Price
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="compare_price"
                    value={form.compare_price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-gray-200 py-3 pl-8 pr-4 text-sm outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div>
                  <label className="mb-2 block text-sm font-semibold text-[#3f3632]">
                    GST Rate (%)
                  </label>

                  <input
                    type="number"
                    name="gst_rate"
                    value={form.gst_rate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="e.g. 5"
                    className="h-12 w-full rounded-xl border border-[#eee8e1] bg-white px-4 text-sm text-[#3f3632] outline-none transition focus:border-[#8f1239] focus:ring-4 focus:ring-[#8f1239]/10"
                  />

                  <p className="mt-1.5 text-xs text-[#9a8f88]">
                    Enter the GST percentage for this product.
                  </p>
                </div>

              {/* SKU */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  SKU
                </label>

                <input
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="NV-001"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
                />
              </div>

              {/* Stock */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Stock *
                </label>

                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
                />
              </div>

            </div>

          </section>

          {/* Sizes */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Sizes
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add available product sizes.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <input
                type="text"
                value={newSize}
                onChange={(e) =>
                  setNewSize(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSize();
                  }
                }}
                placeholder="Example: M"
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
              />

              <button
                type="button"
                onClick={addSize}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-black"
              >
                <Plus size={17} />
                Add Size
              </button>

            </div>

            {sizes.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">

                {sizes.map(
                  (size, index) => (
                    <div
                      key={`${size}-${index}`}
                      className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700"
                    >
                      <span>{size}</span>

                      <button
                        type="button"
                        onClick={() =>
                          removeSize(index)
                        }
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  )
                )}

              </div>
            )}

          </section>

          {/* Colors */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Colors
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add available product colors.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <input
                type="text"
                value={newColor}
                onChange={(e) =>
                  setNewColor(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addColor();
                  }
                }}
                placeholder="Example: Red"
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
              />

              <button
                type="button"
                onClick={addColor}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-black"
              >
                <Plus size={17} />
                Add Color
              </button>

            </div>

            {colors.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">

                {colors.map(
                  (color, index) => (
                    <div
                      key={`${color}-${index}`}
                      className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700"
                    >
                      <span>{color}</span>

                      <button
                        type="button"
                        onClick={() =>
                          removeColor(index)
                        }
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  )
                )}

              </div>
            )}

          </section>

          {/* Main Image */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Main Product Image
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Upload a new image or keep the existing one.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">

              {/* Existing / New Preview */}

              <div>

                <div className="relative aspect-square max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">

                  {mainImagePreview ? (
                    <img
                      src={mainImagePreview}
                      alt="New product preview"
                      className="h-full w-full object-cover"
                    />
                  ) : existingMainImage ? (
                    <img
                      src={getImageUrl(
                        existingMainImage
                      )}
                      alt={form.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-gray-400">
                      <ImageIcon size={42} />

                      <span className="mt-2 text-sm">
                        No image
                      </span>
                    </div>
                  )}

                  {(existingMainImage ||
                    mainImagePreview) && (
                    <button
                      type="button"
                      onClick={
                        mainImagePreview
                          ? clearNewMainImage
                          : deleteMainImage
                      }
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-md hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                </div>

              </div>

              {/* Upload */}

              <div className="flex flex-col justify-center">

                <label
                  htmlFor="main-image"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center transition hover:border-gray-400"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                    <ImageIcon
                      size={24}
                      className="text-gray-500"
                    />
                  </div>

                  <p className="mt-4 text-sm font-medium text-gray-900">
                    Upload new main image
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    JPG, JPEG, PNG or WEBP
                  </p>

                  <input
                    id="main-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleMainImage}
                    className="hidden"
                  />
                </label>

              </div>

            </div>

          </section>

          {/* Additional Images */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Additional Images
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage existing images or add new ones.
              </p>
            </div>

            {/* Existing Images */}

            {existingImages.length > 0 && (
              <div className="mb-6">

                <p className="mb-3 text-sm font-medium text-gray-700">
                  Existing Images
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">

                  {existingImages.map(
                    (image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200"
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`Product image ${
                            index + 1
                          }`}
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            deleteExistingImage(
                              image
                            )
                          }
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 opacity-0 shadow-md transition group-hover:opacity-100 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  )}

                </div>

              </div>
            )}

            {/* New Images */}

            {additionalImagePreviews.length > 0 && (
              <div className="mb-6">

                <p className="mb-3 text-sm font-medium text-gray-700">
                  New Images
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">

                  {additionalImagePreviews.map(
                    (preview, index) => (
                      <div
                        key={preview}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200"
                      >
                        <img
                          src={preview}
                          alt={`New image ${
                            index + 1
                          }`}
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeNewAdditionalImage(
                              index
                            )
                          }
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-md hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  )}

                </div>

              </div>
            )}

            <label
              htmlFor="additional-images"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-4 text-sm font-medium text-gray-700 transition hover:border-gray-500 hover:bg-gray-100"
            >
              <Plus size={18} />
              Add More Images

              <input
                id="additional-images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleAdditionalImages}
                className="hidden"
              />
            </label>

          </section>

          {/* Settings */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Product Settings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Control product visibility and featured status.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {/* Active */}

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50">

                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Active Product
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Customers can see this product in the store.
                  </p>
                </div>

              </label>

              {/* Featured */}

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50">

                <input
                  type="checkbox"
                  name="is_featured"
                  checked={form.is_featured}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Featured Product
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Show this product in featured sections.
                  </p>
                </div>

              </label>

              {/* New Arrival */}

<label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50">

        <input
          type="checkbox"
          name="is_new_arrival"
          checked={form.is_new_arrival}
          onChange={handleChange}
          className="mt-1 h-4 w-4 rounded border-gray-300"
        />

        <div>
          <p className="text-sm font-medium text-gray-900">
            New Arrival
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Show this product in the New Arrivals section.
          </p>
        </div>

      </label>

            </div>

          </section>

          {/* Bottom Actions */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              href="/admin/products"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-7 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Update Product
                </>
              )}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}