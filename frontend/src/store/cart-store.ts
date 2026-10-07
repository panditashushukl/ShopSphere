import { create } from "zustand";
import { persist } from "zustand/middleware";
import { siteConfig } from "@/config/site.config";
import { api } from "@/lib/api-client";
import { useAuth } from "./auth-store";

export interface CartLine { productId: number; sku: string; title: string; price: number; qty: number; moq: number }
interface CartState {
  lines: CartLine[];
  add: (l: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  total: () => number;
  moqViolations: () => CartLine[];
  syncWithProducts: (products: { id: number; price?: number; retail_price?: number; min_order_quantity?: number }[]) => void;
  fetchCart: () => Promise<void>;
  syncLocalCartToBackend: () => Promise<void>;
}

export const useCart = create<CartState>()(persist((set, get) => ({
  lines: [],
  add: (l, qty = Math.max(1, l.moq)) => {
    set((s) => {
      const ex = s.lines.find((x) => x.productId === l.productId);
      return { lines: ex ? s.lines.map((x) => x.productId === l.productId ? { ...x, qty: x.qty + qty } : x) : [...s.lines, { ...l, qty }] };
    });
    // Persist to backend DB cart only if user is authenticated
    if (useAuth.getState().user) {
      try {
        api(siteConfig.api.endpoints.cart.add, {
          method: "POST",
          body: JSON.stringify({ product_id: l.productId, quantity: qty }),
        }).catch(() => {});
      } catch (e) {}
    }
  },
  setQty: (id, qty) => set((s) => ({ lines: s.lines.map((x) => x.productId === id ? { ...x, qty: Math.max(1, qty) } : x) })),
  remove: (id) => {
    set((s) => ({ lines: s.lines.filter((x) => x.productId !== id) }));
    if (useAuth.getState().user) {
      try {
        api(`${siteConfig.api.endpoints.cart.get}/${id}`, {
          method: "DELETE",
        }).catch(() => {});
      } catch (e) {}
    }
  },
  clear: () => {
    set({ lines: [] });
    if (useAuth.getState().user) {
      try {
        api(siteConfig.api.endpoints.cart.clear, {
          method: "DELETE",
        }).catch(() => {});
      } catch (e) {}
    }
  },
  total: () => get().lines.reduce((a, l) => a + l.price * l.qty, 0),
  moqViolations: () => get().lines.filter((l) => l.qty < l.moq),
  syncWithProducts: (products) => set((s) => ({
    lines: s.lines.map((line) => {
      const p = products.find((x) => x.id === line.productId);
      if (!p) return line;
      const updatedPrice = p.price ?? p.retail_price ?? line.price;
      const updatedMoq = p.min_order_quantity ?? line.moq ?? 1;
      return { ...line, price: updatedPrice, moq: updatedMoq };
    }),
  })),
  syncLocalCartToBackend: async () => {
    const user = useAuth.getState().user;
    if (!user) return;
    const currentLines = get().lines;
    if (currentLines.length > 0) {
      for (const line of currentLines) {
        try {
          await api(siteConfig.api.endpoints.cart.add, {
            method: "POST",
            body: JSON.stringify({ product_id: line.productId, quantity: line.qty }),
          });
        } catch (e) {}
      }
    }
    await get().fetchCart();
  },
  fetchCart: async () => {
    if (!useAuth.getState().user) return;
    try {
      const data = await api<any[]>(siteConfig.api.endpoints.cart.get);
      if (Array.isArray(data)) {
        const cartLines: CartLine[] = data.map((item: any) => ({
          productId: item.product_id,
          sku: item.sku || "",
          title: item.title || "",
          price: item.price || 0,
          qty: item.quantity,
          moq: item.moq || 1,
        }));
        set({ lines: cartLines });
      }
    } catch (e) {}
  },
}), { name: "cart" }));


