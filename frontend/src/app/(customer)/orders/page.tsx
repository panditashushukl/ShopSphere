"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ShoppingBag, Clock, PackageCheck, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface UserOrder {
  id: number;
  status: string;
  total: number;
  created_at: string;
}

export default function CustomerOrdersPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: rawOrders, isLoading } = useQuery<UserOrder[]>({
    queryKey: ["my-orders"],
    queryFn: () => api<UserOrder[]>("/orders"),
    enabled: typeof window !== "undefined",
  });

  const orders = Array.isArray(rawOrders) ? rawOrders : [];
  const showLoading = !mounted || isLoading;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-primary" /> My Order Status
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Track Your Order.
          </p>
        </div>
      </div>

      {showLoading ? (
        <div className="py-16 text-center text-text-muted flex flex-col items-center">
          <Loader2 className="w-6 h-6 animate-spin text-amber-primary mb-2" />
          <span className="text-xs">Fetching your order history...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 bg-surface border border-subtle rounded-3xl text-center space-y-4 shadow-sm">
          <ShoppingBag className="w-16 h-16 stroke-1 text-text-muted mx-auto" />
          <h2 className="text-lg font-bold text-foreground">No Previous Orders Placed</h2>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            You haven't placed any orders yet under this account.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-amber-primary hover:bg-amber-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="p-5 bg-surface border border-subtle rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-primary/40 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-surface text-amber-primary rounded-xl border border-subtle">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground font-mono">Order #ORD-{o.id}</span>
                    <Badge
                      variant={
                        o.status === "DELIVERED"
                          ? "success"
                          : o.status === "SHIPPED"
                          ? "purple"
                          : o.status === "PROCESSING"
                          ? "default"
                          : o.status === "CANCELLED"
                          ? "destructive"
                          : "warning"
                      }
                    >
                      {o.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-text-muted mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-text-muted" />
                      {new Date(o.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-subtle">
                <div className="text-right">
                  <span className="text-[10px] text-text-muted uppercase font-semibold block">Total Charged</span>
                  <span className="text-base font-black text-foreground">{formatCurrency(o.total)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
