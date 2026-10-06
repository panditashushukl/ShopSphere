"use client";

import { useCart } from "@/store/cart-store";
import { useAuth } from "@/store/auth-store";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Trash2, ArrowRight, AlertTriangle, Plus, Minus, Lock } from "lucide-react";
import Link from "next/link";

export default function CustomerCartPage() {
  const user = useAuth((s) => s.user);
  const { lines, setQty, remove, clear, total, moqViolations } = useCart();
  const violations = moqViolations();
  const cartTotal = total();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-primary" /> Shopping Cart & Order Summary
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Review your selected line items, quantities, and volume tier validation.
          </p>
        </div>

        {lines.length > 0 && (
          <button
            onClick={clear}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            Clear Entire Cart
          </button>
        )}
      </div>

      {!user && lines.length > 0 && (
        <div className="p-4 bg-amber-surface border border-subtle rounded-2xl text-amber-primary text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-primary shrink-0" />
            <div>
              <span className="font-bold text-foreground">Cart Saved (Sign In Required for Purchase)</span>
              <p className="text-[11px] text-text-muted mt-0.5">
                Your line items remain preserved. Sign in or register to complete your order.
              </p>
            </div>
          </div>
          <Link
            href="/login?next=/checkout"
            className="text-xs font-bold bg-amber-primary hover:bg-amber-hover text-white px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
          >
            Sign In Now
          </Link>
        </div>
      )}

      {violations.length > 0 && (
        <div className="p-4 bg-amber-surface border border-subtle rounded-2xl text-amber-primary text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-primary">MOQ Violations Detected</span>
            <p className="text-xs text-text-muted mt-0.5">
              One or more line items fall below the required minimum order quantity. Update quantities to proceed to checkout.
            </p>
          </div>
        </div>
      )}

      {lines.length === 0 ? (
        <div className="py-20 bg-surface border border-subtle rounded-3xl text-center space-y-4 shadow-sm">
          <ShoppingBag className="w-16 h-16 stroke-1 text-text-muted mx-auto" />
          <h2 className="text-lg font-bold text-foreground">Your Cart is Currently Empty</h2>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Browse our catalog items to add products with role-tailored volume pricing.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-amber-primary hover:bg-amber-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm"
          >
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Lines */}
          <div className="lg:col-span-2 space-y-4">
            {lines.map((l) => {
              const isViolation = l.qty < l.moq;
              return (
                <div
                  key={l.productId}
                  className={`p-5 rounded-2xl border transition-all ${
                    isViolation
                      ? "bg-amber-surface border-amber-primary"
                      : "bg-surface border-subtle"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase bg-canvas text-text-muted px-2 py-0.5 rounded border border-subtle">
                        {l.sku}
                      </span>
                      <h3 className="text-base font-bold text-foreground mt-1">{l.title}</h3>
                      <div className="text-xs font-semibold text-amber-primary mt-0.5">
                        {formatCurrency(l.price)} / unit
                      </div>
                    </div>
                    <button
                      onClick={() => remove(l.productId)}
                      className="text-text-muted hover:text-rose-600 p-1.5 rounded-lg hover:bg-canvas transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-subtle">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">Qty:</span>
                      <div className="flex items-center bg-canvas border border-subtle rounded-xl">
                        <button
                          onClick={() => setQty(l.productId, l.qty - 1)}
                          className="p-1.5 text-text-muted hover:text-foreground hover:bg-surface rounded-l-xl"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-foreground min-w-[36px] text-center">
                          {l.qty}
                        </span>
                        <button
                          onClick={() => setQty(l.productId, l.qty + 1)}
                          className="p-1.5 text-text-muted hover:text-foreground hover:bg-surface rounded-r-xl"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-foreground">
                        {formatCurrency(l.price * l.qty)}
                      </div>
                      {l.moq > 1 && (
                        <div className={`text-[10px] ${isViolation ? "text-amber-primary font-bold" : "text-text-muted"}`}>
                          Required MOQ: {l.moq} units
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Box */}
          <div className="bg-surface border border-subtle rounded-3xl p-6 h-fit space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-foreground border-b border-subtle pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-text-muted">
                <span>Subtotal</span>
                <span className="text-foreground font-bold">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Estimated Shipping</span>
                <span className="text-amber-primary font-semibold">FREE (Commercial Delivery)</span>
              </div>
              <div className="border-t border-subtle pt-3 flex justify-between text-base font-black text-foreground">
                <span>Total Amount</span>
                <span className="text-amber-primary">{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            <Link
              href={violations.length > 0 ? "#" : user ? "/checkout" : "/login?next=/checkout"}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                violations.length > 0
                  ? "bg-canvas text-text-muted cursor-not-allowed border border-subtle"
                  : "bg-amber-primary hover:bg-amber-hover text-white shadow-sm"
              }`}
            >
              {user ? "Proceed to Checkout" : "Sign In to Checkout & Buy"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
