"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = "https://api.vyojin.co.in/api/v1";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Login failed.");
      }

      localStorage.setItem("admin_token", result.data.token);

      router.push("/admin/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to login."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#241b1b] px-5 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-2">
        {/* Brand */}
        <div className="hidden bg-[#8f1239] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#f1dfbd]">
              Navratri Store
            </p>

            <h1 className="mt-8 max-w-md text-5xl font-black leading-tight">
              Manage your store with confidence.
            </h1>

            <p className="mt-6 max-w-md text-sm leading-7 text-white/70">
              Products, orders, customers and inventory — all from one
              premium admin dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-white/70">
            <ShieldCheck size={20} />
            Secure Admin Access
          </div>
        </div>

        {/* Login */}
        <div className="p-7 sm:p-12">
          <div className="lg:hidden">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#a57945]">
              Navratri Store
            </p>
          </div>

          <div className="mt-8 lg:mt-0">
            <h2 className="text-3xl font-black text-[#241b1b]">
              Welcome back
            </h2>

            <p className="mt-2 text-sm text-[#807575]">
              Sign in to access your admin dashboard.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#3b3030]">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a49a92]"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="h-14 w-full rounded-2xl border border-[#e2d9cf] bg-[#fcfaf7] pl-12 pr-4 text-sm outline-none transition focus:border-[#8f1239] focus:ring-4 focus:ring-[#8f1239]/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#3b3030]">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a49a92]"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-14 w-full rounded-2xl border border-[#e2d9cf] bg-[#fcfaf7] pl-12 pr-4 text-sm outline-none transition focus:border-[#8f1239] focus:ring-4 focus:ring-[#8f1239]/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-2xl bg-[#8f1239] text-sm font-bold text-white shadow-lg transition hover:bg-[#74102f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}