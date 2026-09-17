"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";

import {
  Check,
  ChevronRight,
  CreditCard,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
  X,
  ArrowLeft,
} from "lucide-react";

import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/context/AuthContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api/v1";

  const STORAGE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL ||
  "http://127.0.0.1:8000/storage";

function getProductImage(product: any) {
  const image =
    product?.image ||
    product?.images?.[0] ||
    "";

  if (!image) {
    return "/images/placeholder.jpg";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `${STORAGE_URL}/${String(image).replace(/^\/+/, "")}`;
}

interface AppliedCoupon {
  id: number;
  code: string;
  name?: string | null;
  discount: number;
}

function CheckoutContent() {
  const { items, clear } = useCart();
  const { customer, token, loading: authLoading } = useAuth();

  /* -------------------------------- */
  /* SEARCH PARAMS */
  /* -------------------------------- */

  const searchParams = useSearchParams();

  const productSlug =
    searchParams.get("product");

  /* -------------------------------- */
  /* BUY NOW PRODUCT */
  /* -------------------------------- */

  const [buyNowProduct, setBuyNowProduct] =
    useState<any>(null);

  const [productLoading, setProductLoading] =
    useState<boolean>(true);

  const [productError, setProductError] =
    useState<string>("");

  /* -------------------------------- */
  /* LOAD BUY NOW PRODUCT */
  /* -------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const loadBuyNowProduct = async () => {
      /*
       * Normal checkout:
       * no ?product=slug in URL
       */
      if (!productSlug) {
        if (!cancelled) {
          setBuyNowProduct(null);
          setProductLoading(false);
          setProductError("");
        }

        return;
      }

      try {
        if (!cancelled) {
          setProductLoading(true);
          setProductError("");
          setBuyNowProduct(null);
        }

        const url =
          `${API_URL}/products/${encodeURIComponent(
            productSlug
          )}`;

        console.log(
          "BUY NOW PRODUCT URL:",
          url
        );

        console.log(
          "BUY NOW SLUG:",
          productSlug
        );

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        console.log(
          "BUY NOW STATUS:",
          response.status
        );

        const result =
          await response.json();

        console.log(
          "BUY NOW API RESPONSE:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.message ||
              `Product request failed (${response.status})`
          );
        }

        /*
         * Laravel response:
         * {
         *   success: true,
         *   data: {...}
         * }
         */

        if (!result?.success) {
          throw new Error(
            result?.message ||
              "Unable to load product."
          );
        }

        if (!result?.data) {
          throw new Error(
            "Product data was not returned by the API."
          );
        }

        if (!cancelled) {
          setBuyNowProduct(result.data);
          setProductError("");
        }
      } catch (error) {
        console.error(
          "Buy Now product loading failed:",
          error
        );

        if (!cancelled) {
          setBuyNowProduct(null);

          setProductError(
            error instanceof Error
              ? error.message
              : "Unable to load this product."
          );
        }
      } finally {
        if (!cancelled) {
          setProductLoading(false);
        }
      }
    };

    loadBuyNowProduct();

    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  /* -------------------------------- */
  /* CHECKOUT ITEMS */
  /* -------------------------------- */

  const checkoutItems =
    productSlug
      ? buyNowProduct
        ? [
            {
              product: buyNowProduct,
              quantity: 1,
              size: null,
              color: null,
            },
          ]
        : []
      : items;

  /* -------------------------------- */
  /* FORM */
  /* -------------------------------- */

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  /* -------------------------------- */
  /* COUPON */
  /* -------------------------------- */

  const [couponCode, setCouponCode] =
    useState("");

  const [appliedCoupon, setAppliedCoupon] =
    useState<AppliedCoupon | null>(null);

  const [couponLoading, setCouponLoading] =
    useState(false);

  const [couponError, setCouponError] =
    useState("");

  const [couponSuccess, setCouponSuccess] =
    useState("");

  /* -------------------------------- */
  /* CHECKOUT LOADING */
  /* -------------------------------- */

  const [loading, setLoading] =
    useState(false);

  /* -------------------------------- */
  /* SUBTOTAL */
  /* -------------------------------- */

  const subtotal =
    checkoutItems.reduce(
      (total, item) =>
        total +
        Number(
          item.product?.price || 0
        ) * item.quantity,
      0
    );

  /* -------------------------------- */
  /* SHIPPING */
  /* -------------------------------- */

  const shipping =
    subtotal >= 2000 || subtotal === 0
      ? 0
      : 99;

  /* -------------------------------- */
  /* DISCOUNT */
  /* -------------------------------- */

  const discount =
    appliedCoupon?.discount || 0;

  /* -------------------------------- */
  /* TOTAL */
  /* -------------------------------- */

