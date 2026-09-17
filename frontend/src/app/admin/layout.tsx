"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Box,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Tags,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Box,
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ClipboardList,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
   {
    name: "coupons",
    href: "/admin/coupons",
    icon: Users,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f7f5f1] text-[#241b1b]">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e7e1d8] bg-white px-5 lg:hidden">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a57945]">
            Navratr
          </p>
          <h1 className="text-lg font-black">Admin Panel</h1>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-xl border border-[#e7e1d8] p-2"
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-[#e7e1d8] bg-[#241b1b] text-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b border-white/10 px-7 py-7">
                <img
                  src="/logo/vyojin-logo.png"
                  alt="Navratri Store"
                  className="h-10 w-auto object-contain"
                />

            <h1 className="mt-2 text-2xl font-black">
              Admin Panel
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-7">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[#8f1239] text-white shadow-lg"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={19} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="border-t border-white/10 p-4">
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/60 hover:bg-white/5 hover:text-white"
            >
              <Settings size={18} />
              Settings
            </Link>

            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/10"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-72">
        <main className="min-h-screen p-5 sm:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}
    </div>
  );
}