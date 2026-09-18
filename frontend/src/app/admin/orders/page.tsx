"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  RefreshCw,
  Package,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = "http://api.vyojin.co.in/api/v1";

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

interface Order {
  id: number;
  order_number: string;
  customer?: Customer | null;
  total_amount: number | string;
  payment_status: string;
  order_status: string;
  payment_method?: string;
  created_at: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [page, orderStatus, paymentStatus]);

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("admin_token");

      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("per_page", "15");

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (orderStatus) {
        params.set("order_status", orderStatus);
      }

      if (paymentStatus) {
        params.set("payment_status", paymentStatus);
      }

      const response = await fetch(
        `${API_URL}/admin/orders?${params.toString()}`,
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
        window.location.href = "/admin/login";
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load orders."
        );
      }

      setOrders(result.data?.data || []);

      setPagination({
        current_page: result.data?.current_page || 1,
        last_page: result.data?.last_page || 1,
        per_page: result.data?.per_page || 15,
        total: result.data?.total || 0,
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    setPage(1);
    fetchOrders();
  }

  function clearFilters() {
    setSearch("");
    setOrderStatus("");
    setPaymentStatus("");
    setPage(1);
  }

  async function refreshOrders() {
    setRefreshing(true);
    await fetchOrders();
  }

  function formatPrice(value: number | string) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  }

  function formatDate(date: string) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(date: string) {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusClass(status: string) {
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

  function StatusIcon({
    status,
  }: {
    status: string;
  }) {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "paid":
        return <CheckCircle2 size={14} />;

      case "processing":
      case "confirmed":
        return <Package size={14} />;

      case "shipped":
        return <Truck size={14} />;

      case "cancelled":
      case "failed":
      case "refunded":
        return <XCircle size={14} />;

      default:
        return <Clock size={14} />;
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5]">

      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link
                  href="/admin/dashboard"
                  className="hover:text-black"
                >
                  Dashboard
                </Link>

                <span>/</span>

                <span className="text-gray-900">
                  Orders
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
                Orders
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage customer orders and payment status.
              </p>
            </div>

            <button
              onClick={refreshOrders}
              disabled={refreshing}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />

              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Total Orders
              </span>

              <Package
                size={18}
                className="text-gray-400"
              />
            </div>

            <div className="mt-2 text-2xl font-semibold text-gray-900">
              {pagination?.total ?? 0}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Pending
              </span>

              <Clock
                size={18}
                className="text-amber-500"
              />
            </div>

            <div className="mt-2 text-2xl font-semibold text-gray-900">
              {orders.filter(
                (order) =>
                  order.order_status === "pending"
              ).length}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Paid
              </span>

              <CreditCard
                size={18}
                className="text-emerald-500"
              />
            </div>

            <div className="mt-2 text-2xl font-semibold text-gray-900">
              {orders.filter(
                (order) =>
                  order.payment_status === "paid"
              ).length}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Current Page
              </span>

              <Filter
                size={18}
                className="text-gray-400"
              />
            </div>

            <div className="mt-2 text-2xl font-semibold text-gray-900">
              {pagination?.current_page ?? 1}
            </div>
          </div>
        </div>


        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

          <form
            onSubmit={handleSearch}
            className="grid gap-3 lg:grid-cols-[1fr_190px_190px_auto_auto]"
          >

            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search order, customer, email or phone..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
              />
            </div>

            {/* Order status */}
            <select
              value={orderStatus}
              onChange={(e) => {
                setOrderStatus(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-gray-400"
            >
              <option value="">
                All Order Status
              </option>

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

            {/* Payment status */}
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-gray-400"
            >
              <option value="">
                All Payment Status
              </option>

              {PAYMENT_STATUSES.map((status) => (
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
              type="submit"
              className="h-11 rounded-xl bg-gray-900 px-5 text-sm font-medium text-white transition hover:bg-black"
            >
              Search
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="h-11 rounded-xl border border-gray-200 px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Clear
            </button>

          </form>
        </div>


        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* Orders */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Desktop */}
          <div className="hidden overflow-x-auto lg:block">

            <table className="w-full min-w-[950px]">

              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Order
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Payment
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Date
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-sm text-gray-500"
                    >
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center"
                    >
                      <Package
                        size={35}
                        className="mx-auto text-gray-300"
                      />

                      <p className="mt-3 text-sm font-medium text-gray-900">
                        No orders found
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Try changing your filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">
                          #{order.order_number}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          ID: {order.id}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">
                          {order.customer?.name || "Guest"}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {order.customer?.email ||
                            order.customer?.phone ||
                            "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-900">
                          {formatPrice(
                            order.total_amount
                          )}
                        </span>

                        <div className="mt-1 text-xs capitalize text-gray-500">
                          {order.payment_method ||
                            "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusClass(
                            order.payment_status
                          )}`}
                        >
                          <StatusIcon
                            status={
                              order.payment_status
                            }
                          />

                          {order.payment_status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusClass(
                            order.order_status
                          )}`}
                        >
                          <StatusIcon
                            status={
                              order.order_status
                            }
                          />

                          {order.order_status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(
                            order.created_at
                          )}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {formatTime(
                            order.created_at
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-900 hover:text-white"
                        >
                          <Eye size={15} />
                          View
                        </Link>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>


          {/* Mobile */}
          <div className="divide-y divide-gray-100 lg:hidden">

            {loading ? (
              <div className="px-5 py-16 text-center text-sm text-gray-500">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <Package
                  size={35}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-sm font-medium text-gray-900">
                  No orders found
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="font-semibold text-gray-900">
                        #{order.order_number}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="rounded-lg border border-gray-200 p-2 text-gray-600"
                    >
                      <Eye size={17} />
                    </Link>

                  </div>

                  <div className="mt-4">

                    <p className="text-sm font-medium text-gray-900">
                      {order.customer?.name || "Guest"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {order.customer?.email ||
                        order.customer?.phone ||
                        "-"}
                    </p>

                  </div>

                  <div className="mt-4 flex items-center justify-between">

                    <div>
                      <p className="text-xs text-gray-500">
                        Amount
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {formatPrice(
                          order.total_amount
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Payment
                      </p>

                      <span
                        className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium capitalize ${statusClass(
                          order.payment_status
                        )}`}
                      >
                        {order.payment_status}
                      </span>
                    </div>

                  </div>

                  <div className="mt-4">

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusClass(
                        order.order_status
                      )}`}
                    >
                      <StatusIcon
                        status={order.order_status}
                      />

                      {order.order_status}
                    </span>

                  </div>

                </div>
              ))
            )}

          </div>

        </div>


        {/* Pagination */}
        {pagination &&
          pagination.last_page > 1 && (
            <div className="mt-5 flex items-center justify-between">

              <p className="text-sm text-gray-500">
                Page{" "}
                <span className="font-medium text-gray-900">
                  {pagination.current_page}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-900">
                  {pagination.last_page}
                </span>
              </p>

              <div className="flex items-center gap-2">

                <button
                  disabled={
                    pagination.current_page <= 1
                  }
                  onClick={() =>
                    setPage((prev) =>
                      Math.max(1, prev - 1)
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  disabled={
                    pagination.current_page >=
                    pagination.last_page
                  }
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(
                        pagination.last_page,
                        prev + 1
                      )
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>

              </div>
            </div>
          )}

      </div>
    </div>
  );
}