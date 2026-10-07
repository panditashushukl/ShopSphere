"use client";

import { useState } from "react";
import { useCart } from "@/store/cart-store";
import { useAuth } from "@/store/auth-store";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { CreditCard, FileText, CheckCircle2, ShieldCheck, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { RoleBadge } from "@/components/ui/RoleBadge";

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const { lines, clear, total } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "NET30">("CARD");
  const [address, setAddress] = useState("100 Corporate Blvd, Suite 400, San Francisco, CA 94105");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<any>(null);

  const cartTotal = total();
  const isB2B = user?.role === "WHOLESALER" || user?.role === "RETAILER";

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const itemsPayload = lines.map((l) => ({
        product_id: l.productId,
        quantity: l.qty,
      }));

      const res = await api<any>("/orders", {
        method: "POST",
        body: JSON.stringify({ items: itemsPayload }),
      });

      setOrderResult(res);
      clear();
    } catch (err: any) {
      setError(err.message || "Failed to submit order. Please verify stock levels or account status.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderResult) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-surface border border-subtle rounded-3xl p-8 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 bg-amber-surface text-amber-primary rounded-full flex items-center justify-center mx-auto border border-subtle">
          <CheckCircle2 className="w-8 h-8 text-amber-primary" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase bg-amber-surface text-amber-primary px-3 py-1 rounded-full border border-subtle font-bold">
            Order Confirmed #ORD-{orderResult.id}
          </span>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Thank You for Your Order!</h1>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Your order has been recorded in our system with status{" "}
            <span className="text-amber-primary font-bold">{orderResult.status}</span>. Total charged:{" "}
            <span className="text-foreground font-bold">{formatCurrency(orderResult.total)}</span>.
          </p>
        </div>

        <div className="p-4 bg-canvas rounded-2xl border border-subtle text-xs text-text-muted space-y-2 text-left">
          <div className="flex justify-between">
            <span className="text-text-muted">Order Reference:</span>
            <span className="font-mono text-foreground font-bold">#ORD-{orderResult.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Channel Type:</span>
            <span className="font-bold text-amber-primary">{orderResult.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Server Final Total:</span>
            <span className="font-bold text-amber-primary">{formatCurrency(orderResult.total)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/orders"
            className="bg-amber-primary hover:bg-amber-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm"
          >
            View My Orders <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/products"
            className="px-5 py-2.5 rounded-xl text-xs font-bold border border-subtle bg-canvas hover:bg-surface text-foreground transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-subtle pb-4">
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-amber-primary" /> Commercial Checkout & Order Verification
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          Server-side price verification and payment selection.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-amber-surface border border-subtle rounded-2xl text-amber-primary text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-primary shrink-0" />
          <div>
            <span className="font-bold text-foreground">Order Placement Error</span>
            <p className="text-xs text-amber-primary mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {lines.length === 0 ? (
        <div className="py-16 text-center text-text-muted space-y-3">
          <p className="text-sm">Your cart is empty. Add items before checking out.</p>
          <Link href="/products" className="text-xs text-amber-primary hover:underline font-bold">
            &larr; Return to Catalog
          </Link>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Tier Info */}
            <div className="p-4 bg-surface border border-subtle rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] text-text-muted uppercase font-semibold">LUser Name</span>
                <div className="text-sm font-bold text-foreground mt-0.5">{user?.full_name || user?.email}</div>
              </div>
              <RoleBadge role={user?.role} size="sm" />
            </div>

            {/* Shipping Address */}
            <div className="bg-surface border border-subtle rounded-2xl p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-foreground">Delivery Address</h3>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-canvas border border-subtle rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-primary"
              />
            </div>

            {/* Payment Method */}
            <div className="bg-surface border border-subtle rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-foreground">Select Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    paymentMethod === "CARD"
                      ? "bg-amber-surface border-amber-primary"
                      : "bg-canvas border-subtle hover:border-amber-primary/40"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-amber-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-foreground">Cash On Delivery</div>
                    <div className="text-[10px] text-text-muted mt-0.5">Pay when you receive your order</div>
                  </div>
                </button>

                {isB2B && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("NET30")}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      paymentMethod === "NET30"
                        ? "bg-amber-surface border-amber-primary"
                        : "bg-canvas border-subtle hover:border-amber-primary/40"
                    }`}
                  >
                    <FileText className="w-5 h-5 text-amber-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-foreground">Net-30 Invoice PO</div>
                      <div className="text-[10px] text-text-muted mt-0.5">Commercial 30-day credit invoice</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Checkout Review Sidebar */}
          <div className="bg-surface border border-subtle rounded-3xl p-6 h-fit space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-foreground border-b border-subtle pb-3">
              Items Summary ({lines.length})
            </h3>

            <div className="space-y-3 max-h-48 overflow-y-auto text-xs pr-1">
              {lines.map((l) => (
                <div key={l.productId} className="flex justify-between text-text-muted">
                  <span className="truncate max-w-[150px] font-medium text-foreground">
                    {l.title} <span className="text-text-muted">x{l.qty}</span>
                  </span>
                  <span className="font-bold text-foreground">{formatCurrency(l.price * l.qty)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-subtle pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-text-muted">
                <span>Calculated Subtotal</span>
                <span className="font-bold text-foreground">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-foreground border-t border-subtle pt-2">
                <span>Grand Total</span>
                <span className="text-amber-primary">{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-primary hover:bg-amber-hover text-white py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Submit & Place Order <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
