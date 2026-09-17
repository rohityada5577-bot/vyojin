"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Tag } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api/v1";

export default function CreateCouponPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "percentage",
    value: "",
    min_order_amount: "",
    max_discount: "",
    starts_at: "",
    expires_at: "",
    usage_limit: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(
    field: string,
    value: string | boolean
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        type: form.type,
        value: Number(form.value),

        min_order_amount: form.min_order_amount
          ? Number(form.min_order_amount)
          : null,

        max_discount:
          form.type === "percentage" && form.max_discount
            ? Number(form.max_discount)
            : null,

        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,

        usage_limit: form.usage_limit
          ? Number(form.usage_limit)
          : null,

        is_active: form.is_active,
      };

      const response = await fetch(
        `${API_URL}/admin/coupons`,
        {
          method: "POST",
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

      if (!response.ok) {
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
              "Unable to create coupon."
          );
        }

        return;
      }

      router.push("/admin/coupons");
    } catch (err) {
      console.error("Create coupon error:", err);
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/admin/coupons"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
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
                  Create Coupon
                </h1>

                <p className="text-sm text-slate-500">
                  Create a new discount coupon.
                </p>
              </div>
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
                Enter the basic coupon details.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Coupon Code */}
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
                  placeholder="NAVRATRI20"
                  required
                  maxLength={50}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Example: NAVRATRI20
                </p>
              </div>

              {/* Coupon Name */}
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
                  placeholder="Navratri 20% Off"
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
                Configure the discount amount and rules.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Discount Type */}
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
                    placeholder={
                      form.type === "percentage"
                        ? "20"
                        : "500"
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
                    placeholder="1000"
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
                      placeholder="500"
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

          {/* Coupon Validity */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Coupon Validity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Set when this coupon can be used.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Start */}
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

              {/* Expiry */}
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

          {/* Usage & Status */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Usage & Status
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Control coupon usage and availability.
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

              {/* Active */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Status
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
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
                      Customers can use this coupon.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin/coupons"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />

              {loading
                ? "Creating..."
                : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}