"use client";

import { useCart } from "@/store/cart-store";
import { useAuth } from "@/store/auth-store";
import { formatCurrency } from "@/lib/utils";
import { X, Trash2, ShoppingCart, AlertTriangle, ArrowRight, Plus, Minus } from "lucide-react";
import Link from "next/link";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const user = useAuth((s) => s.user);
  const { lines, setQty, remove, clear, total, moqViolations } = useCart();

  if (!isOpen) return null;

  const violations = moqViolations();
  const cartTotal = total();
  const checkoutHref = violations.length > 0 ? "#" : user ? "/checkout" : "/login?next=/checkout";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
        <div className="w-screen max-w-md bg-surface border-r border-subtle text-foreground shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-surface text-amber-primary rounded-lg border border-subtle">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Your Cart</h3>
                <p className="text-xs text-text-muted">{lines.length} item line(s)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-foreground hover:bg-canvas rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MOQ Warning Banner if any */}
          {violations.length > 0 && (
            <div className="p-3 bg-amber-surface border-b border-subtle text-amber-primary text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-primary">Minimum Order Quantity (MOQ) Alert</span>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Some items in your cart fall below the wholesale minimum quantity. Adjust item quantities to proceed to checkout.
                </p>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-canvas">
            {lines.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-text-muted">
                <ShoppingCart className="w-12 h-12 stroke-1 mb-3 text-text-muted" />
                <p className="text-sm font-medium text-foreground">Your cart is empty</p>
                <p className="text-xs text-text-muted mt-1 max-w-[220px]">
                  Explore our catalog to add items with role-tailored volume pricing.
                </p>
              </div>
            ) : (
              lines.map((line) => {
                const isViolation = line.qty < line.moq;
                return (
                  <div
                    key={line.productId}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isViolation
                        ? "bg-amber-surface border-amber-primary"
                        : "bg-surface border-subtle"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase bg-canvas text-text-muted px-1.5 py-0.5 rounded border border-subtle">
                          {line.sku}
                        </span>
                        <h4 className="text-sm font-semibold text-foreground mt-1">{line.title}</h4>
                        <div className="text-xs text-amber-primary font-semibold mt-0.5">
                          {formatCurrency(line.price)} / unit
                        </div>
                      </div>
                      <button
                        onClick={() => remove(line.productId)}
                        className="text-text-muted hover:text-rose-600 p-1 rounded hover:bg-canvas transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-subtle">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-text-muted">Qty:</span>
                        <div className="flex items-center bg-canvas border border-subtle rounded-lg">
                          <button
                            onClick={() => setQty(line.productId, line.qty - 1)}
                            className="p-1 text-text-muted hover:text-foreground hover:bg-surface rounded-l-lg"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-foreground min-w-[32px] text-center">
                            {line.qty}
                          </span>
                          <button
                            onClick={() => setQty(line.productId, line.qty + 1)}
                            className="p-1 text-text-muted hover:text-foreground hover:bg-surface rounded-r-lg"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-foreground">
                          {formatCurrency(line.price * line.qty)}
                        </div>
                        {line.moq > 1 && (
                          <div className={`text-[10px] ${isViolation ? "text-amber-primary font-semibold" : "text-text-muted"}`}>
                            MOQ: {line.moq} units
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary */}
          {lines.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-subtle bg-surface space-y-4">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Subtotal</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(cartTotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Tax & Shipping</span>
                <span className="text-text-muted">Calculated at checkout</span>
              </div>

              <div className="border-t border-subtle pt-3 flex items-center justify-between text-base font-bold text-foreground">
                <span>Total</span>
                <span className="text-amber-primary text-lg">{formatCurrency(cartTotal)}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clear}
                  className="px-3 py-2.5 text-xs text-text-muted hover:text-rose-600 border border-subtle rounded-lg hover:bg-canvas"
                >
                  Clear Cart
                </button>
                <Link
                  href={checkoutHref}
                  onClick={(e) => {
                    if (violations.length > 0) {
                      e.preventDefault();
                    } else {
                      onClose();
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-xs transition-all ${
                    violations.length > 0
                      ? "bg-canvas text-text-muted cursor-not-allowed border border-subtle"
                      : "bg-amber-primary hover:bg-amber-hover text-white shadow-sm"
                  }`}
                >
                  <span>{user ? "Proceed to Checkout" : "Sign In to Checkout"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
