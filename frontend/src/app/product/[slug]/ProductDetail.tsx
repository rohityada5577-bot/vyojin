"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import type { Product } from "@/types";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://api.vyojin.co.in/api/v1";

function getImageUrl(image?: string | null) {
  if (!image) {
    return "/images/placeholder.jpg";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/storage/")) {
    return `${API_URL.replace("/api/v1", "")}${image}`;
  }

  if (image.startsWith("storage/")) {
    return `${API_URL.replace("/api/v1", "")}/${image}`;
  }

  if (image.startsWith("/")) {
    return image;
  }

  return `${API_URL.replace("/api/v1", "")}/${image}`;
}

export default function ProductDetail({
  product,
}: {
  product: Product;
}) {
  const { add } = useCart();
  const { toggle } = useWishlist();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);

  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || ""
  );

  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || ""
  );

  const [isWishlisted, setIsWishlisted] = useState(false);

  const allImages = [
    ...(product.image ? [product.image] : []),
    ...(product.images || []),
  ].filter(
    (image, index, array) => image && array.indexOf(image) === index
  );

  const [selectedImage, setSelectedImage] = useState(
    allImages[0] || ""
  );

  const price = Number(product.price || 0);

  const comparePrice = Number(product.compare_price || 0);

  const stock = Number(product.stock || 0);

  const discount =
    comparePrice > price
      ? Math.round(
          ((comparePrice - price) / comparePrice) * 100
        )
      : 0;

  const currentImage =
    selectedImage || allImages[0] || "";

  const currentImageIndex = Math.max(
    0,
    allImages.indexOf(selectedImage)
  );

  const handleWishlist = () => {
    toggle(product);
    setIsWishlisted((current) => !current);
  };

  const addProductToCart = () => {
    add(
      product,
      selectedSize || undefined,
      selectedColor || undefined,
      quantity
    );
  };

  const handleAddToCart = () => {
    if (stock <= 0) return;

    addProductToCart();

    router.push("/cart");
  };

  const handleBuyNow = () => {
    if (stock <= 0) return;

    addProductToCart();

    router.push("/checkout");
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(stock || 1, current + 1)
    );
  };

  const showPreviousImage = () => {
    if (allImages.length <= 1) return;

    const previousIndex =
      currentImageIndex <= 0
        ? allImages.length - 1
        : currentImageIndex - 1;

    setSelectedImage(allImages[previousIndex]);
  };

  const showNextImage = () => {
    if (allImages.length <= 1) return;

    const nextIndex =
      currentImageIndex >= allImages.length - 1
        ? 0
        : currentImageIndex + 1;

    setSelectedImage(allImages[nextIndex]);
  };

  return (
    <main className="min-h-screen bg-[#fffaf1]">
      {/* =========================================
          BACK TO SHOP
      ========================================= */}
      <div className="mx-auto max-w-7xl px-5 pt-7 sm:px-6 lg:pt-10">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#806d65] transition hover:text-[#8f1239]"
        >
          <ArrowLeft size={16} />
          Back to Shop
        </Link>
      </div>

      {/* =========================================
          PRODUCT
      ========================================= */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">

          {/* =====================================
              IMAGE GALLERY
          ===================================== */}
          <div>
            <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-sm">

              {/* Discount */}
              {discount > 0 && (
                <div className="absolute left-5 top-5 z-20 rounded-full bg-[#8f1239] px-4 py-2 text-xs font-bold tracking-wide text-white">
                  {discount}% OFF
                </div>
              )}

              {/* Featured */}
              {product.is_featured && (
                <div className="absolute left-5 top-[4.2rem] z-20 rounded-full bg-[#c18a32] px-4 py-2 text-xs font-bold tracking-wide text-white">
                  FEATURED
                </div>
              )}

              {/* Wishlist */}
              <button
                type="button"
                onClick={handleWishlist}
                aria-label="Add to wishlist"
                className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105"
              >
                <Heart
                  size={20}
                  className={
                    isWishlisted
                      ? "fill-[#8f1239] text-[#8f1239]"
                      : "text-[#3b1714]"
                  }
                />
              </button>

              {/* Main Image */}
              <div className="relative flex min-h-[450px] items-center justify-center bg-[#fdf8ef] sm:min-h-[560px]">
                {currentImage ? (
                  <img
                    src={getImageUrl(currentImage)}
                    alt={product.name}
                    className="h-[450px] w-full object-cover sm:h-[560px]"
                  />
                ) : (
                  <div className="flex h-[450px] w-full items-center justify-center text-sm text-[#806d65]">
                    No image available
                  </div>
                )}

                {/* Previous */}
                {allImages.length > 1 && (
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    aria-label="Previous image"
                    className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:scale-105"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}

                {/* Next */}
                {allImages.length > 1 && (
                  <button
                    type="button"
                    onClick={showNextImage}
                    aria-label="Next image"
                    className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:scale-105"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* =====================================
                THUMBNAILS
            ===================================== */}
            {allImages.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {allImages.slice(0, 5).map((image, index) => {
                  const isActive = image === selectedImage;

                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`overflow-hidden rounded-2xl bg-white transition ${
                        isActive
                          ? "ring-2 ring-[#8f1239] ring-offset-2"
                          : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} ${index + 1}`}
                        className="h-24 w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* =====================================
              PRODUCT INFORMATION
          ===================================== */}
          <div className="flex flex-col justify-center">

            {/* Category */}
            {product.category?.name && (
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a87525]">
                {product.category.name}
              </p>
            )}

            {/* Product Name */}
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-[#3b1714] md:text-5xl">
              {product.name}
            </h1>

            {/* SKU */}
            {product.sku && (
              <p className="mt-2 text-xs text-[#a99a93]">
                SKU: {product.sku}
              </p>
            )}

            {/* Rating */}
            <div className="mt-5 flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={17}
                    className="fill-[#c18a32] text-[#c18a32]"
                  />
                ))}
              </div>

              <span className="text-sm text-[#806d65]">
                4.9 (24 Reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <span className="text-3xl font-bold text-[#8f1239]">
                ₹{price.toLocaleString("en-IN")}
              </span>

              {comparePrice > price && (
                <>
                  <span className="text-lg text-[#a99a93] line-through">
                    ₹{comparePrice.toLocaleString("en-IN")}
                  </span>

                  <span className="rounded-full bg-[#f4e7d0] px-3 py-1 text-xs font-bold text-[#8f1239]">
                    Save ₹
                    {(
                      comparePrice - price
                    ).toLocaleString("en-IN")}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div
                className="mt-7 text-sm leading-7 text-[#806d65]"
                dangerouslySetInnerHTML={{
                  __html: product.description,
                }}
              />
            )}

            {/* Size */}
            {product.sizes &&
              product.sizes.length > 0 && (
                <div className="mt-8">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#3b1714]">
                      Select Size
                    </span>

                    <button
                      type="button"
                      className="text-xs font-semibold text-[#8f1239]"
                    >
                      Size Guide
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-14 rounded-full border px-5 py-3 text-sm font-bold transition ${
                          selectedSize === size
                            ? "border-[#8f1239] bg-[#8f1239] text-white"
                            : "border-[#e5d8cf] bg-white text-[#3b1714] hover:border-[#8f1239]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Color */}
            {product.colors &&
              product.colors.length > 0 && (
                <div className="mt-7">
                  <span className="mb-3 block text-sm font-bold text-[#3b1714]">
                    Select Color
                  </span>

                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                          selectedColor === color
                            ? "border-[#8f1239] bg-[#8f1239] text-white"
                            : "border-[#e5d8cf] bg-white text-[#3b1714] hover:border-[#8f1239]"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Stock */}
            <div className="mt-7">
              {stock > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-600" />

                  <span className="text-sm font-semibold text-green-700">
                    {stock <= 5
                      ? `Only ${stock} left in stock`
                      : `${stock} items available`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-600" />

                  <span className="text-sm font-semibold text-red-600">
                    Currently out of stock
                  </span>
                </div>
              )}
            </div>

            {/* Quantity + Cart */}
            <div className="mt-6 flex flex-col gap-4 sm:flex-row">

              {/* Quantity */}
              <div className="flex h-14 items-center justify-between rounded-full border border-[#e5d8cf] bg-white px-5 sm:w-36">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus size={17} />
                </button>

                <span className="font-bold text-[#3b1714]">
                  {quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={increaseQuantity}
                  disabled={
                    stock <= 0 || quantity >= stock
                  }
                  className="disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={17} />
                </button>
              </div>

              {/* Add Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={stock <= 0}
                className="flex h-14 flex-1 items-center justify-center gap-3 rounded-full bg-[#8f1239] px-7 font-bold text-white transition hover:bg-[#74102f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag size={19} />

                {stock > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>
            </div>

            {/* Buy Now */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={stock <= 0}
              className="mt-3 flex h-14 w-full items-center justify-center rounded-full border-2 border-[#8f1239] font-bold text-[#8f1239] transition hover:bg-[#8f1239] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Buy Now
            </button>

            {/* Benefits */}
            <div className="mt-10 grid grid-cols-1 gap-5 border-t border-[#e5d8cf] pt-8 sm:grid-cols-3">

              <div className="flex items-center gap-3">
                <Truck
                  size={21}
                  className="shrink-0 text-[#8f1239]"
                />

                <div>
                  <p className="text-xs font-bold text-[#3b1714]">
                    Fast Delivery
                  </p>

                  <p className="text-[11px] text-[#806d65]">
                    Across India
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck
                  size={21}
                  className="shrink-0 text-[#8f1239]"
                />

                <div>
                  <p className="text-xs font-bold text-[#3b1714]">
                    Secure Payment
                  </p>

                  <p className="text-[11px] text-[#806d65]">
                    100% Secure
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShoppingBag
                  size={21}
                  className="shrink-0 text-[#8f1239]"
                />

                <div>
                  <p className="text-xs font-bold text-[#3b1714]">
                    Easy Shopping
                  </p>

                  <p className="text-[11px] text-[#806d65]">
                    Simple & Fast
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}