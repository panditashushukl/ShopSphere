"use client";

import { CreditCard, Landmark, ArrowRightLeft, Smartphone } from "lucide-react";

export function PaymentBadges() {
  const methods = [
    { name: "Card", code: "CD" },
    { name: "UPI", code: "UPI" },
    { name: "NetBanking", code: "NB" },
    { name: "Cash On Delivery", code: "COD" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {methods.map((m) => (
        <div
          key={m.name}
          className="px-2.5 py-1 rounded-lg bg-surface border border-subtle flex items-center gap-1.5 shadow-sm text-text-muted hover:text-foreground"
          title={`Accepted Payment Method: ${m.name}`}
        >
          {m.code === "CD" ? (
            <CreditCard className="w-3.5 h-3.5 text-amber-primary" />
          ) : m.code === "UPI" ? (
            <Smartphone className="w-3.5 h-3.5 text-amber-primary" />
          ) : m.code === "COD" ? (
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-primary" />
          ) : (
            <Landmark className="w-3.5 h-3.5 text-amber-primary" />
          )}
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground">
            {m.name}
          </span>
        </div>
      ))}
    </div>
  );
}
