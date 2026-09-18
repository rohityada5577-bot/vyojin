"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Home,
  PackageCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.vyojin.co.in/api/v1";

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
  size?: string | null;
  color?: string | null;
}

interface Order {
  order_number: string;
  subtotal: number | string;
  shipping_amount: number | string;
  discount_amount: number | string;
  total_amount: number | string;
  payment_status: string;
  order_status: string;

  customer?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };

  items: OrderItem[];
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderNumber) {
      setError("Order number is missing.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `${API_URL}/orders/${encodeURIComponent(orderNumber)}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to find order.");
        }

        setOrder(result.data);
      } catch (err) {
        console.error("Order fetch error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your order."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbf6ed] px-5 py-20">
        <div className="mx-auto max-w-4xl animate-pulse">
          <div className="mx-auto h-20 w-20 rounded-full bg-[#eadfce]" />

          <div className="mx-auto mt-8 h-8 w-72 rounded bg-[#eadfce]" />

          <div className="mx-auto mt-4 h-5 w-96 max-w-full rounded bg-[#eadfce]" />

          <div className="mt-12 h-80 rounded-[2rem] bg-[#eadfce]" />
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbf6ed] px-5">
        <div className="w-full max-w-xl rounded-[2rem] border border-[#eadfdf] bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <PackageCheck
              className="text-red-600"
              size={38}
            />
          </div>

          <h1 className="mt-7 text-3xl font-black text-[#241b1b]">
            Order Not Found
          </h1>

          <p className="mt-3 text-[#756969]">
            {error || "We could not find this order."}
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#8f1239] px-7 py-3.5 text-sm font-bold text-white"
          >
            Continue Shopping
            <ArrowRight size={17} />
          </Link>
        </div>
      </main>
    );
  }

  const paymentPaid =
    order.payment_status?.toLowerCase() === "paid";

  return (
    <main className="min-h-screen bg-[#fbf6ed] px-5 py-14 sm:py-20">
      <div className="mx-auto max-w-5xl">

        {/* Success Header */}
        <section className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#f1dfbd] shadow-[0_15px_40px_rgba(143,18,57,0.12)]">
            <CheckCircle2
              size={52}
              strokeWidth={1.8}
              className="text-[#8f1239]"
            />
          </div>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-[#a57945]">
            Order Confirmed
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#241b1b] sm:text-5xl">
            Thank You for Your Order!
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#756969] sm:text-base">
            Your Navratri collection order has been successfully
            placed. We&apos;ll keep you updated about your delivery.
          </p>

          <div className="mt-6 inline-flex rounded-full border border-[#e7d8c5] bg-white px-5 py-3 text-sm font-bold text-[#8f1239]">
            Order #{order.order_number}
          </div>
        </section>

        {/* Status */}
        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          <StatusCard
            icon={<CheckCircle2 size={22} />}
            title="Order Confirmed"
            description="Your order has been received"
            active
          />

          <StatusCard
            icon={<PackageCheck size={22} />}
            title="Preparing"
            description="We'll prepare your items"
            active={false}
          />

          <StatusCard
            icon={<Truck size={22} />}
            title="Delivery"
            description="Your order will be shipped"
            active={false}
          />
        </section>

        {/* Main Details */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* Items */}
          <div className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_15px_50px_rgba(75,45,20,0.06)] sm:p-8">
            <div className="flex items-center justify-between border-b border-[#eee5da] pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a57945]">
                  Your Items
                </p>

                <h2 className="mt-1 text-2xl font-black text-[#241b1b]">
                  Order Details
                </h2>
              </div>

              <ShoppingBag
                size={25}
                className="text-[#8f1239]"
              />
            </div>

            <div className="divide-y divide-[#eee5da]">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-5"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f7efe3]">
                    <ShoppingBag
                      size={23}
                      className="text-[#a57945]"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[#241b1b]">
                      {item.product_name}
                    </h3>

                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#807575]">
                      <span>Qty: {item.quantity}</span>

                      {item.size && (
                        <span>Size: {item.size}</span>
                      )}

                      {item.color && (
                        <span>Color: {item.color}</span>
                      )}
                    </div>
                  </div>

                  <p className="font-bold text-[#241b1b]">
                    ₹
                    {Number(item.total).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-[2rem] bg-[#241b1b] p-7 text-white shadow-[0_20px_50px_rgba(36,27,27,0.18)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d7b681]">
              Payment Summary
            </p>

            <div className="mt-7 space-y-4 text-sm">
              <SummaryRow
                label="Subtotal"
                value={`₹${Number(
                  order.subtotal
                ).toLocaleString("en-IN")}`}
              />

              <SummaryRow
                label="Shipping"
                value={
                  Number(order.shipping_amount) === 0
                    ? "FREE"
                    : `₹${Number(
                        order.shipping_amount
                      ).toLocaleString("en-IN")}`
                }
              />

              {Number(order.discount_amount) > 0 && (
                <SummaryRow
                  label="Discount"
                  value={`-₹${Number(
                    order.discount_amount
                  ).toLocaleString("en-IN")}`}
                />
              )}

              <div className="border-t border-white/10 pt-5">
                <div className="flex items-end justify-between gap-4">
                  <span className="text-sm text-white/60">
                    Total Paid
                  </span>

                  <span className="text-3xl font-black">
                    ₹
                    {Number(
                      order.total_amount
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-2xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-white/40">
                Payment Status
              </p>

              <p
                className={`mt-1 text-sm font-bold ${
                  paymentPaid
                    ? "text-green-400"
                    : "text-yellow-300"
                }`}
              >
                {paymentPaid
                  ? "Payment Successful"
                  : order.payment_status}
              </p>
            </div>
          </div>
        </section>

        {/* Customer Details */}
        {order.customer && (
          <section className="mt-6 rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_15px_50px_rgba(75,45,20,0.06)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a57945]">
              Delivery Information
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[#978b84]">
                  Name
                </p>

                <p className="mt-1 font-bold text-[#241b1b]">
                  {order.customer.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#978b84]">
                  Phone
                </p>

                <p className="mt-1 font-bold text-[#241b1b]">
                  {order.customer.phone}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#978b84]">
                  Email
                </p>

                <p className="mt-1 break-all font-bold text-[#241b1b]">
                  {order.customer.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#978b84]">
                  Address
                </p>

                <p className="mt-1 font-bold leading-6 text-[#241b1b]">
                  {order.customer.address},{" "}
                  {order.customer.city},{" "}
                  {order.customer.state} -{" "}
                  {order.customer.pincode}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Actions */}
        <section className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8f1239] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#74102f]"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ddcfbf] bg-white px-8 py-4 text-sm font-bold text-[#241b1b] transition hover:bg-[#f7efe3]"
          >
            <Home size={18} />
            Back to Home
          </Link>
        </section>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fbf6ed] px-5 py-20">
          <div className="mx-auto max-w-4xl animate-pulse">
            <div className="mx-auto h-20 w-20 rounded-full bg-[#eadfce]" />

            <div className="mx-auto mt-8 h-8 w-72 rounded bg-[#eadfce]" />

            <div className="mx-auto mt-4 h-5 w-96 max-w-full rounded bg-[#eadfce]" />

            <div className="mt-12 h-80 rounded-[2rem] bg-[#eadfce]" />
          </div>
        </main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}

function StatusCard({
  icon,
  title,
  description,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-[1.5rem] border p-5 ${
        active
          ? "border-[#d9c29d] bg-white"
          : "border-[#eadfce] bg-white/60"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full ${
          active
            ? "bg-[#f1dfbd] text-[#8f1239]"
            : "bg-[#eee8df] text-[#a39a91]"
        }`}
      >
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-[#241b1b]">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-[#827772]">
        {description}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/60">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}