"use client";

import {
  ArrowUpRight,
  Box,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  Loader2,
  ShoppingBag,
  RefreshCw,
  Users,
} from "lucide-react";
import Link from "next/link";
import SalesAnalytics from "./SalesAnalytics";


import { useEffect, useState } from "react";

import TopProducts from "./TopProducts";
import LowStockProducts from "./LowStockProducts";


const API_URL = "https://api.vyojin.co.in/api/v1";

interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  pending_orders: number;
  paid_orders: number;
}

interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string | null;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
}

interface DashboardData {
  stats: DashboardStats;
  recent_orders: RecentOrder[];
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // Get admin authentication token
      const token = localStorage.getItem("admin_token");

      // If admin is not logged in
      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      // Call Laravel dashboard API
      const response = await fetch(
        `${API_URL}/admin/dashboard`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Token expired / invalid
      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load dashboard."
        );
      }

      // Store real Laravel/MySQL data
      setDashboard(result.data);
    } catch (err) {
      console.error("Dashboard API error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6ecdf]">
            <Loader2
              size={25}
              className="animate-spin text-[#8f1239]"
            />
          </div>

          <p className="mt-4 text-sm font-semibold text-[#665b55]">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Error state
   */
  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-md rounded-[1.5rem] border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <ClipboardList
              size={25}
              className="text-red-500"
            />
          </div>

          <h2 className="mt-5 text-xl font-black text-[#241b1b]">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#807575]">
            {error}
          </p>

          <button
            onClick={fetchDashboard}
            className="mt-6 rounded-full bg-[#8f1239] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#74102f]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats;

  /*
   * Real dashboard values
   */
  const totalRevenue = Number(
    stats?.total_revenue || 0
  );

  const totalOrders = Number(
    stats?.total_orders || 0
  );

  const totalProducts = Number(
    stats?.total_products || 0
  );

  const totalCustomers = Number(
    stats?.total_customers || 0
  );

  const pendingOrders = Number(
    stats?.pending_orders || 0
  );

  const paidOrders = Number(
    stats?.paid_orders || 0
  );

  return (
    <div>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a57945]">
            Overview
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#241b1b] sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-[#807575]">
            Welcome back. Here&apos;s what&apos;s happening
            with your store.
          </p>
        </div>

      <div className="flex items-center gap-3">
  <div className="rounded-2xl border border-[#e5ddd3] bg-white px-5 py-3 text-sm font-semibold text-[#665b55]">
    {new Date().toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    })}
  </div>

  <button
    type="button"
    onClick={fetchDashboard}
    disabled={loading}
    className="flex items-center gap-2 rounded-2xl border border-[#e5ddd3] bg-white px-4 py-3 text-sm font-bold text-[#665b55] transition hover:border-[#8f1239] hover:text-[#8f1239] disabled:cursor-not-allowed disabled:opacity-50"
  >
    <RefreshCw
      size={16}
      className={loading ? "animate-spin" : ""}
    />

    Refresh
  </button>
