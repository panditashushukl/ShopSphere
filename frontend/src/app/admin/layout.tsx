"use client";

import type { ReactNode } from "react";
import { TrendingUp, Users, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleBadge } from "@/components/ui/RoleBadge";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const TABS = [
    { label: "Overview Metrics", href: "/admin", icon: TrendingUp },
    { label: "User Management & Approvals", href: "/admin/users", icon: Users },
    { label: "Product Catalog & Rates", href: "/admin/products", icon: Package },
    { label: "Order Fulfillment", href: "/admin/orders", icon: ShoppingBag },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="bg-surface border border-subtle rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <RoleBadge role="SUPER_ADMIN" size="sm" />
            <span className="text-xs font-mono text-amber-primary font-semibold">Control Tower</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Super Admin Control Tower & Governance
          </h1>
          <p className="text-xs text-text-muted max-w-xl">
            Sitewide financial metrics split by B2C vs Retailer vs Wholesaler revenue, user account verification, multi-tier pricing manager, and order status transitions.
          </p>
        </div>
      </div>

      {/* Admin Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-subtle pb-3 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? "bg-amber-surface text-amber-primary border border-subtle shadow-sm"
                  : "text-text-muted hover:text-foreground hover:bg-surface border border-transparent"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div>{children}</div>
    </div>
  );
}
