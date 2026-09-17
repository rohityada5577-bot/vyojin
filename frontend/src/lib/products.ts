import type { Product } from "@/types";

export const products: Product[] = [
  {
    id: 1,
    slug: "royal-garba-chaniya-choli",
    name: "Royal Garba Chaniya Choli",
    price: 3499,
    compare_price: 4999,
    stock: 10,
    description:
      "A premium festive Chaniya Choli designed for Navratri celebrations with elegant detailing and a beautiful traditional silhouette.",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=90",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=90",
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1000&q=90",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Maroon", "Purple", "Red"],
    sku: "NAV-001",
    category: {
      id: 1,
      name: "Women",
    },
  },
  {
    id: 2,
    slug: "festive-embroidered-kurta",
    name: "Festive Embroidered Kurta",
    price: 2499,
    compare_price: 3299,
    stock: 15,
    description:
      "A stylish embroidered kurta created for festive evenings and comfortable celebration wear.",
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=90",
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=90",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Maroon"],
    sku: "NAV-002",
    category: {
      id: 2,
      name: "Men",
    },
  },
  {
    id: 3,
    slug: "navratri-festive-dupatta",
    name: "Navratri Festive Dupatta",
    price: 999,
    compare_price: 1499,
    stock: 20,
    description:
      "A colourful festive dupatta designed to complete your Navratri celebration look.",
    image:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1000&q=90",
    images: [
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1000&q=90",
    ],
    sizes: ["Free Size"],
    colors: ["Red", "Yellow", "Blue"],
    sku: "NAV-003",
    category: {
      id: 1,
      name: "Accessories",
    },
  },
];