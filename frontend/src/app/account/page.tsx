"use client";

import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const { customer, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div>
        <h1 className="text-4xl font-bold">
          Welcome, {customer?.name}
        </h1>

        <p className="mt-2">
          {customer?.email}
        </p>
      </div>
    </main>
  );
}