"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  ShieldCheck,
} from "lucide-react";

import { useCart } from "@/components/CartProvider";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.vyojin.co.in/api/v1";

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

export default function CartPage() {
  const {
    items,
    remove,
    updateQuantity,
    clear,
  } = useCart();

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      return (
        total +
        Number(item.product.price || 0) *
          item.quantity
      );
    }, 0);
  }, [items]);

  /*
   * Free shipping above ₹2,000.
   * You can change this later from your backend/settings.
   */
  const shipping = subtotal >= 2000 || subtotal === 0
    ? 0
    : 99;

  const total = subtotal + shipping;

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const formatPrice = (value: number) => {
    return `₹${value.toLocaleString("en-IN")}`;
  };

  /*
   * EMPTY CART
   */
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#fffaf1]">
        <div className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-6 py-16">
          <div className="w-full max-w-xl text-center">

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm">
              <ShoppingBag
                size={38}
                className="text-[#8f1239]"
              />
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.25em] text-[#a87525]">
              Your Shopping Bag
            </p>

            <h1 className="mt-3 font-serif text-4xl font-bold text-[#3b1714] md:text-5xl">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#806d65]">
              Discover our festive Navratri collection and
              find something beautiful for your celebrations.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#8f1239] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#74102f]"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf1]">

      {/* =========================================
          HEADER
      ========================================= */}
      <section className="border-b border-[#eadfd5] bg-[#fffaf1]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:py-14">

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#806d65] transition hover:text-[#8f1239]"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>

          <div className="mt-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a87525]">
                Your Collection
              </p>

              <h1 className="mt-2 font-serif text-4xl font-bold text-[#3b1714] md:text-5xl">
                Shopping Bag
              </h1>

              <p className="mt-3 text-sm text-[#806d65]">
                {totalItems}{" "}
                {totalItems === 1 ? "item" : "items"} in your
                bag
              </p>
            </div>

            <button
              type="button"
              onClick={clear}
              className="self-start text-sm font-semibold text-[#8f1239] transition hover:text-[#74102f] md:self-auto"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </section>

      {/* =========================================
          CART CONTENT
      ========================================= */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_390px]">

          {/* =====================================
              CART ITEMS
          ===================================== */}
          <div className="space-y-4">

            {items.map((item) => {
              const product = item.product;

              const price = Number(
                product.price || 0
              );

              const itemTotal = price * item.quantity;

              const maxQuantity = Math.max(
                1,
                Number(product.stock || 1)
              );

              const image =
                product.image ||
                product.images?.[0] ||
                null;

              return (
                <div
                  key={`${product.id}-${item.size || ""}-${item.color || ""}`}
                  className="rounded-[1.75rem] border border-[#eadfd5] bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex gap-4 sm:gap-6">

                    {/* Product Image */}
                    <Link
                      href={`/product/${product.slug}`}
                      className="h-32 w-28 shrink-0 overflow-hidden rounded-2xl bg-[#fdf8ef] sm:h-40 sm:w-32"
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          {product.category?.name && (
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a87525]">
                              {product.category.name}
                            </p>
                          )}

                          <Link
                            href={`/product/${product.slug}`}
                            className="mt-1 block font-serif text-xl font-bold leading-tight text-[#3b1714] transition hover:text-[#8f1239] sm:text-2xl"
                          >
                            {product.name}
                          </Link>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() =>
                            remove(
                              product.id,
                              item.size,
                              item.color
                            )
                          }
                          aria-label={`Remove ${product.name}`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff7f4] text-[#8f1239] transition hover:bg-[#8f1239] hover:text-white"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="mt-3">
                        <span className="text-lg font-bold text-[#8f1239]">
                          {formatPrice(price)}
                        </span>

                        {product.compare_price &&
                          Number(product.compare_price) >
                            price && (
                            <span className="ml-2 text-sm text-[#a99a93] line-through">
                              {formatPrice(
                                Number(
                                  product.compare_price
                                )
                              )}
                            </span>
                          )}
                      </div>

                      {/* Size / Color */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.size && (
                          <span className="rounded-full bg-[#f8f1e7] px-3 py-1.5 text-xs font-semibold text-[#5f4a42]">
                            Size: {item.size}
                          </span>
                        )}

                        {item.color && (
                          <span className="rounded-full bg-[#f8f1e7] px-3 py-1.5 text-xs font-semibold text-[#5f4a42]">
                            Color: {item.color}
                          </span>
                        )}
                      </div>

                      {/* Bottom */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                        {/* Quantity */}
                        <div className="flex h-10 items-center rounded-full border border-[#e5d8cf] bg-[#fffaf1] px-2">

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                product.id,
                                item.quantity - 1,
                                item.size,
                                item.color
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="w-8 text-center text-sm font-bold text-[#3b1714]">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                product.id,
                                Math.min(
                                  maxQuantity,
                                  item.quantity + 1
                                ),
                                item.size,
                                item.color
                              )
                            }
                            disabled={
                              item.quantity >= maxQuantity
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a99a93]">
                            Item Total
                          </p>

                          <p className="mt-1 text-lg font-bold text-[#3b1714]">
                            {formatPrice(itemTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Free Shipping Progress */}
            {subtotal < 2000 && (
              <div className="rounded-[1.75rem] border border-[#eadfd5] bg-white p-5">
                <div className="flex items-center gap-3">
                  <Truck
                    size={20}
                    className="text-[#8f1239]"
                  />

                  <p className="text-sm text-[#5f4a42]">
                    Add{" "}
                    <strong>
                      {formatPrice(2000 - subtotal)}
                    </strong>{" "}
                    more to get{" "}
                    <strong>FREE SHIPPING</strong>
                  </p>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eee2d8]">
                  <div
                    className="h-full rounded-full bg-[#8f1239] transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (subtotal / 2000) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {subtotal >= 2000 && (
              <div className="rounded-[1.75rem] border border-green-200 bg-green-50 p-5">
                <div className="flex items-center gap-3">
                  <Truck
                    size={20}
                    className="text-green-700"
                  />

                  <p className="text-sm font-semibold text-green-700">
                    🎉 You qualify for FREE SHIPPING!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* =====================================
              ORDER SUMMARY
          ===================================== */}
          <aside className="h-fit lg:sticky lg:top-6">
            <div className="rounded-[2rem] border border-[#eadfd5] bg-white p-6 shadow-sm sm:p-7">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a87525]">
                Order Summary
              </p>

              <h2 className="mt-2 font-serif text-2xl font-bold text-[#3b1714]">
                Your Order
              </h2>

              <div className="mt-7 space-y-4 border-b border-[#eadfd5] pb-6">

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#806d65]">
                    Subtotal
                  </span>

                  <span className="font-semibold text-[#3b1714]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#806d65]">
                    Shipping
                  </span>

                  <span className="font-semibold text-[#3b1714]">
                    {shipping === 0
                      ? "FREE"
                      : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-6">
                <span className="font-bold text-[#3b1714]">
                  Total
                </span>

                <span className="text-2xl font-bold text-[#8f1239]">
                  {formatPrice(total)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#8f1239] px-6 text-sm font-bold text-white transition hover:bg-[#74102f]"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/shop"
                className="mt-3 flex h-12 w-full items-center justify-center rounded-full border border-[#e5d8cf] text-sm font-semibold text-[#3b1714] transition hover:border-[#8f1239] hover:text-[#8f1239]"
              >
                Continue Shopping
              </Link>

              {/* Trust */}
              <div className="mt-7 space-y-4 border-t border-[#eadfd5] pt-6">

                <div className="flex items-center gap-3">
                  <ShieldCheck
                    size={19}
                    className="text-[#8f1239]"
                  />

                  <div>
                    <p className="text-xs font-bold text-[#3b1714]">
                      Secure Checkout
                    </p>

                    <p className="text-[11px] text-[#806d65]">
                      Your information is protected
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Truck
                    size={19}
                    className="text-[#8f1239]"
                  />

                  <div>
                    <p className="text-xs font-bold text-[#3b1714]">
                      Fast Delivery
                    </p>

                    <p className="text-[11px] text-[#806d65]">
                      Delivery across India
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}