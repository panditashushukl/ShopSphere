import type { ReactNode } from "react";
import { RoleBadge } from "@/components/ui/RoleBadge";

export const instant = false;

export default function RetailerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="bg-surface border border-subtle rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <RoleBadge role="RETAILER" size="sm" />
            <span className="text-xs font-mono text-amber-primary font-semibold">Merchant Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Retailer Reseller Hub & Trade Catalog
          </h1>
          <p className="text-xs text-text-muted max-w-xl">
            Access exclusive B2B trade discount pricing, rapid single-click re-order pads, stock level alerts, and commercial tax invoices.
          </p>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
