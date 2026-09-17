"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { customer, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !customer) {
      router.push("/login");
    }
  }, [loading, customer, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div>
        <h1 className="text-4xl font-bold">
          Welcome, {customer.name}
        </h1>

        <p className="mt-2">
          {customer.email}
        </p>
      </div>
    </main>
  );
}