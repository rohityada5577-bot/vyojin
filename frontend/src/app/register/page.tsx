"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(
        name,
        email,
        phone,
        password,
        passwordConfirmation
      );

      router.push("/account");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f5ef] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="bg-white border border-[#eadfce] rounded-2xl p-8 shadow-sm">

          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#b28a52] font-semibold">
              Navratri Store
            </p>

            <h1 className="text-3xl font-semibold text-[#211b15] mt-3">
              Create Account
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Join us for the festive collection
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                minLength={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#b28a52]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#b28a52]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                required
                minLength={10}
                maxLength={15}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#b28a52]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#b28a52]"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) =>
                  setPasswordConfirmation(e.target.value)
                }
                placeholder="Repeat password"
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#b28a52]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#211b15] text-white py-3 font-medium transition hover:bg-[#3a3027] disabled:opacity-50"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-500 mt-7">
            Already have an account?{" "}

            <Link
              href="/login"
              className="text-[#a07842] font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}