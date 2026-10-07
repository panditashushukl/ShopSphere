"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useAuth } from "@/store/auth-store";
import { useCart } from "@/store/cart-store";
import { formatCurrency, getRolePriceAndMoq } from "@/lib/utils";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { siteConfig } from "@/config/site.config";
import { Package, ShoppingCart, Check, ArrowLeft, Building2, AlertTriangle, Zap } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import type { ProductItem } from "@/components/products/ProductCard";

export default function ProductDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const pid = id;

  const user = useAuth((s) => s.user);
  const addCart = useCart((s) => s.add);

  const { data: product, isLoading, error } = useQuery<ProductItem>({
    queryKey: ["product-detail", pid],
    queryFn: () => api<ProductItem>(siteConfig.api.endpoints.products.detail(pid)),
    enabled: !!pid && typeof window !== "undefined",
  });

  const role = user?.role ?? "GUEST";
  const { price: displayPrice, moq, label: priceLabel } = getRolePriceAndMoq(product, user?.role);

  const [qty, setQty] = useState<number>(moq);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      router.push("/login?next=/checkout");
      return;
    }
    addCart(
      {
        productId: product.id,
        sku: product.sku,
        title: product.title,
        price: displayPrice,
        moq: moq,
      },
      qty
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!user) {
      router.push("/login?next=/checkout");
      return;
    }
    addCart(
      {
        productId: product.id,
        sku: product.sku,
        title: product.title,
        price: displayPrice,
        moq: moq,
      },
      qty
    );

    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-text-muted font-medium">
        Loading product specification details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Product Not Found</h2>
        <p className="text-xs text-text-muted">The product SKU you requested could not be located.</p>
        <Link href="/products" className="inline-flex items-center gap-2 text-xs font-bold text-amber-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const isMoqViolation = role === "WHOLESALER" && qty < moq;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Product Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-surface border border-subtle rounded-3xl p-8 shadow-sm">
        <div className="w-full h-80 sm:h-96 rounded-2xl bg-canvas flex flex-col items-center justify-center p-8 border border-subtle relative overflow-hidden">
          {product.primary_image ? (
            <img
              src={product.primary_image}
              alt={product.title}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <Package className="w-28 h-28 text-text-muted" />
          )}
          <span className="text-xs font-mono font-bold text-text-muted absolute bottom-4 left-4 bg-surface px-3 py-1 rounded-full border border-subtle backdrop-blur-md">
            SKU: {product.sku}
          </span>
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-amber-primary font-semibold">
                Product Specification #{product.id}
              </span>
              <RoleBadge role={user?.role ?? "CUSTOMER"} size="sm" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {product.title}
            </h1>

            <p className="text-xs text-text-muted leading-relaxed">
              {product.description ||
                "High-grade commerce component item crafted for enterprise supply chains and multi-tier distribution networks."}
            </p>

            <div className="flex items-center gap-3">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-500" : "bg-rose-500"
                }`}
              />
              <span className="text-xs font-semibold text-text-muted">
                {product.stock > 0 ? `${product.stock} units currently in stock` : "Out of Stock"}
              </span>
            </div>
          </div>

          <div className="p-5 bg-canvas border border-subtle rounded-2xl space-y-3">
            {role === "SUPER_ADMIN" ? (
              <div className="space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-amber-primary">
                  Super Admin Multi-Tier Pricing Matrix
                </span>
                <div className="grid grid-cols-3 gap-2 text-center border-t border-subtle pt-2">
                  <div className="p-2 bg-surface rounded border border-subtle">
                    <span className="block text-[10px] text-text-muted">Retail</span>
                    <span className="text-xs font-bold text-foreground">{formatCurrency(product.retail_price ?? 0)}</span>
                  </div>
                  <div className="p-2 bg-amber-surface rounded border border-subtle">
                    <span className="block text-[10px] text-text-muted">Trade</span>
                    <span className="text-xs font-bold text-amber-primary">{formatCurrency(product.trade_price ?? 0)}</span>
                  </div>
                  <div className="p-2 bg-amber-surface rounded border border-subtle">
                    <span className="block text-[10px] text-text-muted">Wholesale</span>
                    <span className="text-xs font-bold text-amber-primary">{formatCurrency(product.wholesale_price ?? 0)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-[10px] uppercase font-bold text-text-muted">
                  {priceLabel} ({role === "GUEST" ? "Guest Visitor" : role})
                </span>
                <div className="text-3xl font-black text-foreground mt-0.5">
                  {formatCurrency(displayPrice)}
                  <span className="text-xs font-normal text-text-muted ml-2">/ unit</span>
                </div>
                {moq > 1 && (
                  <div className="text-xs text-amber-primary font-semibold mt-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Minimum Order Quantity (MOQ): {moq} units
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-foreground">Quantity:</label>
              <input
                type="number"
                min={moq}
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 text-center bg-canvas border border-subtle rounded-xl py-2 px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-amber-primary"
              />
            </div>

            {isMoqViolation && (
              <div className="p-2.5 bg-amber-surface border border-subtle rounded-xl text-amber-primary text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-primary shrink-0" />
                <span>Quantity must be at least {moq} for wholesale pricing.</span>
              </div>
            )}

            {user ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || isMoqViolation}
                  className={`py-3.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    added
                      ? "bg-emerald-600 text-white"
                      : product.stock <= 0 || isMoqViolation
                      ? "bg-canvas text-text-muted cursor-not-allowed border border-subtle"
                      : "bg-canvas hover:bg-surface text-foreground border border-subtle"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-white" /> Added {qty} units
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 text-amber-primary" /> Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0 || isMoqViolation}
                  className={`py-3.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    product.stock <= 0 || isMoqViolation
                      ? "bg-canvas text-text-muted cursor-not-allowed border border-subtle"
                      : "bg-amber-primary hover:bg-amber-hover text-white shadow-sm"
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current text-white" />
                  <span>Buy Now & Checkout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0 || isMoqViolation}
                className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  product.stock <= 0 || isMoqViolation
                    ? "bg-canvas text-text-muted cursor-not-allowed border border-subtle"
                    : "bg-amber-primary hover:bg-amber-hover text-white shadow-sm"
                }`}
              >
                <Zap className="w-4 h-4 fill-current text-white" />
                <span>Buy Now</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
