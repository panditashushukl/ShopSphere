"use client";

import { ProductGrid } from "@/components/products/ProductGrid";
import { useAuth } from "@/store/auth-store";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { BRAND_NAME } from "@/lib/config";

function ProductsCatalogContent() {
  const user = useAuth((s) => s.user);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      {/* <div className="bg-surface border border-subtle rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-surface border border-subtle text-amber-primary text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Direct & Commercial Product Catalog
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
            Explore {BRAND_NAME} Catalog
          </h1>
          <p className="text-xs sm:text-sm text-text-muted max-w-xl">
            Browse our full range of authentic products. Add items to your cart anytime. 
            {!user && " Sign in or create an account when you are ready to complete your purchase."}
          </p>
        </div>

        {user ? (
          <div className="bg-canvas border border-subtle rounded-2xl p-4 flex flex-col items-end shrink-0">
            <span className="text-[10px] text-text-muted uppercase font-semibold mb-1">Your Active Rates</span>
            <RoleBadge role={user.role} size="md" />
          </div>
        ) : (
          <div className="bg-canvas border border-subtle rounded-2xl p-4 space-y-2 shrink-0 max-w-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Lock className="w-4 h-4 text-amber-primary" /> Guest Browsing Mode
            </div>
            <p className="text-[11px] text-text-muted">
              Standard retail rates shown. Register for B2B Wholesale or Retailer discounts.
            </p>
            <div className="flex gap-2 pt-1">
              <Link
                href="/login?next=/checkout"
                className="text-[11px] font-bold text-amber-primary hover:underline"
              >
                Sign In
              </Link>
              <span className="text-text-muted">|</span>
              <Link
                href="/register?next=/checkout"
                className="text-[11px] font-bold text-amber-primary hover:underline"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div> */}

      {/* Catalog Grid */}
      <ProductGrid />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-text-muted py-10 text-center">Loading Catalog...</div>}>
      <ProductsCatalogContent />
    </Suspense>
  );
}
