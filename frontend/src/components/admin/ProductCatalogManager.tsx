"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Package, Edit2, Plus } from "lucide-react";
import type { ProductItem } from "@/types";
import { ProductFormModal } from "@/components/products/ProductFormModal";

export function ProductCatalogManager() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  const { data: rawProducts, isLoading } = useQuery<ProductItem[]>({
    queryKey: ["admin-products"],
    queryFn: () => api<ProductItem[]>("/products"),
    enabled: typeof window !== "undefined",
  });

  const products: ProductItem[] = Array.isArray(rawProducts) ? rawProducts : [];

  const handleEdit = (product: ProductItem) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  return (
    <>
      <div className="bg-surface border border-subtle rounded-2xl overflow-hidden shadow-sm space-y-0">
        <div className="p-5 border-b border-subtle flex items-center justify-between bg-canvas">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-primary" /> Sitewide Product Catalog & Multi-Tier Pricing Manager
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              View stock levels, retail pricing, trade reselling prices, wholesale rates, and minimum order quantities.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateNew}
              className="px-3 py-1.5 text-xs font-bold bg-amber-primary hover:bg-amber-hover text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
            <span className="text-xs font-semibold bg-amber-surface text-amber-primary border border-subtle px-2.5 py-1 rounded-full">
              {products.length} Catalog SKUs
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-muted">
            <thead className="bg-canvas text-text-muted font-semibold uppercase text-[10px] border-b border-subtle">
              <tr>
                <th className="py-3.5 px-5">SKU</th>
                <th className="py-3.5 px-5">Title</th>
                <th className="py-3.5 px-5 text-center">In Stock</th>
                <th className="py-3.5 px-5 text-right">Retail Rate (B2C)</th>
                <th className="py-3.5 px-5 text-right">Trade Rate (Retailer)</th>
                <th className="py-3.5 px-5 text-right">Wholesale Rate (Bulk)</th>
                <th className="py-3.5 px-5 text-center">Required MOQ</th>
                <th className="py-3.5 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-text-muted">
                    Loading catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-text-muted">
                    No products in catalog.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-canvas transition-colors">
                    <td className="py-3.5 px-5 font-mono text-text-muted font-medium">{p.sku}</td>
                    <td className="py-3.5 px-5 font-bold text-foreground">{p.title}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.stock > 10
                            ? "bg-amber-surface text-amber-primary"
                            : p.stock > 0
                            ? "bg-amber-surface text-amber-primary"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-foreground">
                      {formatCurrency(p.retail_price ?? p.price ?? 0)}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-amber-primary">
                      {formatCurrency(p.trade_price ?? 0)}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-amber-primary">
                      {formatCurrency(p.wholesale_price ?? 0)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="px-2 py-0.5 rounded bg-canvas text-foreground font-mono font-bold border border-subtle">
                        {p.min_order_quantity ?? 1} units
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-1.5 text-text-muted hover:text-amber-primary hover:bg-canvas rounded-lg transition-colors border border-subtle"
                        title="Edit Product Details & Rates"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        productToEdit={selectedProduct}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });
          queryClient.invalidateQueries({ queryKey: ["products"] });
        }}
      />
    </>
  );
}
