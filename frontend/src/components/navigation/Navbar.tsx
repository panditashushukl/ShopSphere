"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-store";
import { useCart } from "@/store/cart-store";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { ShoppingBag, LogOut, User, ShieldAlert, Layers, Plus, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api-client";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { siteConfig } from "@/config/site.config";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const cartLines = useCart((s) => s.lines);
  const totalItems = cartLines.reduce((acc, l) => acc + l.qty, 0);

  const [cartOpen, setCartOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const canManageProducts =
    user?.role === "SUPER_ADMIN" || user?.role === "WHOLESALER" || user?.role === "RETAILER";

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api(siteConfig.api.endpoints.auth.logout, { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch {
      setUser(null);
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface border-b border-subtle backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-amber-primary flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-tight tracking-tight text-foreground group-hover:text-amber-primary transition-colors">
                    {siteConfig.brandName}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider">
                    Commercial Exchange
                  </span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-subtle">
                {siteConfig.nav.main.map((link) => {
                  const isActive =
                    pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                        isActive
                          ? "bg-amber-surface text-amber-primary font-bold border border-subtle"
                          : "text-text-muted hover:text-foreground hover:bg-canvas"
                      }`}
                    >
                      {link.title}
                    </Link>
                  );
                })}

                {/* Admin Panel Link for Super Admins */}
                {isSuperAdmin && (
                  <Link
                    href="/admin"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center gap-1.5 ${
                      pathname.startsWith("/admin")
                        ? "bg-amber-surface text-amber-primary border border-subtle"
                        : "text-text-muted hover:bg-canvas"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-primary" /> Admin Panel
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* Product Listing Form Trigger for Wholesalers, Retailers, and Admins */}
              {canManageProducts && (
                <button
                  onClick={() => setProductModalOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-surface text-amber-primary hover:bg-amber-hover hover:text-white border border-subtle rounded-lg transition-colors"
                  title="List New Catalog Product"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-primary" /> List Product
                </button>
              )}

              {user && (
                <div className="hidden sm:flex items-center gap-2">
                  <RoleBadge role={user.role} size="sm" />
                  {!user.is_verified && (user.role === "RETAILER" || user.role === "WHOLESALER") && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-amber-surface text-amber-primary border border-subtle px-2 py-0.5 rounded-full font-medium">
                      <ShieldAlert className="w-3 h-3" /> Pending Verification
                    </span>
                  )}
                </div>
              )}

              {/* Theme Switcher Toggle */}
              <ThemeToggle />

              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-text-muted hover:text-foreground hover:bg-canvas rounded-lg transition-colors border border-subtle"
                aria-label="Open shopping cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-subtle">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-canvas rounded-lg transition-colors border border-subtle"
                  >
                    <User className="w-4 h-4 text-amber-primary" />
                    <span className="hidden lg:inline font-medium max-w-[120px] truncate">
                      {user.full_name}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="p-2 text-text-muted hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors border border-subtle"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-2 border-l border-subtle">
                  <Link
                    href="/login"
                    className="px-3.5 py-1.5 text-xs font-medium text-text-muted hover:text-foreground hover:bg-canvas rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-3.5 py-1.5 text-xs font-medium bg-amber-primary hover:bg-amber-hover text-white rounded-lg transition-all shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <ProductFormModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
