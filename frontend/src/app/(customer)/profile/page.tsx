"use client";

import { useAuth } from "@/store/auth-store";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { User, Mail, Shield, CheckCircle2, ShieldAlert, KeyRound, Building2 } from "lucide-react";

export default function CustomerProfilePage() {
  const user = useAuth((s) => s.user);

  if (!user) {
    return (
      <div className="py-20 text-center text-text-muted text-xs font-medium">
        Loading session details...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="border-b border-subtle pb-4">
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-amber-primary" /> Account Profile & B2B Verification Status
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          View your session credentials, active security role tier, and merchant verification status.
        </p>
      </div>

      {!user.is_verified && (user.role === "RETAILER" || user.role === "WHOLESALER") && (
        <div className="p-4 bg-amber-surface border border-subtle rounded-2xl text-foreground text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-primary">Account Pending Admin Approval</span>
            <p className="text-xs text-text-muted mt-0.5">
              Your account has registered as a {user.role} tier. An administrator must approve your verification before wholesale or trade purchase orders can be placed.
            </p>
          </div>
        </div>
      )}

      <div className="bg-surface border border-subtle rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-4 border-b border-subtle pb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-primary flex items-center justify-center text-white text-xl font-black shadow-sm">
            {user.full_name?.substring(0, 2).toUpperCase() || "US"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{user.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <RoleBadge role={user.role} size="sm" />
              {user.is_verified ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Verified Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-primary font-semibold bg-amber-surface px-2 py-0.5 rounded-full border border-subtle">
                  <ShieldAlert className="w-3 h-3 text-amber-primary" /> Unverified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 bg-canvas rounded-xl border border-subtle flex items-center justify-between">
            <span className="text-text-muted flex items-center gap-2">
              <Mail className="w-4 h-4 text-text-muted" /> Account Email:
            </span>
            <span className="font-bold text-foreground">{user.email}</span>
          </div>

          <div className="p-4 bg-canvas rounded-xl border border-subtle flex items-center justify-between">
            <span className="text-text-muted flex items-center gap-2">
              <Shield className="w-4 h-4 text-text-muted" /> System Account ID:
            </span>
            <span className="font-mono font-bold text-foreground">#{user.id}</span>
          </div>

          <div className="p-4 bg-canvas rounded-xl border border-subtle flex items-center justify-between">
            <span className="text-text-muted flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-text-muted" /> Security Role Hierarchy:
            </span>
            <span className="font-bold text-amber-primary">{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
