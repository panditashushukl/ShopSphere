"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, Store, Building2, UserCheck, TrendingUp } from "lucide-react";

interface MetricsResponse {
  [orderType: string]: {
    revenue: number;
    orders: number;
  };
}

export function MetricsOverview() {
  const { data: metrics = {}, isLoading } = useQuery<MetricsResponse>({
    queryKey: ["admin-metrics"],
    queryFn: () => api<MetricsResponse>("/admin/metrics"),
    enabled: typeof window !== "undefined",
  });

  const b2c = metrics.B2C ?? { revenue: 0, orders: 0 };
  const retailer = metrics.RETAILER ?? { revenue: 0, orders: 0 };
  const wholesaler = metrics.WHOLESALER ?? { revenue: 0, orders: 0 };

  const grandTotalRevenue = (b2c.revenue || 0) + (retailer.revenue || 0) + (wholesaler.revenue || 0);
  const grandTotalOrders = (b2c.orders || 0) + (retailer.orders || 0) + (wholesaler.orders || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-primary" /> Platform Revenue & Order Split Metrics
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Real-time financial performance breakdown across B2C Consumers, B2B Retailers, and Bulk Wholesalers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sitewide Revenue */}
        <div className="bg-surface border border-subtle rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Total Sitewide Sales
            </span>
            <div className="p-2 bg-amber-surface text-amber-primary rounded-xl border border-subtle">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-foreground">
              {isLoading ? "..." : formatCurrency(grandTotalRevenue)}
            </div>
            <span className="text-[11px] text-amber-primary font-medium mt-0.5 block">
              {grandTotalOrders} processed orders
            </span>
          </div>
        </div>

        {/* B2C Direct Consumer */}
        <div className="bg-surface border border-subtle rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-primary">
              B2C Retail Revenue
            </span>
            <div className="p-2 bg-amber-surface text-amber-primary rounded-xl border border-subtle">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-foreground">
              {isLoading ? "..." : formatCurrency(b2c.revenue)}
            </div>
            <span className="text-[11px] text-text-muted mt-0.5 block">
              {b2c.orders} B2C customer order(s)
            </span>
          </div>
        </div>

        {/* B2B Retailer Reseller */}
        <div className="bg-surface border border-subtle rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-primary">
              B2B Trade Reselling
            </span>
            <div className="p-2 bg-amber-surface text-amber-primary rounded-xl border border-subtle">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-foreground">
              {isLoading ? "..." : formatCurrency(retailer.revenue)}
            </div>
            <span className="text-[11px] text-text-muted mt-0.5 block">
              {retailer.orders} Retailer trade order(s)
            </span>
          </div>
        </div>

        {/* B2B Wholesaler Bulk */}
        <div className="bg-surface border border-subtle rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-primary">
              B2B Wholesale Bulk
            </span>
            <div className="p-2 bg-amber-surface text-amber-primary rounded-xl border border-subtle">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-foreground">
              {isLoading ? "..." : formatCurrency(wholesaler.revenue)}
            </div>
            <span className="text-[11px] text-text-muted mt-0.5 block">
              {wholesaler.orders} Bulk PO order(s)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
