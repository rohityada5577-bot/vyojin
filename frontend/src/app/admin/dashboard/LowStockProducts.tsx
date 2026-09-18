"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Package } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.vyojin.co.in/api/v1";

interface Product {
  id: number;
  name: string;
  slug: string;
  stock: number;
}

export default function LowStockProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const token = localStorage.getItem("admin_token");

        if (!token) {
          window.location.href = "/admin/login";
          return;
        }

        const response = await fetch(
          `${API_URL}/admin/analytics/low-stock?limit=10`,
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
        console.error("Low stock error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStock();
  }, []);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Low Stock Products
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Products that need restocking
          </p>
        </div>

        <div className="rounded-xl bg-gray-100 p-3">
          <AlertTriangle size={20} />
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-500">
          Checking stock...
        </div>
      ) : products.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          All products have sufficient stock.
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-xl border border-gray-100 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Package size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {product.name}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Product ID: #{product.id}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {product.stock}
                </p>

                <p className="text-xs text-gray-500">
                  {product.stock === 1 ? "unit left" : "units left"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}