"use client";

import Link from "next/link";
import { useAuth } from "@/store/auth-store";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Home, Lock } from "lucide-react";

export default function ForbiddenPage() {
  const user = useAuth((s) => s.user);

  const homePath = user
    ? user.role === "SUPER_ADMIN"
      ? "/admin"
      : user.role === "WHOLESALER"
      ? "/wholesaler"
      : user.role === "RETAILER"
      ? "/retailer"
      : "/"
    : "/login";

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-amber-surface text-amber-primary rounded-3xl flex items-center justify-center border border-subtle mb-6 shadow-sm">
        <Lock className="w-10 h-10" />
      </div>

      <span className="text-xs font-bold text-amber-primary uppercase tracking-widest bg-amber-surface px-3 py-1 rounded-full border border-subtle mb-3">
        Account Authorization Required
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
        Portal Access Restricted
      </h1>

      <p className="text-xs sm:text-sm text-text-muted mt-3 max-w-md leading-relaxed">
        This portal section is reserved for specific commercial account membership tiers. Please verify your logged-in account permissions or switch to your assigned portal dashboard.
      </p>

      {user && (
        <div className="mt-6 p-4 rounded-xl bg-surface border border-subtle text-xs text-text-muted flex items-center gap-3">
          <span className="text-text-muted">Current Account Role:</span>
          <RoleBadge role={user.role} size="sm" />
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href={homePath}
          className="bg-amber-primary hover:bg-amber-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm"
        >
          <Home className="w-4 h-4" /> Go to Your Portal Dashboard
        </Link>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl text-xs font-bold border border-subtle bg-canvas hover:bg-surface text-foreground transition-colors"
        >
          Return to Storefront
        </Link>
      </div>
    </div>
  );
}
