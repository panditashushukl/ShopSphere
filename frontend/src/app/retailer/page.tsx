"use client";

import { ReorderTable } from "@/components/retailer/ReorderTable";
import { InvoiceList } from "@/components/retailer/InvoiceList";
import { RefreshCw, FileText, Tag } from "lucide-react";

export default function RetailerPage() {
  return (
    <div className="space-y-10">
      {/* Quick Trade Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface border border-subtle rounded-2xl p-5 space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-primary flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> Trade Rate Savings
          </span>
          <div className="text-2xl font-black text-foreground">25% OFF Retail</div>
          <p className="text-[11px] text-text-muted">Automatic price adjustments applied sitewide</p>
        </div>

        <div className="bg-surface border border-subtle rounded-2xl p-5 space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-primary flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Fast Stock Replenish
          </span>
          <div className="text-2xl font-black text-foreground">1-Click Reorders</div>
          <p className="text-[11px] text-text-muted">Rapid single-click stock additions to cart</p>
        </div>

        <div className="bg-surface border border-subtle rounded-2xl p-5 space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-primary flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Tax Invoicing
          </span>
          <div className="text-2xl font-black text-foreground">Commercial Ready</div>
          <p className="text-[11px] text-text-muted">Instant PDF/TXT tax invoice generation</p>
        </div>
      </div>

      {/* Section 1: Quick Re-order Pad */}
      <section id="reorder">
        <ReorderTable />
      </section>

      {/* Section 2: Invoices & Monthly Purchase History */}
      <section id="invoices">
        <InvoiceList />
      </section>
    </div>
  );
}
