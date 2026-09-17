


"use client";

import { createContext, useContext } from "react";

const WishlistContext = createContext<any>(null);

export function WishlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WishlistContext.Provider value={{}}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}