</div>
      </div>

      {/* =====================================================
          MAIN STATS
      ====================================================== */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString(
            "en-IN"
          )}`}
          change="From paid orders"
          icon={IndianRupee}
        />

        <StatCard
          title="Total Orders"
          value={totalOrders.toLocaleString("en-IN")}
          change={`${pendingOrders} pending orders`}
          icon={ClipboardList}
        />

        <StatCard
          title="Products"
          value={totalProducts.toLocaleString("en-IN")}
          change="Products in store"
          icon={Box}
        />

        <StatCard
          title="Customers"
          value={totalCustomers.toLocaleString("en-IN")}
          change="Registered customers"
          icon={Users}
        />
      </div>

      {/* =====================================================
          SECONDARY STATS
      ====================================================== */}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {/* Paid Orders */}
        <div className="flex items-center justify-between rounded-[1.5rem] border border-[#e8e0d7] bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <p className="text-xs text-[#8b807a]">
                Paid Orders
              </p>

              <p className="mt-1 text-2xl font-black text-[#241b1b]">
                {paidOrders.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-green-600">
            Successful
          </span>
        </div>

        {/* Pending Orders */}
        <div className="flex items-center justify-between rounded-[1.5rem] border border-[#e8e0d7] bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
              <ClipboardList size={21} />
            </div>

            <div>
              <p className="text-xs text-[#8b807a]">
                Pending Orders
              </p>

              <p className="mt-1 text-2xl font-black text-[#241b1b]">
                {pendingOrders.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-yellow-600">
            Needs attention
          </span>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <SalesAnalytics />
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TopProducts />
        <LowStockProducts />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* =================================================
            RECENT ORDERS
        ================================================== */}

        <section className="overflow-hidden rounded-[1.5rem] border border-[#e8e0d7] bg-white">
          <div className="flex items-center justify-between border-b border-[#eee8e1] p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a57945]">
                Orders
              </p>

              <h2 className="mt-1 text-xl font-black text-[#241b1b]">
                Recent Orders
              </h2>
            </div>

            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#8f1239] transition hover:underline"
            >
              View All
            </Link>
          </div>

          {dashboard?.recent_orders &&
          dashboard.recent_orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#eee8e1] text-left text-xs uppercase tracking-wider text-[#958a83]">
                    <th className="px-6 py-4 font-bold">
                      Order
                    </th>

                    <th className="px-6 py-4 font-bold">
                      Customer
                    </th>

                    <th className="px-6 py-4 font-bold">
                      Total
                    </th>

                    <th className="px-6 py-4 font-bold">
                      Payment
                    </th>

                    <th className="px-6 py-4 font-bold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {dashboard.recent_orders.map(
                    (order) => (
                      <tr
                        key={order.id}
                        className="border-b border-[#f1ece6] last:border-0 transition hover:bg-[#fcfaf7]"
                      >
                        {/* Order */}
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-[#241b1b]">
                            #{order.order_number}
                          </p>

                          <p className="mt-1 text-xs text-[#9a8f88]">
                            {formatDate(
                              order.created_at
                            )}
                          </p>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-5">
                          <p className="text-sm font-medium text-[#3d3430]">
                            {order.customer_name ||
                              "Guest Customer"}
                          </p>
                        </td>

                        {/* Total */}
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-[#241b1b]">
                            ₹
                            {Number(
                              order.total
                            ).toLocaleString("en-IN")}
                          </p>
                        </td>

                        {/* Payment */}
                        <td className="px-6 py-5">
                          <StatusBadge
                            status={
                              order.payment_status
                            }
                          />
                        </td>

                        {/* Order Status */}
                        <td className="px-6 py-5">
                          <StatusBadge
                            status={order.status}
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f7efe3]">
                <ShoppingBag
                  size={27}
                  className="text-[#a57945]"
                />
              </div>

              <h3 className="mt-4 font-bold text-[#241b1b]">
                No recent orders
              </h3>

              <p className="mt-1 max-w-sm text-sm text-[#8b807a]">
                Orders will appear here once customers
                start purchasing.
              </p>
            </div>
          )}
        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================== */}

        <section className="rounded-[1.5rem] bg-[#241b1b] p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d7b681]">
            Quick Actions
          </p>

          <h2 className="mt-2 text-xl font-black">
            Store Management
          </h2>

          <div className="mt-6 space-y-3">
            <QuickAction
              icon={<Box size={18} />}
              title="Add Product"
              href="/admin/products/create"
            />

            <QuickAction
              icon={<ClipboardList size={18} />}
              title="View Orders"
              href="/admin/orders"
            />

            <QuickAction
              icon={<Users size={18} />}
              title="View Customers"
              href="/admin/customers"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[#e8e0d7] bg-white p-6 shadow-[0_10px_35px_rgba(60,40,20,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(60,40,20,0.08)]">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f6ecdf] text-[#8f1239]">
          <Icon size={21} />
        </div>

        <ArrowUpRight
          size={18}
          className="text-[#b5aaa0]"
        />
      </div>

      <p className="mt-6 text-sm font-medium text-[#807575]">
        {title}
      </p>

      <p className="mt-1 text-3xl font-black text-[#241b1b]">
        {value}
      </p>

      <p className="mt-2 text-xs text-[#a49a92]">
        {change}
      </p>
    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon,
  title,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-white/10"
    >
      <span className="flex items-center gap-3 text-sm font-semibold">
        {icon}
        {title}
      </span>

      <ArrowUpRight
        size={17}
        className="text-white/50"
      />
    </Link>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = status?.toLowerCase();

  let classes = "bg-gray-100 text-gray-600";

  if (
    normalized === "paid" ||
    normalized === "completed" ||
    normalized === "confirmed"
  ) {
    classes = "bg-green-50 text-green-700";
  }

  if (
    normalized === "pending" ||
    normalized === "processing"
  ) {
    classes = "bg-yellow-50 text-yellow-700";
  }

  if (
    normalized === "failed" ||
    normalized === "cancelled"
  ) {
    classes = "bg-red-50 text-red-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold capitalize ${classes}`}
    >
      {status || "Unknown"}
    </span>
  );
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(date: string) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}