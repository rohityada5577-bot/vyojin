"use client";

import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const API_URL = "https://api.vyojin.co.in/api/v1";
const IMAGE_URL = "https://api.vyojin.co.in/storage";

interface Category {
  id: number;
  name: string;
}

export default function CreateProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

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

  const [sizeInput, setSizeInput] = useState("");

  const [colorInput, setColorInput] = useState("");

  const [mainImage, setMainImage] =
    useState<File | null>(null);

  const [mainImagePreview, setMainImagePreview] =
    useState("");

  const [additionalImages, setAdditionalImages] =
    useState<File[]>([]);

  const [additionalImagePreviews, setAdditionalImagePreviews] =
    useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Fetch Categories
  |--------------------------------------------------------------------------
  */

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${API_URL}/categories`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to load categories."
        );
      }

      /*
       * Supports both:
       *
       * data: []
       *
       * and:
       *
       * data: {
       *   data: []
       * }
       */

      const categoryData =
        Array.isArray(result.data)
          ? result.data
          : result.data?.data || [];

      setCategories(categoryData);
    } catch (err) {
      console.error(
        "Category API error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load categories."
      );
    } finally {
      setLoadingCategories(false);
    }
  };

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
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Generate Slug
  |--------------------------------------------------------------------------
  */

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const name = e.target.value;

    setForm((current) => ({
      ...current,
      name,
      slug: generateSlug(name),
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Sizes
  |--------------------------------------------------------------------------
  */

  const addSize = () => {
    const value = sizeInput.trim();

    if (!value) {
      return;
    }

    if (
      sizes.some(
        (size) =>
          size.toLowerCase() ===
          value.toLowerCase()
      )
    ) {
      setSizeInput("");
      return;
    }

    setSizes((current) => [
      ...current,
      value,
    ]);

    setSizeInput("");
  };

  const removeSize = (size: string) => {
    setSizes((current) =>
      current.filter(
        (item) => item !== size
      )
    );
  };

  const handleSizeKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSize();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Colors
  |--------------------------------------------------------------------------
  */

  const addColor = () => {
    const value = colorInput.trim();

    if (!value) {
      return;
    }

    if (
      colors.some(
        (color) =>
          color.toLowerCase() ===
          value.toLowerCase()
      )
    ) {
      setColorInput("");
      return;
    }

    setColors((current) => [
      ...current,
      value,
    ]);

    setColorInput("");
  };

  const removeColor = (color: string) => {
    setColors((current) =>
      current.filter(
        (item) => item !== color
      )
    );
  };

  const handleColorKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addColor();
    }
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

    if (!file) {
      return;
    }

    setMainImage(file);

    const preview = URL.createObjectURL(file);

    setMainImagePreview(preview);
  };

  /*
  |--------------------------------------------------------------------------
  | Additional Images
  |--------------------------------------------------------------------------
  */

  const handleAdditionalImages = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) {
      return;
    }

    setAdditionalImages((current) => [
      ...current,
      ...files,
    ]);

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setAdditionalImagePreviews(
      (current) => [
        ...current,
        ...previews,
      ]
    );
  };

  const removeAdditionalImage = (
    index: number
  ) => {
    setAdditionalImages((current) =>
      current.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );

    setAdditionalImagePreviews(
      (current) =>
        current.filter(
          (_, imageIndex) =>
            imageIndex !== index
        )
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

    setError("");
    setSuccess("");

    const token =
      localStorage.getItem("admin_token");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    /*
     * Basic validation
     */

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.price) {
      setError("Product price is required.");
      return;
    }

    if (!form.sku.trim()) {
      setError("SKU is required.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      if (form.category_id) {
        formData.append(
          "category_id",
          form.category_id
        );
      }

      formData.append(
        "name",
        form.name
      );

      formData.append(
        "slug",
        form.slug
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

      formData.append(
        "sku",
        form.sku
      );

      formData.append(
        "stock",
        form.stock || "0"
      );

      /*
       * Laravel boolean values
       */

      formData.append(
        "is_active",
        form.is_active ? "1" : "0"
      );

      formData.append(
        "is_featured",
        form.is_featured ? "1" : "0"
      );

      formData.append(
          "gst_rate",
          form.gst_rate || "0"
        );

      /*
       * Sizes
       */

      sizes.forEach((size) => {
        formData.append(
          "sizes[]",
          size
        );
      });

      /*
       * Colors
       */

      colors.forEach((color) => {
        formData.append(
          "colors[]",
          color
        );
      });

      /*
       * Main image
       */

      if (mainImage) {
        formData.append(
          "image",
          mainImage
        );
      }

      /*
       * Additional images
       */

      additionalImages.forEach(
        (image) => {
          formData.append(
            "images[]",
            image
          );
        }
      );

      const response = await fetch(
        `${API_URL}/admin/products`,
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

        window.location.href =
          "/admin/login";

        return;
      }

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        /*
         * Laravel validation errors
         */

        if (
          result.errors &&
          typeof result.errors ===
            "object"
        ) {
          const firstError =
            Object.values(
              result.errors
            )[0];

          if (
            Array.isArray(firstError)
          ) {
            throw new Error(
              String(firstError[0])
            );
          }
        }

        throw new Error(
          result.message ||
            "Unable to create product."
        );
      }

      setSuccess(
        "Product created successfully."
      );

      /*
       * Redirect to products
       */

      setTimeout(() => {
        window.location.href =
          "/admin/products";
      }, 800);
    } catch (err) {
      console.error(
        "Create product error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create product."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-10">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8f1239] hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Products
          </Link>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#a57945]">
            Catalog
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#241b1b] sm:text-4xl">
            Add Product
          </h1>

          <p className="mt-2 text-sm text-[#807575]">
            Add a new product to your Navratri
            collection.
          </p>
        </div>
      </div>

      {/* =====================================================
          SUCCESS / ERROR
      ====================================================== */}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
          {success}
        </div>
      )}

      {/* =====================================================
          FORM
      ====================================================== */}

      <form
        onSubmit={handleSubmit}
        className="mt-8"
      >
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          {/* =================================================
              LEFT
          ================================================== */}

          <div className="space-y-6">
            {/* Basic Information */}

            <section className="rounded-[1.5rem] border border-[#e8e0d7] bg-white p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a57945]">
                  Product Information
                </p>

                <h2 className="mt-1 text-xl font-black text-[#241b1b]">
                  Basic Information
                </h2>
              </div>

              <div className="mt-6 grid gap-5">
                {/* Name */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#3f3632]">
                    Product Name
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleNameChange}
                    placeholder="Example: Royal Bandhani Kurta"
                    className="w-full rounded-2xl border border-[#e8e0d7] bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8f1239] focus:bg-white"
                  />
                </div>

                {/* Slug */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#3f3632]">
                    Slug
                  </label>

                  <input
                    type="text"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="royal-bandhani-kurta"
                    className="w-full rounded-2xl border border-[#e8e0d7] bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8f1239] focus:bg-white"
                  />

                  <p className="mt-2 text-xs text-[#9a8f88]">
                    Generated automatically from
                    the product name.
                  </p>
                </div>

                {/* Category */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#3f3632]">
                    Category
                  </label>

                  <select
                    name="category_id"
                    value={
                      form.category_id
                    }
                    onChange={handleChange}
                    disabled={
                      loadingCategories
                    }
                    className="w-full rounded-2xl border border-[#e8e0d7] bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8f1239] focus:bg-white disabled:opacity-60"
                  >
                    <option value="">
                      {loadingCategories
                        ? "Loading categories..."
                        : "Select Category"}
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={
                            category.id
                          }
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Description */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#3f3632]">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={handleChange}
                    rows={7}
                    placeholder="Write a detailed product description..."
                    className="w-full resize-none rounded-2xl border border-[#e8e0d7] bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8f1239] focus:bg-white"
                  />
                </div>
              </div>
            </section>

            {/* Pricing */}

            <section className="rounded-[1.5rem] border border-[#e8e0d7] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a57945]">
                Pricing
              </p>

              <h2 className="mt-1 text-xl font-black text-[#241b1b]">
                Product Pricing
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {/* Price */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#3f3632]">
                    Selling Price
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#8f1239]">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="2499"
                      className="w-full rounded-2xl border border-[#e8e0d7] bg-[#fcfaf7] py-3 pl-9 pr-4 text-sm outline-none transition focus:border-[#8f1239] focus:bg-white"
                    />
                  </div>
                </div>

                {/* Compare Price */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#3f3632]">
                    Compare Price
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#8f1239]">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="compare_price"
                      value={
                        form.compare_price
                      }
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="2999"
                      className="w-full rounded-2xl border border-[#e8e0d7] bg-[#fcfaf7] py-3 pl-9 pr-4 text-sm outline-none transition focus:border-[#8f1239] focus:bg-white"
                    />
                  </div>

                  <p className="mt-2 text-xs text-[#9a8f88]">
                    Original price shown with
                    a discount.
                  </p>
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
                  <label className="mb-2 block text-sm font-bold text-[#3f3632]">
                    SKU
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="NAV-KURTA-001"
                    className="w-full rounded-2xl border border-[#e8e0d7] bg-[#fcfaf7] px-4 py-3 text-sm uppercase outline-none transition focus:border-[#8f1239] focus:bg-white"
                  />
                </div>

                {/* Stock */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#3f3632]">
                    Stock Quantity
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className="w-full rounded-2xl border border-[#e8e0d7] bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8f1239] focus:bg-white"
                  />
                </div>
              </div>
            </section>

            {/* Sizes and Colors */}

            <section className="rounded-[1.5rem] border border-[#e8e0d7] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a57945]">
                Variants
              </p>

              <h2 className="mt-1 text-xl font-black text-[#241b1b]">
                Sizes & Colors
              </h2>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {/* Sizes */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#3f3632]">
                    Sizes
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sizeInput}
                      onChange={(e) =>
                        setSizeInput(
                          e.target.value
                        )
                      }
                      onKeyDown={
                        handleSizeKeyDown
                      }
                      placeholder="S, M, L, XL"
                      className="min-w-0 flex-1 rounded-2xl border border-[#e8e0d7] bg-[#fcfaf7] px-4 py-3 text-sm outline-none focus:border-[#8f1239]"
                    />

                    <button
                      type="button"
                      onClick={addSize}
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#8f1239] text-white hover:bg-[#74102f]"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {sizes.map(
                      (size) => (
                        <span
                          key={size}
                          className="inline-flex items-center gap-2 rounded-full bg-[#f6ecdf] px-3 py-2 text-xs font-bold text-[#8f1239]"
                        >
                          {size}

                          <button
                            type="button"
                            onClick={() =>
                              removeSize(
                                size
                              )
                            }
                            className="hover:text-red-600"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Colors */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#3f3632]">
                    Colors
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) =>
                        setColorInput(
                          e.target.value
                        )
                      }
                      onKeyDown={
                        handleColorKeyDown
                      }
                      placeholder="Red, Yellow, Blue"
                      className="min-w-0 flex-1 rounded-2xl border border-[#e8e0d7] bg-[#fcfaf7] px-4 py-3 text-sm outline-none focus:border-[#8f1239]"
                    />

                    <button
                      type="button"
                      onClick={addColor}
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#8f1239] text-white hover:bg-[#74102f]"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {colors.map(
                      (color) => (
                        <span
                          key={color}
                          className="inline-flex items-center gap-2 rounded-full bg-[#f6ecdf] px-3 py-2 text-xs font-bold text-[#8f1239]"
                        >
                          {color}

                          <button
                            type="button"
                            onClick={() =>
                              removeColor(
                                color
                              )
                            }
                            className="hover:text-red-600"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Images */}

            <section className="rounded-[1.5rem] border border-[#e8e0d7] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a57945]">
                Media
              </p>

              <h2 className="mt-1 text-xl font-black text-[#241b1b]">
                Product Images
              </h2>

              {/* Main Image */}

              <div className="mt-6">
                <label className="mb-2 block text-sm font-bold text-[#3f3632]">
                  Main Product Image
                </label>

                <label className="group relative flex min-h-64 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#dfd4c8] bg-[#fcfaf7] transition hover:border-[#8f1239]">
                  {mainImagePreview ? (
                    <img
                      src={mainImagePreview}
                      alt="Main product preview"
                      className="h-64 w-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6ecdf] text-[#8f1239]">
                        <ImagePlus size={25} />
                      </div>

                      <p className="mt-4 text-sm font-bold text-[#3f3632]">
                        Click to upload main
                        image
                      </p>

                      <p className="mt-1 text-xs text-[#9a8f88]">
                        JPG, PNG or WEBP · Max
                        5MB
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleMainImage
                    }
                    className="hidden"
                  />
                </label>
              </div>

              {/* Additional Images */}

              <div className="mt-6">
                <label className="mb-2 block text-sm font-bold text-[#3f3632]">
                  Additional Images
                </label>

                <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#dfd4c8] bg-[#fcfaf7] px-5 py-8 transition hover:border-[#8f1239]">
                  <div className="text-center">
                    <ImagePlus
                      size={23}
                      className="mx-auto text-[#8f1239]"
                    />

                    <p className="mt-2 text-sm font-bold text-[#3f3632]">
                      Add more images
                    </p>

                    <p className="mt-1 text-xs text-[#9a8f88]">
                      You can select multiple
                      images.
                    </p>
                  </div>

                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleAdditionalImages
                    }
                    className="hidden"
                  />
                </label>

                {additionalImagePreviews.length >
                  0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {additionalImagePreviews.map(
                      (
                        preview,
                        index
                      ) => (
                        <div
                          key={`${preview}-${index}`}
                          className="group relative aspect-square overflow-hidden rounded-2xl bg-[#f6ecdf]"
                        >
                          <img
                            src={preview}
                            alt={`Product image ${
                              index + 1
                            }`}
                            className="h-full w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeAdditionalImage(
                                index
                              )
                            }
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-sm"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================== */}

          <div className="space-y-6">
            {/* Publish */}

            <section className="rounded-[1.5rem] border border-[#e8e0d7] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a57945]">
                Publish
              </p>

              <h2 className="mt-1 text-xl font-black text-[#241b1b]">
                Product Visibility
              </h2>

              <div className="mt-6 space-y-4">
                {/* Active */}

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#eee8e1] p-4">
                  <div>
                    <p className="text-sm font-bold text-[#3f3632]">
                      Active
                    </p>

                    <p className="mt-1 text-xs text-[#9a8f88]">
                      Show product in store
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      form.is_active
                    }
                    onChange={(e) =>
                      setForm(
                        (current) => ({
                          ...current,
                          is_active:
                            e.target
                              .checked,
                        })
                      )
                    }
                    className="h-5 w-5 accent-[#8f1239]"
                  />
                </label>

                {/* Featured */}

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#eee8e1] p-4">
                  <div>
                    <p className="text-sm font-bold text-[#3f3632]">
                      Featured
                    </p>

                    <p className="mt-1 text-xs text-[#9a8f88]">
                      Show in featured
                      collection
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      form.is_featured
                    }
                    onChange={(e) =>
                      setForm(
                        (current) => ({
                          ...current,
                          is_featured:
                            e.target
                              .checked,
                        })
                      )
                    }
                    className="h-5 w-5 accent-[#8f1239]"
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#eee8e1] p-4">
                    <div>
                      <p className="text-sm font-bold text-[#3f3632]">
                        New Arrival
                      </p>

                      <p className="mt-1 text-xs text-[#9a8f88]">
                        Show product in the New Arrivals section
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={form.is_new_arrival}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          is_new_arrival: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 accent-[#8f1239]"
                    />
                  </label>
              </div>
            </section>

            {/* Summary */}

            <section className="rounded-[1.5rem] bg-[#241b1b] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d7b681]">
                Summary
              </p>

              <h2 className="mt-2 text-xl font-black">
                Product Preview
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-white/60">
                    Name
                  </span>

                  <span className="max-w-[180px] text-right text-sm font-bold">
                    {form.name ||
                      "Product name"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-white/60">
                    Price
                  </span>

                  <span className="text-sm font-bold">
                    ₹
                    {form.price ||
                      "0"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-white/60">
                    Stock
                  </span>

                  <span className="text-sm font-bold">
                    {form.stock || "0"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-white/60">
                    Sizes
                  </span>

                  <span className="text-sm font-bold">
                    {sizes.length || "None"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-white/60">
                    Colors
                  </span>

                  <span className="text-sm font-bold">
                    {colors.length || "None"}
                  </span>
                </div>
              </div>
            </section>

            {/* Save */}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#8f1239] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#8f1239]/10 transition hover:bg-[#74102f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Creating Product...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Create Product
                </>
              )}
            </button>

            <Link
              href="/admin/products"
              className="flex w-full items-center justify-center rounded-2xl border border-[#e8e0d7] bg-white px-6 py-4 text-sm font-bold text-[#665b55] transition hover:border-[#8f1239] hover:text-[#8f1239]"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}