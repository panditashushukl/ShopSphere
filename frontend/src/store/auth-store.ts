import { create } from "zustand";
export type Role = "SUPER_ADMIN" | "WHOLESALER" | "RETAILER" | "CUSTOMER";
export interface SessionUser { id: number; email: string; full_name: string; role: Role; is_verified: boolean }

// Display state only. Authorization is enforced by middleware.ts and FastAPI, never by this store.
export const useAuth = create<{ user: SessionUser | null; setUser: (u: SessionUser | null) => void }>((set) => ({
  user: null, setUser: (user) => set({ user }),
}));
