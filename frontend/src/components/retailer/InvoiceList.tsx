"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface OrderRecord {
  id: number;
  status: string;
  total: number;
  created_at: string;
}

export function InvoiceList() {
  const { data: orders = [], isLoading } = useQuery<OrderRecord[]>({
    queryKey: ["retailer-invoices"],
    queryFn: () => api<OrderRecord[]>("/orders"),
    enabled: typeof window !== "undefined",
  });

  const handleDownloadTaxInvoice = (orderId: number) => {
    const invoiceContent = `=====================================================
            COMMERCIAL TAX INVOICE
=====================================================
Invoice No: INV-2026-${orderId}
Order Reference: ORD-${orderId}
Date: ${new Date().toLocaleDateString()}
B2B Tier: RETAILER TRADE DISCOUNT
VAT / Tax ID: TAX-992182741

Itemized Total: ${formatCurrency(orders.find((o) => o.id === orderId)?.total ?? 0)}
Payment Terms: Commercial Trade Account

Thank you for your business!
=====================================================`;

    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_ORD_${orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-surface border border-subtle rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-subtle pb-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-primary" /> Commercial Tax Invoices
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Download tax invoices and monthly purchase order records.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-text-muted">Loading tax invoices...</div>
      ) : orders.length === 0 ? (
        <div className="py-8 text-center text-xs text-text-muted">
          No commercial invoices found. Place orders to generate tax invoices.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="p-4 bg-canvas border border-subtle rounded-xl flex items-center justify-between gap-4 hover:border-subtle transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-surface text-amber-primary rounded-xl border border-subtle">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">Invoice #INV-2026-{o.id}</span>
                    <Badge variant={o.status === "DELIVERED" ? "success" : "warning"}>
                      {o.status}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-text-muted mt-1 flex items-center gap-3">
                    <span>Order #{o.id}</span>
                    <span>•</span>
                    <span>{new Date(o.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-bold text-foreground">{formatCurrency(o.total)}</div>
                  <span className="text-[10px] text-amber-primary font-medium">Trade Tax Invoice</span>
                </div>
                <button
                  onClick={() => handleDownloadTaxInvoice(o.id)}
                  className="p-2 bg-surface hover:bg-canvas text-foreground rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-subtle"
                  title="Download Commercial Tax Invoice"
                >
                  <Download className="w-4 h-4 text-amber-primary" />
                  <span className="hidden sm:inline">Tax Invoice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
