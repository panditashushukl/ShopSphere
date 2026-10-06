"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useCart } from "@/store/cart-store";
import { FileUp, CheckCircle, AlertTriangle, FileSpreadsheet, ArrowRight } from "lucide-react";
import type { ProductItem } from "@/components/products/ProductCard";
import { formatCurrency } from "@/lib/utils";

interface ParsedRow {
  sku: string;
  qty: number;
  product?: ProductItem;
  status: "VALID" | "MOQ_VIOLATION" | "INVALID_SKU";
  message?: string;
}

export function CSVUploader() {
  const addCart = useCart((s) => s.add);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [imported, setImported] = useState(false);

  const { data: products = [] } = useQuery<ProductItem[]>({
    queryKey: ["wholesaler-products-csv"],
    queryFn: () => api<ProductItem[]>("/products"),
    enabled: typeof window !== "undefined",
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImported(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (content: string) => {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const rows: ParsedRow[] = [];

    const startIndex = lines[0].toLowerCase().includes("sku") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(",").map((s) => s.trim());
      if (parts.length < 2) continue;

      const sku = parts[0];
      const qty = parseInt(parts[1]) || 0;

      const matchedProd = products.find((p) => p.sku.toLowerCase() === sku.toLowerCase());

      if (!matchedProd) {
        rows.push({
          sku,
          qty,
          status: "INVALID_SKU",
          message: `SKU '${sku}' not found in catalog`,
        });
      } else {
        const moq = matchedProd.min_order_quantity ?? 50;
        if (qty < moq) {
          rows.push({
            sku,
            qty,
            product: matchedProd,
            status: "MOQ_VIOLATION",
            message: `Qty ${qty} below required MOQ of ${moq}`,
          });
        } else {
          rows.push({
            sku,
            qty,
            product: matchedProd,
            status: "VALID",
          });
        }
      }
    }

    setParsedRows(rows);
  };

  const handleImportToCart = () => {
    const validRows = parsedRows.filter((r) => r.status === "VALID" && r.product);
    validRows.forEach((r) => {
      if (r.product) {
        addCart(
          {
            productId: r.product.id,
            sku: r.product.sku,
            title: r.product.title,
            price: r.product.price ?? r.product.wholesale_price ?? 0,
            moq: r.product.min_order_quantity ?? 50,
          },
          r.qty
        );
      }
    });

    setImported(true);
  };

  const loadSampleCSV = () => {
    const sample = `sku,quantity
SKU-001,60
SKU-002,120
SKU-003,50
SKU-004,10`;
    setFileName("sample_bulk_order.csv");
    parseCSV(sample);
  };

  return (
    <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-subtle pb-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-primary" /> CSV Bulk Purchase Order Upload
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Upload a CSV document containing SKU and Quantity columns for instant cart population.
          </p>
        </div>

        <button
          onClick={loadSampleCSV}
          className="text-xs font-semibold text-amber-primary bg-amber-surface border border-subtle px-3 py-1.5 rounded-lg transition-colors"
        >
          Load Sample Order CSV
        </button>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-subtle hover:border-amber-primary/50 rounded-xl p-6 text-center transition-colors bg-canvas">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          id="csv-file-input"
        />
        <label
          htmlFor="csv-file-input"
          className="cursor-pointer flex flex-col items-center justify-center space-y-2"
        >
          <div className="p-3 bg-amber-surface text-amber-primary rounded-xl border border-subtle">
            <FileUp className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-foreground">
            {fileName ? `Loaded: ${fileName}` : "Click to select CSV purchase file"}
          </span>
          <span className="text-[11px] text-text-muted">
            Expected format: <code className="text-amber-primary font-mono">SKU, Quantity</code>
          </span>
        </label>
      </div>

      {/* Parse Preview Table */}
      {parsedRows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Parsed Order Items ({parsedRows.length})
            </h4>
            <div className="flex gap-2">
              <span className="text-[10px] bg-amber-surface text-amber-primary border border-subtle px-2 py-0.5 rounded font-semibold">
                {parsedRows.filter((r) => r.status === "VALID").length} Valid
              </span>
              <span className="text-[10px] bg-amber-surface text-amber-primary border border-subtle px-2 py-0.5 rounded font-semibold">
                {parsedRows.filter((r) => r.status !== "VALID").length} Warnings
              </span>
            </div>
          </div>

          <div className="border border-subtle rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-text-muted">
              <thead className="bg-canvas text-text-muted uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">SKU</th>
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {parsedRows.map((r, i) => (
                  <tr key={i} className="hover:bg-canvas">
                    <td className="py-2.5 px-4 font-mono font-medium text-text-muted">{r.sku}</td>
                    <td className="py-2.5 px-4 font-semibold text-foreground">
                      {r.product?.title ?? "Unknown Product"}
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold text-foreground">{r.qty}</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-amber-primary">
                      {r.product
                        ? formatCurrency(r.product.price ?? r.product.wholesale_price ?? 0)
                        : "-"}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {r.status === "VALID" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-primary font-semibold bg-amber-surface px-2 py-0.5 rounded border border-subtle">
                          <CheckCircle className="w-3 h-3" /> Valid Line
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-primary font-semibold bg-amber-surface px-2 py-0.5 rounded border border-subtle">
                          <AlertTriangle className="w-3 h-3" /> {r.message}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImportToCart}
            disabled={imported || parsedRows.filter((r) => r.status === "VALID").length === 0}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              imported
                ? "bg-emerald-600 text-white"
                : "bg-amber-primary hover:bg-amber-hover text-white shadow-sm"
            }`}
          >
            {imported ? (
              <>
                <CheckCircle className="w-4 h-4" /> Valid CSV Lines Imported to Cart!
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" /> Import Valid CSV Lines to Cart
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
