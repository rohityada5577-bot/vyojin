"use client";

import { useEffect, useState } from "react";
import { Package, TrendingUp } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://api.vyojin.co.in/api/v1";

interface Product {
  id: number;
  name: string;
  slug: string;
  sold_quantity: number;
  revenue: number;
}

export default function TopProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("admin_token");

        if (!token) {
          window.location.href = "/admin/login";
          return;
        }

        const response = await fetch(
          `${API_URL}/admin/analytics/top-products?limit=5`,
          {
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

        if (result.success) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error("Top products error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Top Selling Products
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Best performing products by sales
          </p>
        </div>

        <div className="rounded-xl bg-gray-100 p-3">
          <TrendingUp size={20} />
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-500">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          No sales data available.
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-xl border border-gray-100 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-700">
                #{index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-gray-400" />

                  <p className="truncate text-sm font-semibold text-gray-900">
                    {product.name}
                  </p>
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  {product.sold_quantity} units sold
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  ₹{product.revenue.toLocaleString("en-IN")}
                </p>

                <p className="text-xs text-gray-500">
                  Revenue
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}