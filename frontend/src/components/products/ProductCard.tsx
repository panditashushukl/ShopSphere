"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-store";
import { useCart } from "@/store/cart-store";
import { formatCurrency, getRolePriceAndMoq } from "@/lib/utils";
import { ShoppingCart, Check, Package, Tag, Zap } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import type { ProductItem } from "@/types";
export type { ProductItem };

export function ProductCard({ product }: { product: ProductItem }) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const addCart = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  const role = user?.role ?? "GUEST";
  const { price: displayPrice, moq, label: priceLabel } = getRolePriceAndMoq(product, user?.role);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      Math.max(1, moq)
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      Math.max(1, moq)
    );

    router.push("/checkout");
  };

  return (
    <div className="group relative bg-surface border border-subtle hover:border-amber-primary/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-mono uppercase bg-canvas text-text-muted px-2 py-0.5 rounded border border-subtle">
            {product.sku}
          </span>

          {role === "WHOLESALER" && moq > 1 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-surface text-amber-primary border border-subtle px-2 py-0.5 rounded-full">
              MOQ: {moq} units
            </span>
          )}

          {role === "RETAILER" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-surface text-amber-primary border border-subtle px-2 py-0.5 rounded-full">
              <Tag className="w-3 h-3" /> Trade Rate
            </span>
          )}
        </div>

        {/* Thumbnail Image Visual */}
        <Link href={`/products/${product.id}`} className="block">
          <div className="w-full h-44 rounded-xl bg-canvas flex items-center justify-center p-6 border border-subtle group-hover:border-subtle transition-colors relative overflow-hidden">
            {product.primary_image ? (
              <img
                src={product.primary_image}
                alt={product.title}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Package className="w-28 h-28 text-text-muted" />
            )}
            <div className="absolute inset-0 bg-surface/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 backdrop-blur-xs">
              <span className="text-xs text-amber-primary font-medium">View specifications &rarr;</span>
            </div>
          </div>
        </Link>

        {/* Title & Stock */}
        <div className="mt-4">
          <Link href={`/products/${product.id}`}>
            <h3 className="text-base font-bold text-foreground group-hover:text-amber-primary transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-500" : "bg-rose-500"
                }`}
            />
            <span className="text-xs text-text-muted">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Add to Cart Action */}
      <div className="mt-6 pt-4 border-t border-subtle">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="text-lg font-black text-foreground">
              {formatCurrency(displayPrice)}
            </div>
            <span className="text-[10px] text-text-muted font-medium">
              {priceLabel}
            </span>
          </div>
        </div>

        {user ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${added
                  ? "bg-emerald-600 text-white"
                  : product.stock <= 0
                    ? "bg-canvas text-text-muted cursor-not-allowed border border-subtle"
                    : "bg-canvas hover:bg-surface text-foreground border border-subtle"
                }`}
              title="Add to Cart"
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" /> Added
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-primary" /> + Cart
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${product.stock <= 0
                  ? "bg-canvas text-text-muted cursor-not-allowed border border-subtle"
                  : "bg-amber-primary hover:bg-amber-hover text-white shadow-sm active:scale-95"
                }`}
              title="Buy Now & Checkout"
            >
              <Zap className="w-3.5 h-3.5 fill-current" /> Buy Now
            </button>
          </div>
        ) : (
          <button
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 ${product.stock <= 0
                ? "bg-canvas text-text-muted cursor-not-allowed border border-subtle"
                : "bg-amber-primary hover:bg-amber-hover text-white shadow-sm active:scale-95"
              }`}
            title="Sign In to Purchase"
          >
            <Zap className="w-4 h-4 fill-current" /> Buy Now
          </button>
        )}
      </div>
    </div>
  );
}
