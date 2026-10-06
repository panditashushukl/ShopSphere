"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ProductCard, type ProductItem } from "./ProductCard";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Loader2, PackageX } from "lucide-react";
import { useAuth } from "@/store/auth-store";
import { useCart } from "@/store/cart-store";
import { RoleBadge } from "@/components/ui/RoleBadge";

export function ProductGrid() {
  const user = useAuth((s) => s.user);
  const syncWithProducts = useCart((s) => s.syncWithProducts);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "stock" | "id">("title");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, error } = useQuery<ProductItem[]>({
    queryKey: ["products", search, sortBy, user?.role],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      params.set("sort", sortBy);
      const res = await api<any>(`/products?${params.toString()}`);
      if (res && typeof res === "object" && "data" in res && Array.isArray(res.data)) {
        return res.data;
      }
      return Array.isArray(res) ? res : [];
    },
    enabled: typeof window !== "undefined",
  });

  const products: ProductItem[] = Array.isArray(data) ? data : [];

  useEffect(() => {
    if (products.length > 0) {
      syncWithProducts(products);
    }
  }, [products, syncWithProducts]);

  const showLoading = !mounted || isLoading;

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="bg-surface p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-subtle shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-canvas border border-subtle rounded-xl pl-10 pr-4 py-2 text-xs text-foreground placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-amber-primary"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <SlidersHorizontal className="w-3.5 h-3.5 text-text-muted" />
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-canvas border border-subtle rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-primary"
            >
              <option value="title">Product Name</option>
              <option value="stock">Stock Level</option>
              <option value="id">Relevance</option>
            </select>
          </div>

          {user && (
            <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-subtle">
              <span className="text-[11px] text-text-muted">Viewing Rates:</span>
              <RoleBadge role={user.role} size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Grid Display */}
      {showLoading ? (
        <div className="h-64 flex flex-col items-center justify-center text-text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-amber-primary mb-2" />
          <span className="text-xs font-medium">Fetching catalog items...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-amber-surface border border-subtle rounded-2xl text-amber-primary text-xs text-center">
          Failed to load product catalog. Make sure backend service is running.
        </div>
      ) : products.length === 0 ? (
        <div className="h-64 bg-surface border border-subtle rounded-2xl flex flex-col items-center justify-center text-center p-6 text-text-muted">
          <PackageX className="w-12 h-12 stroke-1 text-text-muted mb-2" />
          <h4 className="text-sm font-semibold text-foreground">No products found</h4>
          <p className="text-xs text-text-muted mt-1">
            Try adjusting your search query or clear the filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