/* -------------------------------- */
/* GST */
/* -------------------------------- */

const taxableAmount = Math.max(
  0,
  subtotal - discount
);

const gstRates = checkoutItems.map((item) => ({
  amount:
    Number(item.product?.price || 0) *
    item.quantity,
  rate: Number(item.product?.gst_rate || 0),
}));

const gstBaseTotal = gstRates.reduce(
  (sum, item) => sum + item.amount,
  0
);

const gstAmount = gstRates.reduce(
  (sum, item) => {
    if (item.rate <= 0) return sum;

    const itemTaxableAmount =
      gstBaseTotal > 0
        ? (item.amount / gstBaseTotal) *
          taxableAmount
        : 0;

    return (
      sum +
      (itemTaxableAmount * item.rate) / 100
    );
  },
  0
);

const roundedGstAmount = Number(
  gstAmount.toFixed(2)
);

const businessState = (
  process.env.NEXT_PUBLIC_GST_BUSINESS_STATE || ""
).trim().toLowerCase();

const billingState = form.state
  .trim()
  .toLowerCase();

const isIntraState =
  businessState &&
  billingState &&
  businessState === billingState;

const cgstAmount = isIntraState
  ? Number((roundedGstAmount / 2).toFixed(2))
  : 0;

const sgstAmount = isIntraState
  ? Number(
      (roundedGstAmount - cgstAmount).toFixed(2)
    )
  : 0;

const igstAmount = !isIntraState
  ? roundedGstAmount
  : 0;

