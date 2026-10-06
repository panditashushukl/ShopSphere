"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/store/cart-store";
import { useState } from "react";
import { ShoppingCart, Check, RefreshCw } from "lucide-react";
import type { ProductItem } from "@/components/products/ProductCard";

export function ReorderTable() {
  const addCart = useCart((s) => s.add);
  const [qtyMap, setQtyMap] = useState<Record<number, number>>({});
  const [addedMap, setAddedMap] = useState<Record<number, boolean>>({});

  const { data: products = [], isLoading } = useQuery<ProductItem[]>({
    queryKey: ["retailer-products"],
    queryFn: () => api<ProductItem[]>("/products"),
    enabled: typeof window !== "undefined",
  });

  const handleQtyChange = (id: number, val: string) => {
    const num = Math.max(1, parseInt(val) || 1);
    setQtyMap((prev) => ({ ...prev, [id]: num }));
  };

  const handleAddToCart = (p: ProductItem) => {
    const qty = qtyMap[p.id] ?? 1;
    addCart(
      {
        productId: p.id,
        sku: p.sku,
        title: p.title,
        price: p.price ?? p.trade_price ?? 0,
        moq: p.min_order_quantity ?? 1,
      },
      qty
    );

    setAddedMap((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [p.id]: false }));
    }, 1500);
  };

  return (
    <div className="bg-surface border border-subtle rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-subtle flex items-center justify-between bg-canvas">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-primary" /> Quick Trade Re-order Pad
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Rapid single-click stock replenishments at wholesale trade rates.
          </p>
        </div>
        <span className="text-xs font-semibold bg-amber-surface text-amber-primary border border-subtle px-2.5 py-1 rounded-full">
          Trade Rate Tier Active
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-text-muted">
          <thead className="bg-canvas text-text-muted font-semibold uppercase text-[10px] border-b border-subtle">
            <tr>
              <th className="py-3.5 px-5">SKU</th>
              <th className="py-3.5 px-5">Product Title</th>
              <th className="py-3.5 px-5 text-right">Trade Unit Price</th>
              <th className="py-3.5 px-5 text-center">In Stock</th>
              <th className="py-3.5 px-5 text-center">Order Qty</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-subtle">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-text-muted">
                  Loading trade catalog...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-text-muted">
                  No trade items found.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const qty = qtyMap[p.id] ?? 1;
                const isAdded = addedMap[p.id];
                const price = p.price ?? p.trade_price ?? 0;

                return (
                  <tr key={p.id} className="hover:bg-canvas transition-colors">
                    <td className="py-3.5 px-5 font-mono text-text-muted font-medium">{p.sku}</td>
                    <td className="py-3.5 px-5 font-semibold text-foreground">{p.title}</td>
                    <td className="py-3.5 px-5 text-right font-bold text-amber-primary">
                      {formatCurrency(price)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.stock > 10
                            ? "bg-amber-surface text-amber-primary"
                            : p.stock > 0
                            ? "bg-amber-surface text-amber-primary"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <input
                        type="number"
                        min={1}
                        max={p.stock}
                        value={qty}
                        onChange={(e) => handleQtyChange(p.id, e.target.value)}
                        className="w-16 text-center bg-canvas border border-subtle rounded-lg py-1 px-2 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-amber-primary"
                      />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={p.stock <= 0}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                          isAdded
                            ? "bg-emerald-600 text-white"
                            : p.stock <= 0
                            ? "bg-canvas text-text-muted cursor-not-allowed border border-subtle"
                            : "bg-amber-primary hover:bg-amber-hover text-white shadow-sm"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Added
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
