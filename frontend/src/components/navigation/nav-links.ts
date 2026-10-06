import type { Role } from "@/store/auth-store";
export const NAV: Record<Role | "GUEST", { label: string; href: string }[]> = {
  GUEST: [{ label: "Products", href: "/products" }, { label: "AI Agent", href: "/agent" }, { label: "Login", href: "/login" }],
  CUSTOMER: [{ label: "Categories", href: "/products" }, { label: "AI Agent", href: "/agent" }, { label: "Cart", href: "/cart" }, { label: "My Orders", href: "/orders" }],
  RETAILER: [{ label: "Trade Catalog", href: "/products" }, { label: "AI Agent", href: "/agent" }, { label: "Reorder Pad", href: "/retailer#reorder" }, { label: "Retailer Hub", href: "/retailer" }],
  WHOLESALER: [{ label: "Bulk Catalog", href: "/products" }, { label: "AI Agent", href: "/agent" }, { label: "Volume Tiers", href: "/wholesaler#tiers" }, { label: "Wholesaler Portal", href: "/wholesaler" }],
  SUPER_ADMIN: [{ label: "Admin Control Tower", href: "/admin" }, { label: "AI Agent", href: "/agent" }],
};

