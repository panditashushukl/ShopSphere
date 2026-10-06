"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/store/cart-store";
import { useState } from "react";
import { ShoppingCart, Check, AlertTriangle, Building2 } from "lucide-react";
import type { ProductItem } from "@/components/products/ProductCard";

export function BulkOrderSheet() {
  const addCart = useCart((s) => s.add);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [addedAll, setAddedAll] = useState(false);

  const { data: products = [], isLoading } = useQuery<ProductItem[]>({
    queryKey: ["wholesaler-products"],
    queryFn: () => api<ProductItem[]>("/products"),
    enabled: typeof window !== "undefined",
  });

  const getQty = (p: ProductItem) => quantities[p.id] ?? Math.max(1, p.min_order_quantity ?? 50);

  const handleQtyChange = (p: ProductItem, val: string) => {
    const num = parseInt(val) || 0;
    setQuantities((prev) => ({ ...prev, [p.id]: num }));
  };

  const handleAddLineToCart = (p: ProductItem) => {
    const qty = getQty(p);
    addCart(
      {
        productId: p.id,
        sku: p.sku,
        title: p.title,
        price: p.price ?? p.wholesale_price ?? 0,
        moq: p.min_order_quantity ?? 50,
      },
      qty
    );
  };

  const handleBulkAddAll = () => {
    products.forEach((p) => {
      const qty = getQty(p);
      if (qty >= (p.min_order_quantity ?? 1)) {
        addCart(
          {
            productId: p.id,
            sku: p.sku,
            title: p.title,
            price: p.price ?? p.wholesale_price ?? 0,
            moq: p.min_order_quantity ?? 50,
          },
          qty
        );
      }
    });
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2000);
  };

  return (
    <div className="bg-surface border border-subtle rounded-2xl overflow-hidden shadow-sm space-y-0">
      <div className="p-5 border-b border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-canvas">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-primary" /> Tiered Wholesale Order Sheet
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Automated minimum order quantity (MOQ) validation & volume tier pricing.
          </p>
        </div>

        <button
          onClick={handleBulkAddAll}
          disabled={isLoading || products.length === 0}
          className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            addedAll
              ? "bg-emerald-600 text-white"
              : "bg-amber-primary hover:bg-amber-hover text-white shadow-sm"
          }`}
        >
          {addedAll ? (
            <>
              <Check className="w-4 h-4" /> Added All Valid Lines
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" /> Add All Valid Lines to Cart
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-text-muted">
          <thead className="bg-canvas text-text-muted font-semibold uppercase text-[10px] border-b border-subtle">
            <tr>
              <th className="py-3.5 px-5">SKU</th>
              <th className="py-3.5 px-5">Product Title</th>
              <th className="py-3.5 px-5 text-center">Required MOQ</th>
              <th className="py-3.5 px-5 text-right">Wholesale Rate</th>
              <th className="py-3.5 px-5 text-center">Order Quantity</th>
              <th className="py-3.5 px-5 text-right">Line Total</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-subtle">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-text-muted">
                  Loading wholesale catalog...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-text-muted">
                  No wholesale items available.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const qty = getQty(p);
                const moq = p.min_order_quantity ?? 50;
                const price = p.price ?? p.wholesale_price ?? 0;
                const isViolation = qty < moq;
                const lineTotal = price * qty;

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-canvas transition-colors ${
                      isViolation ? "bg-amber-surface" : ""
                    }`}
                  >
                    <td className="py-3.5 px-5 font-mono text-text-muted font-medium">{p.sku}</td>
                    <td className="py-3.5 px-5 font-semibold text-foreground">
                      {p.title}
                      {isViolation && (
                        <span className="block text-[10px] text-amber-primary font-normal mt-0.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Quantity must be at least {moq} units
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="px-2 py-0.5 rounded bg-amber-surface text-amber-primary border border-subtle font-bold">
                        {moq} units
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-amber-primary">
                      {formatCurrency(price)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <input
                        type="number"
                        step={10}
                        min={0}
                        value={qty}
                        onChange={(e) => handleQtyChange(p, e.target.value)}
                        className={`w-24 text-center bg-canvas border rounded-lg py-1.5 px-2 text-xs font-bold text-foreground focus:outline-none ${
                          isViolation
                            ? "border-amber-primary text-amber-primary focus:ring-1 focus:ring-amber-primary"
                            : "border-subtle focus:ring-1 focus:ring-amber-primary"
                        }`}
                      />
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-foreground">
                      {formatCurrency(lineTotal)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleAddLineToCart(p)}
                        disabled={isViolation}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                          isViolation
                            ? "bg-canvas text-text-muted cursor-not-allowed border border-subtle"
                            : "bg-amber-primary hover:bg-amber-hover text-white shadow-sm"
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Add
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
