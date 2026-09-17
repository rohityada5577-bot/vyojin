"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "@/types";

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];

  add: (
    product: Product,
    size?: string,
    color?: string,
    quantity?: number
  ) => void;

  remove: (
    productId: number,
    size?: string,
    color?: string
  ) => void;

  updateQuantity: (
    productId: number,
    quantity: number,
    size?: string,
    color?: string
  ) => void;

  clear: () => void;
}

const CartContext =
  createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "navratri-cart";

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  }, []);

  // Save cart
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [items]);

  // Add product
  const add = (
    product: Product,
    size?: string,
    color?: string,
    quantity = 1
  ) => {
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.size === size &&
          item.color === color
      );

      // Product already exists
      if (existingIndex !== -1) {
        return currentItems.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      // New product
      return [
        ...currentItems,
        {
          product,
          quantity,
          size,
          color,
        },
      ];
    });
  };

  // Remove product
  const remove = (
    productId: number,
    size?: string,
    color?: string
  ) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.size === size &&
            item.color === color
          )
      )
    );
  };

  // Update quantity
  const updateQuantity = (
    productId: number,
    quantity: number,
    size?: string,
    color?: string
  ) => {
    if (quantity <= 0) {
      remove(productId, size, color);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId &&
        item.size === size &&
        item.color === color
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  // Clear cart
  const clear = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        add,
        remove,
        updateQuantity,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}