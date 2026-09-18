"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  CalendarDays,
  RefreshCw,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  IndianRupee,
} from "lucide-react";

const API_URL = "http://api.vyojin.co.in/api/v1";

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface Product {
  id: number;
  name: string;
  slug?: string;
  image?: string;
  price?: number | string;
}

interface OrderItem {
  id: number;
  product_id?: number;
  product?: Product | null;
  product_name?: string;
  quantity: number;
  price?: number | string;
  unit_price?: number | string;
  total?: number | string;
  subtotal?: number | string;
  size?: string;
  color?: string;
}

interface Payment {
  id?: number;
  payment_id?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  amount?: number | string;
  status?: string;
  method?: string;
  created_at?: string;
}

interface Order {
  id: number;
  order_number: string;
  subtotal: number | string;
  shipping_amount: number | string;
  discount_amount: number | string;
  total_amount: number | string;
  payment_status: string;
  order_status: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  customer?: Customer | null;
  items?: OrderItem[];
  payment?: Payment | null;
}

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params?.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  async function fetchOrder() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("admin_token");

      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/orders/${orderId}`,
        {
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
        throw new Error(
          result.message || "Unable to load order."
        );
      }

      setOrder(result.data);
      setSelectedStatus(result.data.order_status);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load order."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus() {
    if (!order || !selectedStatus) return;

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("admin_token");

      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/orders/${order.id}/status`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_status: selectedStatus,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to update order status."
        );
      }

      setOrder((prev) =>
        prev
          ? {
              ...prev,
              order_status: selectedStatus,
            }
          : prev
      );

      setSuccess("Order status updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update order status."
      );
    } finally {
      setUpdating(false);
    }
  }

  function formatPrice(value: number | string | undefined) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  }

  function formatDate(value?: string) {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(value?: string) {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusClass(status: string) {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "confirmed":
      case "processing":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "shipped":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "cancelled":
      case "failed":
      case "refunded":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  }

  function getStatusIcon(status: string) {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "paid":
        return <CheckCircle2 size={16} />;

      case "shipped":
        return <Truck size={16} />;

      case "cancelled":
      case "failed":
      case "refunded":
        return <XCircle size={16} />;

      case "confirmed":
      case "processing":
        return <Package size={16} />;

      default:
        return <Clock size={16} />;
    }
  }

  function getItemPrice(item: OrderItem) {
    return (
      item.unit_price ??
      item.price ??
      0
    );
  }

  function getItemTotal(item: OrderItem) {
    if (item.subtotal !== undefined) {
      return Number(item.subtotal);
    }

    if (item.total !== undefined) {
      return Number(item.total);
    }

    return (
      Number(getItemPrice(item)) *
      Number(item.quantity || 0)
    );
  }

  function getProductImage(item: OrderItem) {
    if (!item.product?.image) {
      return null;
    }

    if (
      item.product.image.startsWith("http://") ||
      item.product.image.startsWith("https://")
    ) {
      return item.product.image;
    }

    return `http://api.vyojin.co.in/storage/${item.product.image.replace(
      /^\/+/,
      ""
    )}`;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
        <div className="text-center">
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-gray-400"
          />

          <p className="mt-3 text-sm text-gray-500">
            Loading order...
          </p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const items = order.items || [];

  return (
    <div className="min-h-screen bg-[#f7f7f5]">

      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="px-4 py-5 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
              >
                <ArrowLeft size={16} />
                Back to Orders
              </Link>

              <div className="mt-3 flex flex-wrap items-center gap-3">

                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                  Order #{order.order_number}
                </h1>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusClass(
                    order.order_status
                  )}`}
                >
                  {getStatusIcon(order.order_status)}
                  {order.order_status}
                </span>

              </div>

              <p className="mt-1 text-sm text-gray-500">
                Created {formatDateTime(order.created_at)}
              </p>
            </div>

            <button
              onClick={fetchOrder}
              disabled={loading}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

          </div>
        </div>
      </header>


      <main className="px-4 py-6 sm:px-6 lg:px-8">

        {/* Alerts */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}


        {/* Status update */}
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>
              <h2 className="font-semibold text-gray-900">
                Order Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update the current status of this order.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">

              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value)
                }
                className="h-11 min-w-[190px] rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm capitalize outline-none focus:border-gray-400"
              >
                {ORDER_STATUSES.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status.charAt(0).toUpperCase() +
                      status.slice(1)}
                  </option>
                ))}
              </select>

              <button
                onClick={updateStatus}
                disabled={
                  updating ||
                  selectedStatus === order.order_status
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                {updating && (
                  <RefreshCw
                    size={15}
                    className="animate-spin"
                  />
                )}

                {updating
                  ? "Updating..."
                  : "Update Status"}
              </button>

            </div>
          </div>

        </section>


        {/* Main grid */}
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

          {/* Left */}
          <div className="space-y-6">

            {/* Products */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-200 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Package size={18} />
                  <h2 className="font-semibold text-gray-900">
                    Order Items
                  </h2>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {items.length}{" "}
                  {items.length === 1
                    ? "product"
                    : "products"}
                </p>
              </div>

              {items.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-gray-500">
                  No order items found.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">

                  {items.map((item) => {
                    const image = getProductImage(item);

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 p-5"
                      >

                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">

                          {image ? (
                            <img
                              src={image}
                              alt={
                                item.product?.name ||
                                item.product_name ||
                                "Product"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package
                                size={25}
                                className="text-gray-300"
                              />
                            </div>
                          )}

                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="font-medium text-gray-900">
                            {item.product?.name ||
                              item.product_name ||
                              "Product"}
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">

                            {item.size && (
                              <span className="rounded-md bg-gray-100 px-2 py-1">
                                Size: {item.size}
                              </span>
                            )}

                            {item.color && (
                              <span className="rounded-md bg-gray-100 px-2 py-1">
                                Color: {item.color}
                              </span>
                            )}

                            <span className="rounded-md bg-gray-100 px-2 py-1">
                              Qty: {item.quantity}
                            </span>

                          </div>

                          <div className="mt-3 flex items-center justify-between">

                            <span className="text-sm text-gray-500">
                              {formatPrice(
                                getItemPrice(item)
                              )}{" "}
                              × {item.quantity}
                            </span>

                            <span className="font-semibold text-gray-900">
                              {formatPrice(
                                getItemTotal(item)
                              )}
                            </span>

                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>
              )}

            </section>


            {/* Order summary */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-2">
                <IndianRupee size={18} />

                <h2 className="font-semibold text-gray-900">
                  Order Summary
                </h2>
              </div>

              <div className="mt-5 space-y-3 text-sm">

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-gray-900">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span className="font-medium text-gray-900">
                    {Number(order.shipping_amount) > 0
                      ? formatPrice(
                          order.shipping_amount
                        )
                      : "Free"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Discount
                  </span>

                  <span className="font-medium text-gray-900">
                    {Number(order.discount_amount) > 0
                      ? `-${formatPrice(
                          order.discount_amount
                        )}`
                      : "₹0"}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">
                      Total
                    </span>

                    <span className="text-lg font-semibold text-gray-900">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>
                </div>

              </div>

            </section>

          </div>


          {/* Right */}
          <div className="space-y-6">

            {/* Customer */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-2">
                <User size={18} />

                <h2 className="font-semibold text-gray-900">
                  Customer
                </h2>
              </div>

              <div className="mt-5">

                <p className="font-semibold text-gray-900">
                  {order.customer?.name ||
                    "Guest Customer"}
                </p>

                {order.customer?.email && (
                  <p className="mt-2 break-all text-sm text-gray-500">
                    {order.customer.email}
                  </p>
                )}

                {order.customer?.phone && (
                  <p className="mt-1 text-sm text-gray-500">
                    {order.customer.phone}
                  </p>
                )}

              </div>

            </section>


            {/* Address */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-2">
                <MapPin size={18} />

                <h2 className="font-semibold text-gray-900">
                  Delivery Address
                </h2>
              </div>

              <div className="mt-5 text-sm leading-6 text-gray-600">

                {order.customer?.address ? (
                  <>
                    <p>
                      {order.customer.address}
                    </p>

                    <p>
                      {[
                        order.customer.city,
                        order.customer.state,
                        order.customer.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </>
                ) : (
                  <p>
                    Address information is not available.
                  </p>
                )}

              </div>

            </section>


            {/* Payment */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-2">
                <CreditCard size={18} />

                <h2 className="font-semibold text-gray-900">
                  Payment
                </h2>
              </div>

              <div className="mt-5 space-y-4">

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Payment Status
                  </p>

                  <span
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${getStatusClass(
                      order.payment_status
                    )}`}
                  >
                    {getStatusIcon(
                      order.payment_status
                    )}

                    {order.payment_status}
                  </span>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Payment Method
                  </p>

                  <p className="mt-1 font-medium capitalize text-gray-900">
                    {order.payment_method || "-"}
                  </p>
                </div>

                {order.payment?.payment_id && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Payment ID
                    </p>

                    <p className="mt-1 break-all text-sm text-gray-700">
                      {order.payment.payment_id}
                    </p>
                  </div>
                )}

                {order.payment?.razorpay_payment_id && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Razorpay Payment ID
                    </p>

                    <p className="mt-1 break-all text-sm text-gray-700">
                      {order.payment.razorpay_payment_id}
                    </p>
                  </div>
                )}

              </div>

            </section>


            {/* Dates */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-2">
                <CalendarDays size={18} />

                <h2 className="font-semibold text-gray-900">
                  Timeline
                </h2>
              </div>

              <div className="mt-5 space-y-4">

                <div>
                  <p className="text-xs text-gray-400">
                    Order Created
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {formatDateTime(
                      order.created_at
                    )}
                  </p>
                </div>

                {order.updated_at && (
                  <div>
                    <p className="text-xs text-gray-400">
                      Last Updated
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {formatDateTime(
                        order.updated_at
                      )}
                    </p>
                  </div>
                )}

              </div>

            </section>


            {/* Notes */}
            {order.notes && (
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                <h2 className="font-semibold text-gray-900">
                  Order Notes
                </h2>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                  {order.notes}
                </p>

              </section>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}