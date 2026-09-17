"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  ShoppingBag,
  IndianRupee,
  CalendarDays,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock3,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api/v1";

interface Order {
  id: number;
  order_number: string;
  subtotal?: number | string;
  shipping_amount?: number | string;
  discount_amount?: number | string;
  total_amount?: number | string;
  payment_status?: string;
  order_status?: string;
  payment_method?: string;
  created_at?: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  orders_count?: number;
  orders_sum_total_amount?: number | string | null;
  created_at?: string;
  updated_at?: string;
  orders?: Order[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    if (typeof window === "undefined") return null;

    return localStorage.getItem("admin_token");
  };

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/customers/${id}`,
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
          result.message || "Failed to load customer."
        );
      }

      setCustomer(result.data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customer."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const formatCurrency = (
    value?: number | string | null
  ) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date?: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  const getOrderStatusClass = (status?: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-50 text-green-700";

      case "shipped":
        return "bg-blue-50 text-blue-700";

      case "processing":
        return "bg-purple-50 text-purple-700";

      case "confirmed":
        return "bg-indigo-50 text-indigo-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-yellow-50 text-yellow-700";
    }
  };

  const getPaymentStatusClass = (status?: string) => {
    switch (status) {
      case "paid":
        return "bg-green-50 text-green-700";

      case "failed":
        return "bg-red-50 text-red-700";

      case "refunded":
        return "bg-purple-50 text-purple-700";

      default:
        return "bg-yellow-50 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f7f8fa]">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw
            size={18}
            className="animate-spin"
          />
          Loading customer...
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <span>
                {error || "Customer not found."}
              </span>
            </div>

            <Link
              href="/admin/customers"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm"
            >
              <ArrowLeft size={16} />
              Back to Customers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orders = customer.orders || [];

  const paidOrders = orders.filter(
    (order) => order.payment_status === "paid"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.order_status === "delivered"
  ).length;

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1400px]">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/customers"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={17} />
            Back to Customers
          </Link>

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-sm font-bold text-white shadow-sm">
                {getInitials(customer.name)}
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {customer.name}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Customer #{customer.id}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchCustomer}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <User size={19} className="text-gray-700" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  Customer Information
                </h2>

                <p className="text-xs text-gray-500">
                  Personal and contact information
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Full Name
                </p>

                <p className="font-medium text-gray-900">
                  {customer.name}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Customer ID
                </p>

                <p className="font-medium text-gray-900">
                  #{customer.id}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Email
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail size={15} className="text-gray-400" />
                  {customer.email}
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Phone
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone size={15} className="text-gray-400" />
                  {customer.phone || "Not provided"}
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Joined
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CalendarDays
                    size={15}
                    className="text-gray-400"
                  />
                  {formatDate(customer.created_at)}
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Last Updated
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock3
                    size={15}
                    className="text-gray-400"
                  />
                  {formatDate(customer.updated_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900">
              Customer Summary
            </h2>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">
                      Total Orders
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {customer.orders_count ?? 0}
                    </p>
                  </div>

                  <ShoppingBag
                    size={21}
                    className="text-gray-400"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">
                      Total Spent
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {formatCurrency(
                        customer.orders_sum_total_amount
                      )}
                    </p>
                  </div>

                  <IndianRupee
                    size={21}
                    className="text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">
                    Paid
                  </p>

                  <p className="mt-1 font-bold text-gray-900">
                    {paidOrders}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">
                    Delivered
                  </p>

                  <p className="mt-1 font-bold text-gray-900">
                    {deliveredOrders}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Order History
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  All orders placed by this customer.
                </p>
              </div>

              <div className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700">
                {orders.length} orders
              </div>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="p-14 text-center">
              <ShoppingBag
                size={42}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 font-medium text-gray-900">
                No orders yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                This customer has not placed any orders.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Order
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Amount
                      </th>

                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Payment
                      </th>

                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-gray-900">
                            {order.order_number}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Order #{order.id}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-500">
                          {formatDateTime(
                            order.created_at
                          )}
                        </td>

                        <td className="px-6 py-5 text-right font-semibold text-gray-900">
                          {formatCurrency(
                            order.total_amount
                          )}
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPaymentStatusClass(
                              order.payment_status
                            )}`}
                          >
                            {order.payment_status || "pending"}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getOrderStatusClass(
                              order.order_status
                            )}`}
                          >
                            {order.order_status || "pending"}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            <Eye size={15} />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="space-y-3 p-4 md:hidden">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {order.order_number}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {formatDateTime(
                            order.created_at
                          )}
                        </p>
                      </div>

                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600"
                      >
                        <Eye size={16} />
                      </Link>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                      <div>
                        <p className="text-xs text-gray-400">
                          Amount
                        </p>

                        <p className="mt-1 font-bold text-gray-900">
                          {formatCurrency(
                            order.total_amount
                          )}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getPaymentStatusClass(
                            order.payment_status
                          )}`}
                        >
                          {order.payment_status || "pending"}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getOrderStatusClass(
                            order.order_status
                          )}`}
                        >
                          {order.order_status || "pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}