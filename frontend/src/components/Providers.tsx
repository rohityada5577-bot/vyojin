"use client";

import type { ReactNode } from "react";
import { CartProvider } from "./CartProvider";
import { WishlistProvider } from "./WishlistProvider";
import { AuthProvider } from "@/context/AuthContext";

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}