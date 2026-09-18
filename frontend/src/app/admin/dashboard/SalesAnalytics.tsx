"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import OrderStatusAnalytics from "./OrderStatusAnalytics";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.vyojin.co.in/api/v1";

interface AnalyticsSummary {
  revenue: number;
  orders: number;
  average_order_value: number;
}

interface AnalyticsChart {
  label: string;
  revenue: number;
  orders: number;
}

interface AnalyticsData {
  period: string;
  summary: AnalyticsSummary;
  chart: AnalyticsChart[];
  order_status: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

export default function SalesAnalytics() {
  const [analytics, setAnalytics] =
    useState<AnalyticsData | null>(null);

  const [period, setPeriod] = useState("30days");
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (selectedPeriod = period) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("admin_token");

      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/analytics/sales?period=${selectedPeriod}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load analytics"
        );
      }

      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error("Analytics error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handlePeriodChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedPeriod = e.target.value;

    setPeriod(selectedPeriod);
    fetchAnalytics(selectedPeriod);
  };

  if (loading && !analytics) {
    return (
      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex h-[350px] items-center justify-center">
          <div className="text-sm text-gray-500">
            Loading sales analytics...
          </div>
        </div>
      </section>
    );
  }

  if (!analytics) {
    return null;
  }

return (
  <>
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Sales Analytics
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Revenue and orders from paid orders
          </p>
        </div>

        <select
          value={period}
          onChange={handlePeriodChange}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 outline-none focus:border-gray-900"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="12months">Last 12 Months</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl bg-gray-50 p-5">
          <p className="text-sm text-gray-500">
            Revenue
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            ₹{analytics.summary.revenue.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-5">
          <p className="text-sm text-gray-500">
            Paid Orders
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {analytics.summary.orders}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-5">
          <p className="text-sm text-gray-500">
            Average Order Value
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            ₹{analytics.summary.average_order_value.toLocaleString("en-IN")}
          </p>
        </div>

      </div>

      {/* Chart */}
      <div className="h-[350px] w-full">

        {loading ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-gray-500">
              Updating analytics...
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.chart}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="label"
                tick={{
                  fontSize: 12,
                }}
              />

              <YAxis
                tick={{
                  fontSize: 12,
                }}
              />

              <Tooltip
                formatter={(value, name) => [
                  name === "revenue"
                    ? `₹${Number(value).toLocaleString("en-IN")}`
                    : value,
                  name === "revenue"
                    ? "Revenue"
                    : "Orders",
                ]}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                strokeWidth={2}
                fillOpacity={0.15}
              />

            </AreaChart>
          </ResponsiveContainer>
        )}

      </div>

    </section>

    {/* Order Status Analytics */}
    <OrderStatusAnalytics
      data={analytics.order_status}
    />
  </>
);


}