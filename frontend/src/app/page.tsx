"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const categories = [
  {
    title: "Chaniya Choli",
    subtitle: "Traditional elegance",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Kurta Sets",
    subtitle: "Festive comfort",
    image:
      "https://images.unsplash.com/photo-1610189012906-7f8e3a4b0d4f?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Dupattas",
    subtitle: "Complete your look",
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85",
  },
];

const products = [
  {
    id: 1,
    name: "Rajwadi Mirror Chaniya Choli",
    category: "Chaniya Choli",
    price: 2499,
    oldPrice: 3299,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85",
    tag: "BESTSELLER",
  },
  {
    id: 2,
    name: "Meera Embroidered Kurta Set",
    category: "Kurta Set",
    price: 1899,
    oldPrice: 2499,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1610189012906-7f8e3a4b0d4f?auto=format&fit=crop&w=900&q=85",
    tag: "NEW",
  },
  {
    id: 3,
    name: "Gulabo Festive Dupatta",
    category: "Dupatta",
    price: 899,
    oldPrice: 1299,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85",
    tag: "TRENDING",
  },
  {
    id: 4,
    name: "Navratri Royal Lehenga",
    category: "Lehenga",
    price: 3499,
    oldPrice: 4299,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=85",
    tag: "LIMITED",
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
   const { customer, loading, logout } = useAuth();

  return (
    <main className="min-h-screen bg-[#fffaf1]">
      {/* TOP BAR */}
      <div className="bg-[#74152d] px-4 py-2 text-center text-[11px] font-medium tracking-[0.18em] text-white">
        ✦ FREE SHIPPING ON ORDERS ABOVE ₹1999 ✦
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#7f1d1d]/10 bg-[#fffaf1]/95 backdrop-blur-xl">
        <div className="container-main flex h-[76px] items-center justify-between">
          {/* MOBILE MENU */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* LOGO */}
          <Link href="/" className="group">
            <div className="text-center">
              <div className="font-serif text-[27px] font-bold tracking-tight text-[#7f1d1d]">
                NAVRANG
              </div>

              <div className="mt-[-3px] text-[8px] font-semibold tracking-[0.42em] text-[#b38332]">
                FESTIVE EDIT
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-8 lg:flex">
            <Link
              href="/"
              className="text-sm font-semibold text-[#7f1d1d]"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="flex items-center gap-1 text-sm font-medium hover:text-[#7f1d1d]"
            >
              Shop <ChevronDown size={14} />
            </Link>

            <Link
              href="/shop?category=women"
              className="text-sm font-medium hover:text-[#7f1d1d]"
            >
              Women
            </Link>

            <Link
              href="/shop?category=men"
              className="text-sm font-medium hover:text-[#7f1d1d]"
            >
              Men
            </Link>

            <Link
              href="/shop?collection=new"
              className="text-sm font-medium hover:text-[#7f1d1d]"
            >
              New Arrivals
            </Link>
          </nav>

         {/* ACTIONS */}
<div className="flex items-center gap-4">

  {/* SEARCH */}
  <button
    className="hidden sm:block"
    aria-label="Search"
  >
    <Search size={20} strokeWidth={1.7} />
  </button>

  {/* WISHLIST */}
  <Link
    href="/wishlist"
    className="hidden sm:block"
    aria-label="Wishlist"
  >
    <Heart size={20} strokeWidth={1.7} />
  </Link>

  {/* ACCOUNT */}
  {!loading && (
    <>
      {customer ? (
        <div className="hidden items-center gap-3 sm:flex">

          <Link
            href="/account"
            className="text-sm font-semibold text-[#7f1d1d] hover:text-[#8f1239]"
          >
            Hi, {customer.name.split(" ")[0]}
          </Link>

          <button
            onClick={logout}
            className="text-xs font-medium text-gray-500 hover:text-[#8f1239]"
          >
            Logout
          </button>

        </div>
      ) : (
        <div className="hidden items-center gap-3 sm:flex">

          <Link
            href="/login"
            className="text-sm font-semibold text-[#7f1d1d] hover:text-[#8f1239]"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-full bg-[#8f1239] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#74152d]"
          >
            Create Account
          </Link>

        </div>
      )}
    </>
  )}

  {/* CART */}
  <Link
    href="/cart"
    className="relative"
    aria-label="Shopping cart"
  >
    <ShoppingBag
      size={21}
      strokeWidth={1.7}
    />

    <span className="absolute -right-2 -top-2 flex h-[17px] w-[17px] items-center justify-center rounded-full bg-[#8f1239] text-[9px] text-white">
      0
    </span>
  </Link>

</div>
        </div>

        {/* MOBILE NAV */}
        {menuOpen && (
          <div className="border-t border-[#7f1d1d]/10 bg-[#fffaf1] px-5 py-5 lg:hidden">
            <div className="flex flex-col gap-5">
              <Link href="/" onClick={() => setMenuOpen(false)}>
                Home
              </Link>

              <Link href="/shop" onClick={() => setMenuOpen(false)}>
                Shop
              </Link>

              <Link href="/shop?category=women">
                Women
              </Link>

              <Link href="/shop?category=men">
                Men
              </Link>

              <Link href="/shop?collection=new">
                New Arrivals
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(190,148,61,0.18),transparent_35%)]" />

        <div className="container-main grid min-h-[680px] items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          {/* LEFT */}
          <div className="relative z-10 max-w-xl fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b38332]/30 bg-[#fff]/60 px-4 py-2 text-[11px] font-bold tracking-[0.2em] text-[#8f1239]">
              <Sparkles size={14} />
              NAVRATRI 2026 COLLECTION
            </div>

            <h1 className="font-serif text-[52px] font-semibold leading-[1.03] text-[#3b1714] sm:text-[68px] lg:text-[78px]">
              Dance in
              <br />
              <span className="gold-text italic">Colours.</span>
              <br />
              Shine in Tradition.
            </h1>

            <p className="mt-7 max-w-lg text-[16px] leading-7 text-[#6d5b54]">
              Discover our premium festive collection crafted for the nine
              nights of celebration. Traditional silhouettes, modern details
              and colours made to move with you.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/shop" className="premium-button">
                Explore Collection
                <ArrowRight size={17} />
              </Link>

              <Link href="/shop?collection=new" className="outline-button">
                New Arrivals
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-7 border-t border-[#7f1d1d]/10 pt-6">
              <div>
                <div className="text-xl font-bold text-[#7f1d1d]">
                  500+
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-[#806d65]">
                  Designs
                </div>
              </div>

              <div className="h-8 w-px bg-[#7f1d1d]/10" />

              <div>
                <div className="text-xl font-bold text-[#7f1d1d]">
                  4.9/5
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-[#806d65]">
                  Customer Rating
                </div>
              </div>

              <div className="h-8 w-px bg-[#7f1d1d]/10" />

              <div>
                <div className="text-xl font-bold text-[#7f1d1d]">
                  Pan India
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-[#806d65]">
                  Delivery
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute right-[10%] top-[8%] h-[390px] w-[390px] rounded-full bg-[#d7b35d]/20 blur-3xl" />

            <div className="relative h-[550px] w-full max-w-[470px] overflow-hidden rounded-[240px_240px_20px_20px] bg-[#ead7bd] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=90"
                alt="Navratri festive collection"
                className="float-image h-full w-full object-cover"
              />

              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/40 bg-white/80 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-[#8f1239]">
                      FEATURED
                    </p>
                    <p className="mt-1 font-serif text-lg font-bold">
                      Royal Garba Edit
                    </p>
                  </div>

                  <Link
                    href="/shop"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8f1239] text-white"
                  >
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="absolute -left-1 top-20 hidden rounded-2xl border border-white/70 bg-white/80 p-4 shadow-xl backdrop-blur-xl sm:block">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#b38332]" />

                <div>
                  <div className="text-xs font-bold">Festive Ready</div>
                  <div className="text-[10px] text-gray-500">
                    Made for Navratri
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden bg-[#8f1239] py-4 text-white">
        <div className="flex min-w-max animate-[marquee_20s_linear_infinite] gap-10 text-xs font-semibold tracking-[0.25em]">
          <span>GARBA NIGHTS</span>
          <span>✦</span>
          <span>FESTIVE FASHION</span>
          <span>✦</span>
          <span>HANDCRAFTED DETAILS</span>
          <span>✦</span>
          <span>NAVRATRI EDIT</span>
          <span>✦</span>
          <span>GARBA NIGHTS</span>
          <span>✦</span>
          <span>FESTIVE FASHION</span>
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="section-space">
        <div className="container-main">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-3 text-[11px] font-bold tracking-[0.25em] text-[#a87525]">
                SHOP BY CATEGORY
              </p>

              <h2 className="font-serif text-4xl font-semibold text-[#3b1714] sm:text-5xl">
                Find your festive look
              </h2>
            </div>

            <Link
              href="/shop"
              className="hidden items-center gap-2 text-sm font-bold text-[#8f1239] sm:flex"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.title}
                href="/shop"
                className="group relative h-[470px] overflow-hidden rounded-[24px]"
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                  <p className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#f2d98a]">
                    {category.subtitle.toUpperCase()}
                  </p>

                  <h3 className="font-serif text-3xl font-semibold">
                    {category.title}
                  </h3>

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold">
                    Shop Now
                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="bg-[#f5ecde] py-24">
        <div className="container-main">
          <div className="mb-12 text-center">
            <p className="mb-3 text-[11px] font-bold tracking-[0.25em] text-[#a87525]">
              CURATED FOR YOU
            </p>

            <h2 className="font-serif text-4xl font-semibold text-[#3b1714] sm:text-5xl">
              Festive favourites
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#75645c]">
              Statement pieces designed to make every Garba night memorable.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-6">
            {products.map((product) => (
              <article key={product.id} className="group">
                <Link href={`/product/${product.id}`}>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#eadcca]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-[9px] font-bold tracking-wider text-[#7f1d1d]">
                      {product.tag}
                    </span>

                    <button
                      onClick={(e) => e.preventDefault()}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#7f1d1d] opacity-0 shadow-md transition group-hover:opacity-100"
                    >
                      <Heart size={16} />
                    </button>
                  </div>
                </Link>

                <div className="pt-4">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#a87525]">
                    {product.category}
                  </div>

                  <Link href={`/product/${product.id}`}>
                    <h3 className="line-clamp-2 min-h-[42px] text-sm font-bold text-[#3b1714]">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mt-2 flex items-center gap-1">
                    <Star
                      size={12}
                      fill="currentColor"
                      className="text-[#b38332]"
                    />

                    <span className="text-xs font-semibold">
                      {product.rating}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-base font-bold text-[#7f1d1d]">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>

                    <span className="text-xs text-gray-400 line-through">
                      ₹{product.oldPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link href="/shop" className="outline-button">
              Explore All Products
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FESTIVE BANNER */}
      <section className="section-space">
        <div className="container-main">
          <div className="relative overflow-hidden rounded-[30px] bg-[#74152d] px-7 py-16 text-white sm:px-12 lg:px-20">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-[#e8c96d]/30" />
            <div className="absolute -bottom-32 right-20 h-80 w-80 rounded-full border border-[#e8c96d]/20" />

            <div className="relative z-10 max-w-2xl">
              <div className="mb-5 flex items-center gap-2 text-[#efd37c]">
                <Sparkles size={17} />
                <span className="text-[11px] font-bold tracking-[0.25em]">
                  THE NINE NIGHTS EDIT
                </span>
              </div>

              <h2 className="font-serif text-4xl leading-tight sm:text-6xl">
                Nine nights.
                <br />
                Nine colours.
                <br />
                <span className="italic text-[#f1d98b]">One celebration.</span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-white/70">
                From vibrant Chaniya Cholis to elegant Kurta Sets, discover
                something special for every night of Navratri.
              </p>

              <Link
                href="/shop"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#f4d77f] px-6 py-3 text-sm font-bold text-[#74152d] transition hover:bg-white"
              >
                Shop the Edit
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-[#7f1d1d]/10 bg-white py-12">
        <div className="container-main grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Free Shipping", "On orders above ₹1999"],
            ["Easy Returns", "7-day easy returns"],
            ["Secure Payment", "100% secure checkout"],
            ["Made With Love", "Festive pieces for you"],
          ].map(([title, subtitle]) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7ead9] text-[#8f1239]">
                <Sparkles size={17} />
              </div>

              <div>
                <h3 className="text-sm font-bold">{title}</h3>
                <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="section-space">
        <div className="container-main">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold tracking-[0.25em] text-[#a87525]">
              STAY IN THE LOOP
            </p>

            <h2 className="mt-3 font-serif text-4xl font-semibold text-[#3b1714]">
              Get festive updates
            </h2>

            <p className="mt-4 text-sm leading-6 text-[#75645c]">
              Be the first to know about new collections, exclusive drops and
              Navratri offers.
            </p>

            <form className="mx-auto mt-7 flex max-w-lg overflow-hidden rounded-full border border-[#7f1d1d]/15 bg-white p-1.5">
              <input
                type="email"
                placeholder="Enter your email address"
                className="min-w-0 flex-1 bg-transparent px-5 text-sm outline-none"
              />

              <button
                type="submit"
                className="rounded-full bg-[#8f1239] px-6 py-3 text-xs font-bold text-white"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#241514] px-5 pb-8 pt-16 text-white">
        <div className="container-main">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="font-serif text-3xl font-bold">NAVRANG</div>

              <div className="mt-1 text-[8px] font-semibold tracking-[0.4em] text-[#e0bd5e]">
                FESTIVE EDIT
              </div>

              <p className="mt-5 max-w-xs text-sm leading-6 text-white/55">
                Contemporary festive fashion inspired by India's timeless
                traditions.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold">Shop</h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-white/55">
                <Link href="/shop">All Products</Link>
                <Link href="/shop?category=women">Women</Link>
                <Link href="/shop?category=men">Men</Link>
                <Link href="/shop?collection=new">New Arrivals</Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold">Help</h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-white/55">
                <Link href="/contact">Contact Us</Link>
                <Link href="/shipping">Shipping & Delivery</Link>
                <Link href="/returns">Returns</Link>
                <Link href="/privacy">Privacy Policy</Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold">Follow Us</h3>

              <p className="mt-5 text-sm leading-6 text-white/55">
                Follow our festive journey and discover styling inspiration.
              </p>

              <div className="mt-5 flex gap-3">
                {["IG", "FB", "YT"].map((social) => (
                  <button
                    key={social}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[10px] font-bold"
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-white/10 pt-7 text-center text-xs text-white/35">
            © 2026 Navrang Festive Edit. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}