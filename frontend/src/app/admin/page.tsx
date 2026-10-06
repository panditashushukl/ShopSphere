"use client";

import { useState } from "react";
import { MetricsOverview } from "@/components/admin/MetricsOverview";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { ProductCatalogManager } from "@/components/admin/ProductCatalogManager";
import { OrderManagementTable } from "@/components/admin/OrderManagementTable";
import { useAuth } from "@/store/auth-store";
import Link from "next/link";
import { Users, Package, ShoppingBag, BarChart3, ShieldCheck } from "lucide-react";

export default function AdminOverviewPage() {
  const user = useAuth((s) => s.user);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "products" | "orders">("overview");

  if (!user || user.role !== "SUPER_ADMIN") {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 bg-surface border border-subtle p-8 rounded-3xl shadow-sm">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Super Admin Access Required</h2>
        <p className="text-xs text-text-muted">
          You must be logged in with a Super Admin account to access the platform management panel.
        </p>
        <Link
          href="/login?next=/admin"
          className="inline-block px-5 py-2.5 bg-amber-primary hover:bg-amber-hover text-white font-bold text-xs rounded-xl transition-all shadow-sm"
        >
          Sign In as Super Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-subtle pb-5">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-amber-primary" /> Platform Super Admin Panel
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Centralized platform management: user accounts, catalog inventory, multi-tier pricing, and order fulfillment.
          </p>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex items-center gap-1 bg-canvas p-1.5 rounded-2xl border border-subtle self-start md:self-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-amber-primary text-white shadow-sm"
                : "text-text-muted hover:text-foreground hover:bg-surface"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "users"
                ? "bg-amber-primary text-white shadow-sm"
                : "text-text-muted hover:text-foreground hover:bg-surface"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Users
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "products"
                ? "bg-amber-primary text-white shadow-sm"
                : "text-text-muted hover:text-foreground hover:bg-surface"
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "bg-amber-primary text-white shadow-sm"
                : "text-text-muted hover:text-foreground hover:bg-surface"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Orders
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <div className="space-y-10">
          <MetricsOverview />
          <UserManagementTable />
          <ProductCatalogManager />
          <OrderManagementTable />
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-6">
          <UserManagementTable />
        </div>
      )}

      {activeTab === "products" && (
        <div className="space-y-6">
          <ProductCatalogManager />
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-6">
          <OrderManagementTable />
        </div>
      )}
    </div>
  );
}
