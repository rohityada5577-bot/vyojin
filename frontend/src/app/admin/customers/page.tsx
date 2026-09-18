"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  Users,
  ShoppingBag,
  IndianRupee,
  Eye,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.vyojin.co.in/api/v1";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  orders_count?: number;
  orders_sum_total_amount?: number | string | null;
  created_at?: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

interface CustomersResponse {
  success: boolean;
  data: {
    data: Customer[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  message?: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    if (typeof window === "undefined") return null;

    return localStorage.getItem("admin_token");
  };

  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

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

      const response = await fetch(
        `${API_URL}/admin/customers?${params.toString()}`,
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

      const result: CustomersResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load customers."
        );
      }

      setCustomers(result.data.data);

      setPagination({
        current_page: result.data.current_page,
        last_page: result.data.last_page,
        total: result.data.total,
        per_page: result.data.per_page,
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1);
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();

    fetchCustomers(1);
  };

  const formatCurrency = (
    value?: number | string | null
  ) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Link
                href="/admin/dashboard"
                className="transition hover:text-gray-900"
              >
                Dashboard
              </Link>

              <span>/</span>

              <span className="text-gray-900">
                Customers
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Customers
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View and manage your store customers.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Customers
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {pagination.total}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <Users
                  size={21}
                  className="text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Customers on Page
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {customers.length}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <ShoppingBag
                  size={21}
                  className="text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Page
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {pagination.current_page}
                  <span className="text-base font-medium text-gray-400">
                    {" "}
                    / {pagination.last_page}
                  </span>
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <Users
                  size={21}
                  className="text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
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
                placeholder="Search by name, email or phone..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <Search size={17} />
              Search
            </button>

            <button
              type="button"
              onClick={() =>
                fetchCustomers(
                  pagination.current_page
                )
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </form>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Orders
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Total Spent
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Joined
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-sm text-gray-500"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw
                          size={17}
                          className="animate-spin"
                        />
                        Loading customers...
                      </div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center"
                    >
                      <Users
                        size={42}
                        className="mx-auto text-gray-300"
                      />

                      <p className="mt-3 font-medium text-gray-900">
                        No customers found
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Try changing your search.
                      </p>
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Customer */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-xs font-bold text-white">
                            {getInitials(
                              customer.name
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {customer.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              Customer #{customer.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail
                              size={14}
                              className="text-gray-400"
                            />
                            {customer.email}
                          </div>

                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Phone
                                size={14}
                                className="text-gray-400"
                              />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Orders */}
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-800">
                          {customer.orders_count ?? 0}
                        </span>
                      </td>

                      {/* Spent */}
                      <td className="px-6 py-5 text-right">
                        <div className="inline-flex items-center gap-1 font-semibold text-gray-900">
                          <IndianRupee size={15} />
                          {formatCurrency(
                            customer.orders_sum_total_amount
                          ).replace("₹", "")}
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {formatDate(
                          customer.created_at
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                        >
                          <Eye size={16} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="space-y-3 md:hidden">
          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw
                  size={17}
                  className="animate-spin"
                />
                Loading customers...
              </div>
            </div>
          ) : customers.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <Users
                size={40}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 font-medium text-gray-900">
                No customers found
              </p>
            </div>
          ) : (
            customers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-xs font-bold text-white">
                      {getInitials(customer.name)}
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {customer.name}
                      </h3>

                      <p className="mt-1 text-xs text-gray-400">
                        Customer #{customer.id}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600"
                  >
                    <Eye size={16} />
                  </Link>
                </div>

                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail
                      size={15}
                      className="text-gray-400"
                    />
                    <span className="truncate">
                      {customer.email}
                    </span>
                  </div>

                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone
                        size={15}
                        className="text-gray-400"
                      />
                      {customer.phone}
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">
                      Orders
                    </p>

                    <p className="mt-1 font-bold text-gray-900">
                      {customer.orders_count ?? 0}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">
                      Total Spent
                    </p>

                    <p className="mt-1 font-bold text-gray-900">
                      {formatCurrency(
                        customer.orders_sum_total_amount
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-400">
                  Joined {formatDate(customer.created_at)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.last_page > 1 && (
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Page{" "}
              <span className="font-semibold text-gray-900">
                {pagination.current_page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {pagination.last_page}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={
                  pagination.current_page <= 1
                }
                onClick={() =>
                  fetchCustomers(
                    pagination.current_page - 1
                  )
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                type="button"
                disabled={
                  pagination.current_page >=
                  pagination.last_page
                }
                onClick={() =>
                  fetchCustomers(
                    pagination.current_page + 1
                  )
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
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