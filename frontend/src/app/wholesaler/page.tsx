"use client";

import { BulkOrderSheet } from "@/components/wholesaler/BulkOrderSheet";
import { CSVUploader } from "@/components/wholesaler/CSVUploader";
import { VolumeTierCard } from "@/components/wholesaler/VolumeTierCard";
import { Percent } from "lucide-react";

export default function WholesalerPage() {
  return (
    <div className="space-y-10">
      {/* Volume Discount Tiers Overview */}
      <section id="tiers" className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
          <Percent className="w-4 h-4 text-amber-primary" /> Wholesale Volume Discount Brackets
        </h3>
        <VolumeTierCard />
      </section>

      {/* Bulk Order Matrix Table */}
      <section id="pos">
        <BulkOrderSheet />
      </section>

      {/* CSV Upload Purchase Tool */}
      <section id="csv">
        <CSVUploader />
      </section>
    </div>
  );
}
