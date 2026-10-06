import { create } from "zustand";
import { persist } from "zustand/middleware";

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
}
export const useCart = create<CartState>()(persist((set, get) => ({
  lines: [],
  add: (l, qty = Math.max(1, l.moq)) => set((s) => {
    const ex = s.lines.find((x) => x.productId === l.productId);
    return { lines: ex ? s.lines.map((x) => x.productId === l.productId ? { ...x, qty: x.qty + qty } : x) : [...s.lines, { ...l, qty }] };
  }),
  setQty: (id, qty) => set((s) => ({ lines: s.lines.map((x) => x.productId === id ? { ...x, qty: Math.max(1, qty) } : x) })),
  remove: (id) => set((s) => ({ lines: s.lines.filter((x) => x.productId !== id) })),
  clear: () => set({ lines: [] }),
  total: () => get().lines.reduce((a, l) => a + l.price * l.qty, 0),
  moqViolations: () => get().lines.filter((l) => l.qty < l.moq), // block checkout while non-empty (moq = 1 for non-wholesalers)
  syncWithProducts: (products) => set((s) => ({
    lines: s.lines.map((line) => {
      const p = products.find((x) => x.id === line.productId);
      if (!p) return line;
      const updatedPrice = p.price ?? p.retail_price ?? line.price;
      const updatedMoq = p.min_order_quantity ?? line.moq ?? 1;
      return { ...line, price: updatedPrice, moq: updatedMoq };
    }),
  })),
}), { name: "cart" }));

