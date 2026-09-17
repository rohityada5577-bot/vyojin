"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Tag } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api/v1";

interface Coupon {
  id: number;
  code: string;
  name: string | null;
  type: "percentage" | "fixed";
  value: number | string;
  min_order_amount: number | string | null;
  max_discount: number | string | null;
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
}

export default function EditCouponPage() {
  const params = useParams();
  const router = useRouter();

  const couponId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    min_order_amount: "",
    max_discount: "",
    starts_at: "",
    expires_at: "",
    usage_limit: "",
    is_active: true,
  });

  const [usageCount, setUsageCount] = useState(0);

  function updateField(
    field: string,
    value: string | boolean
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function formatDateTimeLocal(
    date: string | null
  ) {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    const year = parsed.getFullYear();
    const month = String(
      parsed.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      parsed.getDate()
    ).padStart(2, "0");
    const hours = String(
      parsed.getHours()
    ).padStart(2, "0");
    const minutes = String(
      parsed.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  async function loadCoupon() {
    const token = localStorage.getItem(
      "admin_token"
    );

    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/coupons/${couponId}`,
        {
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
        setError(
          result.message ||
            "Unable to load coupon."
        );
        return;
      }

      const coupon: Coupon = result.data;

      setForm({
        code: coupon.code || "",
        name: coupon.name || "",
        type: coupon.type,
        value:
          coupon.value !== null &&
          coupon.value !== undefined
            ? String(coupon.value)
            : "",
        min_order_amount:
          coupon.min_order_amount !== null &&
          coupon.min_order_amount !== undefined
            ? String(coupon.min_order_amount)
            : "",
        max_discount:
          coupon.max_discount !== null &&
          coupon.max_discount !== undefined
            ? String(coupon.max_discount)
            : "",
        starts_at: formatDateTimeLocal(
          coupon.starts_at
        ),
        expires_at: formatDateTimeLocal(
          coupon.expires_at
        ),
        usage_limit:
          coupon.usage_limit !== null &&
          coupon.usage_limit !== undefined
            ? String(coupon.usage_limit)
            : "",
        is_active: Boolean(coupon.is_active),
      });

      setUsageCount(
        Number(coupon.usage_count || 0)
      );
    } catch (err) {
      console.error(
        "Load coupon error:",
        err
      );

      setError(
        "Something went wrong while loading the coupon."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (couponId) {
      loadCoupon();
    }
  }, [couponId]);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const token = localStorage.getItem(
      "admin_token"
    );

    if (!token) {
      router.push("/admin/login");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        type: form.type,
        value: Number(form.value),

        min_order_amount:
          form.min_order_amount
            ? Number(form.min_order_amount)
            : null,

        max_discount:
          form.type === "percentage" &&
          form.max_discount
            ? Number(form.max_discount)
            : null,

        starts_at:
          form.starts_at || null,

        expires_at:
          form.expires_at || null,

        usage_limit:
          form.usage_limit
            ? Number(form.usage_limit)
            : null,

        is_active: form.is_active,
      };

      const response = await fetch(
        `${API_URL}/admin/coupons/${couponId}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.errors) {
          const firstError = Object.values(
            result.errors
          )[0];

          if (Array.isArray(firstError)) {
            setError(String(firstError[0]));
          } else {
            setError(String(firstError));
          }
        } else {
          setError(
            result.message ||
              "Unable to update coupon."
          );
        }

        return;
      }

      router.push("/admin/coupons");
    } catch (err) {
      console.error(
        "Update coupon error:",
        err
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="text-sm font-medium text-slate-500">
              Loading coupon...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/coupons"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Coupons
          </Link>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-3 text-white">
              <Tag size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Edit Coupon
              </h1>

              <p className="text-sm text-slate-500">
                Update coupon details and settings.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Basic Information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update the coupon identification details.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* Code */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Coupon Code
                </label>

                <input
                  type="text"
                  value={form.code}
                  onChange={(e) =>
                    updateField(
                      "code",
                      e.target.value.toUpperCase()
                    )
                  }
                  required
                  maxLength={50}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Coupon Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    updateField(
                      "name",
                      e.target.value
                    )
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

            </div>
          </section>

          {/* Discount */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Discount
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Configure how the coupon discounts the order.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* Type */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Discount Type
                </label>

                <select
                  value={form.type}
                  onChange={(e) =>
                    updateField(
                      "type",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="percentage">
                    Percentage
                  </option>

                  <option value="fixed">
                    Fixed Amount
                  </option>
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Discount Value
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.value}
                    onChange={(e) =>
                      updateField(
                        "value",
                        e.target.value
                      )
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    {form.type === "percentage"
                      ? "%"
                      : "₹"}
                  </span>
                </div>
              </div>

              {/* Minimum Order */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Minimum Order Amount
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.min_order_amount}
                    onChange={(e) =>
                      updateField(
                        "min_order_amount",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              {/* Maximum Discount */}
              {form.type === "percentage" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Maximum Discount
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.max_discount}
                      onChange={(e) =>
                        updateField(
                          "max_discount",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    Leave empty for no maximum discount.
                  </p>
                </div>
              )}

            </div>
          </section>

          {/* Validity */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Coupon Validity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Set the start and expiry dates.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Start Date
                </label>

                <input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) =>
                    updateField(
                      "starts_at",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Expiry Date
                </label>

                <input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) =>
                    updateField(
                      "expires_at",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

            </div>
          </section>

          {/* Usage */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Usage & Status
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage coupon usage and availability.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* Usage Limit */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Usage Limit
                </label>

                <input
                  type="number"
                  min="1"
                  value={form.usage_limit}
                  onChange={(e) =>
                    updateField(
                      "usage_limit",
                      e.target.value
                    )
                  }
                  placeholder="100"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Leave empty for unlimited usage.
                </p>
              </div>

              {/* Current Usage */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Current Usage
                </label>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {usageCount}
                  {" "}
                  {form.usage_limit
                    ? `/ ${form.usage_limit}`
                    : "/ Unlimited"}
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  Current usage cannot be changed here.
                </p>
              </div>

              {/* Status */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Status
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      updateField(
                        "is_active",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4"
                  />

                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      Active Coupon
                    </div>

                    <div className="text-xs text-slate-400">
                      Customers can use this coupon when active.
                    </div>
                  </div>
                </label>
              </div>

            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pb-8">

            <Link
              href="/admin/coupons"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}