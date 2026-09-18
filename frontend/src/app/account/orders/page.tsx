"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.vyojin.co.in/api/v1";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  price: string | number;
  total: string | number;
  product?: {
    id: number;
    name: string;
    slug: string;
    image?: string | null;
  };
}

interface Order {
  id: number;
  order_number: string;
  subtotal: string | number;
  shipping_amount: string | number;
  discount_amount: string | number;
  total_amount: string | number;
  payment_status: string;
  order_status: string;
  payment_method: string | null;
  coupon_code: string | null;
  created_at: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const { customer, token, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!customer || !token) {
      router.push("/login");
      return;
    }

    fetchOrders();
  }, [authLoading, customer, token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const authToken =
        token || localStorage.getItem("customer_token");

      if (!authToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/customer/orders`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("customer_token");
        localStorage.removeItem("customer_user");

        router.push("/login");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load your orders."
        );
      }

      setOrders(result.data.orders || []);
    } catch (err: any) {
      console.error("Orders error:", err);

      setError(
        err.message || "Something went wrong while loading orders."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: string | number) => {
    return `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "paid":
      case "delivered":
        return "bg-green-50 text-green-700";

      case "pending":
        return "bg-yellow-50 text-yellow-700";

      case "cancelled":
      case "failed":
        return "bg-red-50 text-red-700";

      case "shipped":
        return "bg-blue-50 text-blue-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[#faf7f2]">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#8f1239] border-t-transparent" />

            <p className="mt-4 text-sm text-gray-500">
              Loading your orders...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      {/* HEADER */}
      <section className="border-b border-[#eadfd3] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#8f1239]"
          >
            <ArrowLeft size={16} />
            Back to Account
          </Link>

          <div className="mt-7">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#b08b57]">
              Your Account
            </p>

            <h1 className="mt-2 text-4xl font-bold text-[#7f1d1d]">
              My Orders
            </h1>

            <p className="mt-2 text-gray-500">
              View and track your Navratri Store orders.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {!error && orders.length === 0 && (
          <div className="rounded-3xl border border-[#eadfd3] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#faf1e7] text-[#8f1239]">
              <ShoppingBag size={32} strokeWidth={1.5} />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              No orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You haven't placed any orders yet. Explore our
              festive collection and find something you love.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#8f1239] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#74152d]"
            >
              Start Shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* ORDERS */}
        {orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => (
              <article
                key={order.id}
                className="overflow-hidden rounded-3xl border border-[#eadfd3] bg-white shadow-sm"
              >
                {/* ORDER TOP */}
                <div className="flex flex-col gap-5 border-b border-[#eee5dc] p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <Package
                        size={19}
                        className="text-[#8f1239]"
                      />

                      <h2 className="font-bold text-gray-900">
                        {order.order_number}
                      </h2>
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      Ordered on {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs uppercase tracking-wider text-gray-400">
                      Total
                    </p>

                    <p className="mt-1 text-xl font-bold text-[#7f1d1d]">
                      {formatPrice(order.total_amount)}
                    </p>
                  </div>
                </div>

                {/* ORDER BODY */}
                <div className="p-6">
                  <div className="flex flex-wrap gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusClass(
                        order.payment_status
                      )}`}
                    >
                      Payment: {order.payment_status}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusClass(
                        order.order_status
                      )}`}
                    >
                      {order.order_status}
                    </span>
                  </div>

                  {/* ITEMS */}
                  <div className="mt-6 divide-y divide-[#eee5dc]">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">
                            {item.product_name}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                            <span>
                              Qty: {item.quantity}
                            </span>

                            {item.size && (
                              <span>
                                Size: {item.size}
                              </span>
                            )}

                            {item.color && (
                              <span>
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="shrink-0 font-semibold text-gray-800">
                          {formatPrice(item.total)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* ACTION */}
                  <div className="mt-6 flex justify-end border-t border-[#eee5dc] pt-5">
                    <Link
                      href={`/account/orders/${order.order_number}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[#8f1239] px-5 py-2.5 text-sm font-semibold text-[#8f1239] transition hover:bg-[#8f1239] hover:text-white"
                    >
                      View Order
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}