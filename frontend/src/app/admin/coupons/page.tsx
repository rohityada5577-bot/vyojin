"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  Tag,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.vyojin.co.in/api/v1";

interface Coupon {
  id: number;
  code: string;
  name: string | null;
  type: "percentage" | "fixed";
  value: number | string;
  max_discount: number | string | null;
  min_order_amount: number | string;
  usage_limit: number | null;
 usage_count: number;
  expires_at: string | null;
  is_active: boolean;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_token")
      : null;

  async function loadCoupons() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(
        `${API_URL}/admin/coupons?${params.toString()}`,
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

      if (result.success) {
        setCoupons(result.data.data || []);
      }
    } catch (error) {
      console.error("Coupon loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  async function deleteCoupon(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coupon?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/admin/coupons/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Unable to delete coupon.");
        return;
      }

      loadCoupons();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  }

  async function toggleCoupon(id: number) {
    try {
      const response = await fetch(
        `${API_URL}/admin/coupons/${id}/toggle`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Unable to update coupon.");
        return;
      }

      loadCoupons();
    } catch (error) {
      console.error(error);
    }
  }

  function formatDiscount(coupon: Coupon) {
    if (coupon.type === "percentage") {
      return `${coupon.value}%`;
    }

    return `₹${Number(coupon.value).toLocaleString("en-IN")}`;
  }

  function formatDate(date: string | null) {
    if (!date) return "No expiry";

    return new Date(date).toLocaleDateString("en-IN");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Tag size={22} />
              <h1 className="text-2xl font-bold text-slate-900">
                Coupons
              </h1>
            </div>

            <p className="text-sm text-slate-500">
              Manage discount coupons and promotional offers.
            </p>
          </div>

          <Link
            href="/admin/coupons/create"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Create Coupon
          </Link>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    loadCoupons();
                  }
                }}
                placeholder="Search coupon code..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <button
              onClick={loadCoupons}
              className="rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white"
            >
              Search
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">
                    Coupon
                  </th>

                  <th className="px-5 py-4">
                    Discount
                  </th>

                  <th className="px-5 py-4">
                    Min Order
                  </th>

                  <th className="px-5 py-4">
                    Usage
                  </th>

                  <th className="px-5 py-4">
                    Expiry
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      Loading coupons...
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      No coupons found.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {coupon.code}
                        </div>

                        <div className="text-xs text-slate-500">
                          {coupon.name || "No name"}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {formatDiscount(coupon)}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        ₹
                        {Number(
                          coupon.min_order_amount
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4 text-sm">
                      {coupon.usage_count}
                        {" / "}
                        {coupon.usage_limit ?? "∞"}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {formatDate(coupon.expires_at)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            coupon.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {coupon.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              toggleCoupon(coupon.id)
                            }
                            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
                            title="Toggle status"
                          >
                            <Power size={16} />
                          </button>

                          <Link
                            href={`/admin/coupons/${coupon.id}/edit`}
                            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </Link>

                          <button
                            onClick={() =>
                              deleteCoupon(coupon.id)
                            }
                            className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}