const total = Math.max(
  0,
  taxableAmount +
    roundedGstAmount +
    shipping
);
  /* -------------------------------- */
  /* CANCEL ORDER */
  /* -------------------------------- */

  const cancelOrderAndRestoreStock =
    async (
      orderNumber: string,
      reason: string
    ) => {
      try {
        const response = await fetch(
          `${API_URL}/payments/cancel`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",

              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },

            body: JSON.stringify({
              order_number: orderNumber,
              reason,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          console.error(
            "Cancel order failed:",
            data
          );

          return false;
        }

        console.log(
          "Order cancelled / stock restored:",
          data
        );

        return true;
      } catch (error) {
        console.error(
          "Error cancelling order:",
          error
        );

        return false;
      }
    };

  /* -------------------------------- */
  /* INPUT CHANGE */
  /* -------------------------------- */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]:
        e.target.value,
    }));
  };

  /* -------------------------------- */
  /* APPLY COUPON */
  /* -------------------------------- */

  const applyCoupon = async () => {
    const code =
      couponCode
        .trim()
        .toUpperCase();

    if (!code) {
      setCouponError(
        "Please enter a coupon code."
      );

      setCouponSuccess("");

      return;
    }

    if (subtotal <= 0) {
      setCouponError(
        "Your cart is empty."
      );

      setCouponSuccess("");

      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const response =
        await fetch(
          `${API_URL}/coupons/validate`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              code,
              subtotal,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        setAppliedCoupon(null);

        setCouponError(
          result.message ||
            "Invalid coupon code."
        );

        return;
      }

      const couponData =
        result.data;

      const newCoupon: AppliedCoupon = {
        id: Number(
          couponData.id
        ),

        code:
          couponData.code,

        name:
          couponData.name,

        discount:
          Number(
            couponData.discount ||
              0
          ),
      };

      setAppliedCoupon(
        newCoupon
      );

      setCouponCode(
        newCoupon.code
      );

      setCouponError("");

      setCouponSuccess(
        `Coupon ${newCoupon.code} applied successfully.`
      );
    } catch (error) {
      console.error(
        "Coupon validation error:",
        error
      );

      setAppliedCoupon(null);

      setCouponError(
        "Unable to validate coupon. Please try again."
      );

      setCouponSuccess("");
    } finally {
      setCouponLoading(false);
    }
  };

  /* -------------------------------- */
  /* REMOVE COUPON */
  /* -------------------------------- */

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setCouponSuccess("");
  };

  /* -------------------------------- */
  /* SUBMIT CHECKOUT */
  /* -------------------------------- */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    if (productSlug && productLoading) {
      alert(
        "Product is still loading. Please wait a moment."
      );

      return;
    }

    if (
      productSlug &&
      !buyNowProduct
    ) {
      alert(
        productError ||
          "Unable to load this product."
      );

      return;
    }

    if (authLoading) {
      alert(
        "Checking your login. Please wait a moment."
      );

      return;
    }

    if (!token || !customer) {
      alert(
        "Please login before placing your order."
      );

      return;
    }

    if (!checkoutItems.length) {
      alert(
        "Your cart is empty."
      );

      return;
    }

    /* -------------------------------- */
    /* VALIDATION */
    /* -------------------------------- */

    const phone =
      form.phone.replace(
        /\D/g,
        ""
      );

    const pincode =
      form.pincode.replace(
        /\D/g,
        ""
      );

    if (!form.name.trim()) {
      alert(
        "Please enter your full name."
      );

      return;
    }

    if (phone.length !== 10) {
      alert(
        "Please enter a valid 10-digit mobile number."
      );

      return;
    }

    if (!form.email.trim()) {
      alert(
        "Please enter your email address."
      );

      return;
    }

    if (!form.address.trim()) {
      alert(
        "Please enter your complete address."
      );

      return;
    }

    if (!form.city.trim()) {
      alert(
        "Please enter your city."
      );

      return;
    }

    if (!form.state.trim()) {
      alert(
        "Please enter your state."
      );

      return;
    }

    if (pincode.length !== 6) {
      alert(
        "Please enter a valid 6-digit pincode."
      );

      return;
    }

    if (!window.Razorpay) {
      alert(
        "Razorpay is still loading. Please wait a moment and try again."
      );

      return;
    }

    try {
      setLoading(true);

      /* -------------------------------- */
      /* CREATE LARAVEL ORDER */
      /* -------------------------------- */

      const orderResponse =
        await fetch(
          `${API_URL}/orders`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",

              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },

            body: JSON.stringify({
              customer: {
                name:
                  form.name.trim(),

                email:
                  form.email.trim(),

                phone,

                address:
                  form.address.trim(),

                city:
                  form.city.trim(),

                state:
                  form.state.trim(),

                pincode,
              },

              items:
                checkoutItems.map(
                  (item) => ({
                    product_id:
                      item.product.id,

                    quantity:
                      item.quantity,

                    size:
                      item.size ||
                      null,

                    color:
                      item.color ||
                      null,
                  })
                ),

              coupon_code:
                appliedCoupon?.code ||
                null,
            }),
          }
        );

      const orderResult =
        await orderResponse.json();

      if (
        !orderResponse.ok ||
        !orderResult.success
      ) {
        throw new Error(
          orderResult.message ||
            "Unable to create your order."
        );
      }

      const order =
        orderResult.data;

      console.log(
        "Laravel order created:",
        order
      );

      /* -------------------------------- */
      /* CREATE RAZORPAY ORDER */
      /* -------------------------------- */

      const paymentResponse =
        await fetch(
          `${API_URL}/payments/create`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",

              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },

            body: JSON.stringify({
              order_number:
                order.order_number,
            }),
          }
        );

      const paymentResult =
        await paymentResponse.json();

      if (
        !paymentResponse.ok ||
        !paymentResult.success
      ) {
        throw new Error(
          paymentResult.message ||
            "Unable to create payment."
        );
      }

      const razorpayData =
        paymentResult.data;

      console.log(
        "Razorpay order:",
        razorpayData
      );

      /* -------------------------------- */
      /* RAZORPAY OPTIONS */
      /* -------------------------------- */

      const options = {
        key:
          razorpayData.key_id,

        amount:
          razorpayData.amount,

        currency:
          razorpayData.currency ||
          "INR",

        name:
          "Navratri Store",

        description:
          `Order ${order.order_number}`,

        order_id:
          razorpayData.razorpay_order_id,

        prefill: {
          name:
            form.name,

          email:
            form.email,

          contact:
            phone,
        },

        notes: {
          order_number:
            order.order_number,

          coupon_code:
            appliedCoupon?.code ||
            "",
        },

        theme: {
          color:
            "#8f1239",
        },

        handler:
          async function (
            response: any
          ) {
            try {
              /* -------------------------------- */
              /* VERIFY PAYMENT */
              /* -------------------------------- */

              const verifyResponse =
                await fetch(
                  `${API_URL}/payments/verify`,
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json",

                      Accept:
                        "application/json",

                      ...(token
                        ? {
                            Authorization: `Bearer ${token}`,
                          }
                        : {}),
                    },

                    body: JSON.stringify({
                      order_number:
                        order.order_number,

                      razorpay_order_id:
                        response.razorpay_order_id,

                      razorpay_payment_id:
                        response.razorpay_payment_id,

                      razorpay_signature:
                        response.razorpay_signature,
                    }),
                  }
                );

              const verifyResult =
                await verifyResponse.json();

              if (
                !verifyResponse.ok ||
                !verifyResult.success
              ) {
                throw new Error(
                  verifyResult.message ||
                    "Payment verification failed."
                );
              }

              console.log(
                "Payment verified:",
                verifyResult
              );

              /* -------------------------------- */
              /* CLEAR CART */
              /* -------------------------------- */

              clear();

              setAppliedCoupon(null);
              setCouponCode("");

              /* -------------------------------- */
              /* SUCCESS */
              /* -------------------------------- */

              window.location.href =
                `/order/success?order=${encodeURIComponent(
                  order.order_number
                )}`;
            } catch (error) {
              console.error(
                "Payment verification error:",
                error
              );

              alert(
                error instanceof Error
                  ? error.message
                  : "Payment verification failed."
              );

              setLoading(false);
            }
          },

        modal: {
          ondismiss:
            async () => {
              console.log(
                "Razorpay checkout closed."
              );

              await cancelOrderAndRestoreStock(
                order.order_number,
                "Customer cancelled the payment."
              );

              setLoading(false);
            },
        },
      };

      /* -------------------------------- */
      /* RAZORPAY INSTANCE */
      /* -------------------------------- */

      const razorpay =
        new window.Razorpay(
          options
        );

      /* -------------------------------- */
      /* PAYMENT FAILED */
      /* -------------------------------- */

      razorpay.on(
        "payment.failed",
        async function (
          response: any
        ) {
          console.error(
            "Payment failed:",
            response
          );

          await cancelOrderAndRestoreStock(
            order.order_number,
            response?.error
              ?.description ||
              "Payment failed."
          );

          setLoading(false);

          alert(
            response?.error
              ?.description ||
              "Payment failed. Please try again."
          );
        }
      );

      /* -------------------------------- */
      /* OPEN RAZORPAY */
      /* -------------------------------- */

      razorpay.open();
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while placing your order."
      );

      setLoading(false);
    }
  };

  /* -------------------------------- */
  /* PRODUCT LOADING */
  /* -------------------------------- */

  if (
    productSlug &&
    productLoading
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbf6ed] px-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#eadfce] border-t-[#8f1239]" />

          <p className="mt-5 text-sm font-semibold text-[#806d65]">
            Loading your product...
          </p>
        </div>
      </main>
    );
  }

  /* -------------------------------- */
  /* PRODUCT ERROR */
  /* -------------------------------- */

  if (
    productSlug &&
    !productLoading &&
    !buyNowProduct
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbf6ed] px-6">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#8f1239]/10">
            <ShoppingBag
              size={32}
              className="text-[#8f1239]"
            />
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.35em] text-[#ad7b2d]">
            Checkout
          </p>

          <h1 className="mt-4 font-serif text-4xl font-bold text-[#3b1714]">
            Product unavailable
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#806d65]">
            {productError ||
              "We could not load this product. Please try again."}
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#8f1239] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#70102e]"
          >
            Explore Collection

            <ChevronRight
              size={17}
            />
          </Link>
        </div>
      </main>
    );
  }

  /* -------------------------------- */
  /* EMPTY CART */
  /* -------------------------------- */

  if (
    checkoutItems.length === 0
  ) {
    return (
      <main className="min-h-screen bg-[#fbf6ed] px-6 py-24">
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />

        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#8f1239]/10">
            <ShoppingBag
              size={32}
              className="text-[#8f1239]"
            />
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.35em] text-[#ad7b2d]">
            Checkout
          </p>

          <h1 className="mt-4 font-serif text-4xl font-bold text-[#3b1714]">
            Your bag is waiting
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#806d65]">
            Add your favourite Navratri
            pieces to continue with
            checkout.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#8f1239] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#70102e]"
          >
            Explore Collection

            <ChevronRight
              size={17}
            />
          </Link>
        </div>
      </main>
    );
  }

  /* -------------------------------- */
  /* CHECKOUT */
  /* -------------------------------- */

  return (
    <main className="min-h-screen bg-[#fbf6ed]">
      {/* RAZORPAY */}

      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log(
            "Razorpay script loaded successfully"
          );
        }}
        onError={() => {
          console.error(
            "Razorpay script failed to load"
          );
        }}
      />

      {/* TOP BAR */}

      <div className="border-b border-[#eadfce] bg-[#fffdf9]">
        <div className="mx-auto max-w-7xl px-5 py-4 lg:px-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#806d65] transition hover:text-[#8f1239]"
          >
            <ArrowLeft size={16} />
            Back to bag
          </Link>
        </div>
      </div>

      {/* HEADER */}

      <section className="relative overflow-hidden border-b border-[#eadfce] bg-[#fffdf9]">
        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#8f1239]/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-[#ad7b2d]">
              <Sparkles size={15} />
              Navratri Collection
            </div>

            <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-[#3b1714] md:text-5xl">
              Complete your order
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#806d65]">
              A few details and your festive
              look will be on its way to you.
            </p>
          </div>

          {/* STEPS */}

          <div className="mt-9 flex max-w-2xl items-center">
            <CheckoutStep
              number="01"
              title="Bag"
              done
            />

            <div className="h-px flex-1 bg-[#d9cbb9]" />

            <CheckoutStep
              number="02"
              title="Address"
              active
            />

            <div className="h-px flex-1 bg-[#d9cbb9]" />

            <CheckoutStep
              number="03"
              title="Payment"
            />
          </div>
        </div>
      </section>

      {/* MAIN */}

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_430px] lg:px-8">

        {/* LEFT */}

        <form
          onSubmit={handleSubmit}
          className="space-y-7"
        >
          {/* DELIVERY */}

          <section className="overflow-hidden rounded-[28px] border border-[#e8dccb] bg-white shadow-[0_18px_50px_rgba(61,31,20,0.05)]">
            <div className="border-b border-[#eee3d6] px-6 py-6 md:px-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#8f1239]/10">
                  <MapPin
                    size={20}
                    className="text-[#8f1239]"
                  />
                </div>

                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#3b1714]">
                    Delivery details
                  </h2>

                  <p className="mt-1 text-sm text-[#806d65]">
                    Where should we deliver
                    your order?
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2 md:p-8">
              <PremiumInput
                label="Full name"
                name="name"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
              />

              <PremiumInput
                label="Mobile number"
                name="phone"
                type="tel"
                placeholder="10 digit mobile number"
                value={form.phone}
                onChange={handleChange}
                maxLength={10}
              />

              <div className="md:col-span-2">
                <PremiumInput
                  label="Email address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2.5 block text-xs font-bold uppercase tracking-[0.12em] text-[#5c4640]">
                  Complete address
                </label>

                <textarea
                  required
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={4}
                  placeholder="House / Flat / Street / Area"
                  className="w-full resize-none rounded-2xl border border-[#ded1c2] bg-[#fffdf9] px-4 py-3.5 text-sm text-[#3b1714] outline-none transition placeholder:text-[#a5968e] focus:border-[#8f1239] focus:ring-4 focus:ring-[#8f1239]/10"
                />
              </div>

              <PremiumInput
                label="City"
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
              />

              <PremiumInput
                label="State"
                name="state"
                placeholder="State"
                value={form.state}
                onChange={handleChange}
              />

              <PremiumInput
                label="Pincode"
                name="pincode"
                placeholder="6 digit pincode"
                value={form.pincode}
                onChange={handleChange}
                maxLength={6}
              />
            </div>
          </section>

          {/* PAYMENT */}

          <section className="overflow-hidden rounded-[28px] border border-[#e8dccb] bg-white shadow-[0_18px_50px_rgba(61,31,20,0.05)]">
            <div className="border-b border-[#eee3d6] px-6 py-6 md:px-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ad7b2d]/10">
                  <CreditCard
                    size={20}
                    className="text-[#ad7b2d]"
                  />
                </div>

                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#3b1714]">
                    Payment
                  </h2>

                  <p className="mt-1 text-sm text-[#806d65]">
                    Choose your preferred
                    payment method
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#8f1239] bg-[#fff8fa] p-5">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#8f1239]/5" />

                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#8f1239] text-white">
                    <CreditCard size={21} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-[#3b1714]">
                        Online Payment
                      </p>

                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8f1239]">
                        <Check
                          size={13}
                          className="text-white"
                        />
                      </div>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-[#806d65]">
                      UPI · Cards · Net Banking
                      · Wallets
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#fbf6ed] px-4 py-3.5">
                <ShieldCheck
                  size={18}
                  className="shrink-0 text-[#ad7b2d]"
                />

                <p className="text-xs leading-5 text-[#6e5d55]">
                  Your payment information
                  is protected with secure
                  encryption.
                </p>
              </div>
            </div>
          </section>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="flex h-15 w-full items-center justify-center gap-3 rounded-full bg-[#8f1239] px-7 text-sm font-bold text-white shadow-[0_12px_30px_rgba(143,18,57,0.2)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#74102f] hover:shadow-[0_16px_35px_rgba(143,18,57,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LockKeyhole size={18} />

            {loading
              ? "Opening Secure Payment..."
              : `Continue to Secure Payment · ₹${total.toLocaleString(
                  "en-IN"
                )}`}
          </button>
        </form>

        {/* RIGHT */}

        <aside className="h-fit lg:sticky lg:top-6">
          <section className="overflow-hidden rounded-[30px] border border-[#e8dccb] bg-white shadow-[0_20px_60px_rgba(61,31,20,0.07)]">

            {/* SUMMARY HEADER */}

            <div className="border-b border-[#eee3d6] px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ad7b2d]">
                    Your selection
                  </p>

                  <h2 className="mt-1 font-serif text-2xl font-bold text-[#3b1714]">
                    Order summary
                  </h2>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fbf6ed]">
                  <ShoppingBag
                    size={19}
                    className="text-[#8f1239]"
                  />
                </div>
              </div>
            </div>

            {/* PRODUCTS */}

            <div className="space-y-5 px-6 py-6">
              {checkoutItems.map(
                (item) => (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}`}
                    className="flex gap-4"
                  >
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f5ede2]">
                     <img
                        src={getProductImage(item.product)}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute right-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-bold text-[#3b1714] shadow">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#3b1714]">
                        {
                          item.product
                            .name
                        }
                      </h3>

                      {item.size && (
                        <p className="mt-1 text-xs text-[#806d65]">
                          Size:{" "}
                          {item.size}
                        </p>
                      )}

                      {item.color && (
                        <p className="text-xs text-[#806d65]">
                          Color:{" "}
                          {item.color}
                        </p>
                      )}

                      <p className="mt-2 font-bold text-[#8f1239]">
                        ₹
                        {(
                          Number(
                            item.product
                              .price ||
                              0
                          ) *
                          item.quantity
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* SHIPPING */}

            <div className="mx-6 rounded-2xl bg-[#fbf6ed] p-4">
              <div className="flex items-start gap-3">
                <Truck
                  size={18}
                  className="mt-0.5 shrink-0 text-[#ad7b2d]"
                />

                <div className="flex-1">
                  <p className="text-xs font-bold text-[#3b1714]">
                    {subtotal >=
                    2000
                      ? "You've unlocked FREE shipping!"
                      : `Add ₹${(
                          2000 -
                          subtotal
                        ).toLocaleString(
                          "en-IN"
                        )} more for FREE shipping`}
                  </p>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e2d7c9]">
                    <div
                      className="h-full rounded-full bg-[#ad7b2d] transition-all"
                      style={{
                        width: `${Math.min(
                          (subtotal /
                            2000) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* COUPON */}

            <div className="px-6 pt-6">
              {!appliedCoupon ? (
                <>
                  <div className="flex items-center gap-2 rounded-2xl border border-[#ded1c2] bg-[#fffdf9] p-1.5">
                    <Tag
                      size={17}
                      className="ml-2 text-[#ad7b2d]"
                    />

                    <input
                      value={
                        couponCode
                      }
                      onChange={(e) => {
                        setCouponCode(
                          e.target.value.toUpperCase()
                        );

                        setCouponError(
                          ""
                        );

                        setCouponSuccess(
                          ""
                        );
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key ===
                          "Enter"
                        ) {
                          e.preventDefault();
                          applyCoupon();
                        }
                      }}
                      placeholder="Coupon code"
                      className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm uppercase outline-none placeholder:text-[#a5968e]"
                    />

                    <button
                      type="button"
                      onClick={
                        applyCoupon
                      }
                      disabled={
                        couponLoading ||
                        !couponCode.trim()
                      }
                      className="rounded-xl bg-[#3b1714] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#8f1239] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {couponLoading
                        ? "Checking..."
                        : "Apply"}
                    </button>
                  </div>

                  {couponError && (
                    <p className="mt-2 px-1 text-xs font-semibold text-red-600">
                      {
                        couponError
                      }
                    </p>
                  )}

                  {couponSuccess && (
                    <p className="mt-2 px-1 text-xs font-semibold text-green-700">
                      {
                        couponSuccess
                      }
                    </p>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <Tag
                          size={16}
                          className="text-green-700"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-green-800">
                          {
                            appliedCoupon.code
                          }
                        </p>

                        <p className="text-xs text-green-700">
                          ₹
                          {appliedCoupon.discount.toLocaleString(
                            "en-IN"
                          )}{" "}
                          discount applied
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        removeCoupon
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-red-500 shadow-sm transition hover:bg-red-50"
                      title="Remove coupon"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PRICE */}

            <div className="mt-6 border-t border-[#eee3d6] px-6 py-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#806d65]">
                    Subtotal
                  </span>

                  <span className="font-semibold text-[#3b1714]">
                    ₹
                    {subtotal.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#806d65]">
                    Shipping
                  </span>

                  <span className="font-semibold text-[#3b1714]">
                    {shipping ===
                    0
                      ? "FREE"
                      : `₹${shipping}`}
                  </span>
                </div>

                {discount >
                  0 && (
                  <div className="flex justify-between text-green-700">
                    <span>
                      Discount
                      {appliedCoupon?.code
                        ? ` (${appliedCoupon.code})`
                        : ""}
                    </span>

                    <span>
                      -₹
                      {discount.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
  <span className="text-[#806d65]">
    Taxable Amount
  </span>
  <span className="font-semibold text-[#3b1714]">
    ₹
    {taxableAmount.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}
  </span>
</div>

{cgstAmount > 0 && (
  <div className="flex justify-between">
    <span className="text-[#806d65]">
      CGST
    </span>
    <span className="font-semibold text-[#3b1714]">
      ₹
      {cgstAmount.toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}
    </span>
  </div>
)}

{sgstAmount > 0 && (
  <div className="flex justify-between">
    <span className="text-[#806d65]">
      SGST
    </span>
    <span className="font-semibold text-[#3b1714]">
      ₹
      {sgstAmount.toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}
    </span>
  </div>
)}

{igstAmount > 0 && (
  <div className="flex justify-between">
    <span className="text-[#806d65]">
      IGST
    </span>
    <span className="font-semibold text-[#3b1714]">
      ₹
      {igstAmount.toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}
    </span>
  </div>
)}
              </div>

              <div className="my-5 h-px bg-[#eadfce]" />

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#806d65]">
                    Total
                  </p>

                  <p className="mt-1 text-xs text-[#a5968e]">
                    Inclusive of applicable
                    taxes
                  </p>
                </div>

                <p className="font-serif text-3xl font-bold text-[#8f1239]">
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>
            </div>

            {/* TRUST */}

            <div className="grid grid-cols-2 border-t border-[#eee3d6]">
              <div className="flex items-center gap-2 px-5 py-4">
                <LockKeyhole
                  size={16}
                  className="text-[#ad7b2d]"
                />

                <span className="text-[11px] font-semibold text-[#6e5d55]">
                  Secure checkout
                </span>
              </div>

              <div className="flex items-center gap-2 border-l border-[#eee3d6] px-5 py-4">
                <ShieldCheck
                  size={16}
                  className="text-[#ad7b2d]"
                />

                <span className="text-[11px] font-semibold text-[#6e5d55]">
                  Safe payment
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

/* -------------------------------- */
/* CHECKOUT STEP */
/* -------------------------------- */

function CheckoutStep({
  number,
  title,
  active = false,
  done = false,
}: {
  number: string;
  title: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ${
          active
            ? "bg-[#8f1239] text-white"
            : done
            ? "bg-[#ad7b2d] text-white"
            : "border border-[#d8ccbd] bg-white text-[#806d65]"
        }`}
      >
        {done ? (
          <Check size={14} />
        ) : (
          number
        )}
      </div>

      <span
        className={`hidden text-xs font-bold uppercase tracking-[0.12em] sm:block ${
          active
            ? "text-[#8f1239]"
            : "text-[#806d65]"
        }`}
      >
        {title}
      </span>
    </div>
  );
}

/* -------------------------------- */
/* PREMIUM INPUT */
/* -------------------------------- */

function PremiumInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  placeholder: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="mb-2.5 block text-xs font-bold uppercase tracking-[0.12em] text-[#5c4640]">
        {label}
      </label>

      <input
        required
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="h-13 w-full rounded-2xl border border-[#ded1c2] bg-[#fffdf9] px-4 text-sm text-[#3b1714] outline-none transition placeholder:text-[#a5968e] focus:border-[#8f1239] focus:ring-4 focus:ring-[#8f1239]/10"
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#fbf6ed] px-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#eadfce] border-t-[#8f1239]" />
            <p className="mt-5 text-sm font-semibold text-[#806d65]">
              Loading checkout...
            </p>
          </div>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}