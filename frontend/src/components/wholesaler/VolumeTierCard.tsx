"use client";

import { Percent, Check } from "lucide-react";

export function VolumeTierCard() {
  const TIERS = [
    { name: "Tier 1: Starter Wholesale", minQty: "50 - 150 units", discount: "35% OFF Retail", moq: "50 per SKU" },
    { name: "Tier 2: Regional Merchant", minQty: "151 - 500 units", discount: "45% OFF Retail", moq: "100 per SKU" },
    { name: "Tier 3: Enterprise Distributor", minQty: "500+ units", discount: "55% OFF Retail", moq: "250 per SKU" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {TIERS.map((tier, idx) => (
        <div
          key={idx}
          className="bg-surface border border-subtle hover:border-amber-primary/40 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase bg-amber-surface text-amber-primary px-2 py-0.5 rounded border border-subtle">
                Volume Rate
              </span>
              <Percent className="w-4 h-4 text-amber-primary" />
            </div>
            <h4 className="text-sm font-bold text-foreground mt-3">{tier.name}</h4>
            <div className="text-xl font-black text-amber-primary mt-1">{tier.discount}</div>
            <p className="text-xs text-text-muted mt-1">Volume Bracket: {tier.minQty}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-subtle text-xs text-text-muted space-y-1.5">
            <div className="flex items-center gap-1.5 text-foreground">
              <Check className="w-3.5 h-3.5 text-amber-primary" />
              <span>MOQ Requirement: {tier.moq}</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground">
              <Check className="w-3.5 h-3.5 text-amber-primary" />
              <span>Eligible for Net-30 Invoicing</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
