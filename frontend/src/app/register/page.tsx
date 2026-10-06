"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { useAuth } from "@/store/auth-store";
import { UserCheck, Store, Building2, Mail, User, KeyRound, ArrowRight, Loader2, ShieldAlert, ShoppingBag } from "lucide-react";
import Link from "next/link";
import type { Role } from "@/store/auth-store";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const setUser = useAuth((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<Role>("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api<any>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          account_type: accountType,
        }),
      });

      setUser(res);

      if (nextParam) {
        router.push(nextParam);
      } else {
        const targetMap: Record<string, string> = {
          WHOLESALER: "/wholesaler",
          RETAILER: "/retailer",
          CUSTOMER: "/",
        };
        router.push(targetMap[res.role] || "/");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to register account. Please check your information.");
    } finally {
      setLoading(false);
    }
  };

  const loginUrl = nextParam ? `/login?next=${encodeURIComponent(nextParam)}` : "/login";

  return (
    <div className="max-w-xl mx-auto my-10 space-y-8">
      {nextParam && (
        <div className="p-4 bg-amber-surface border border-subtle rounded-2xl text-amber-primary text-xs flex items-center gap-3 shadow-sm">
          <ShoppingBag className="w-5 h-5 text-amber-primary shrink-0" />
          <div>
            <span className="font-bold text-foreground">Register Account to Complete Purchase</span>
            <p className="text-[11px] text-text-muted mt-0.5">
              Items in your cart are saved. Register an account to proceed directly to checkout.
            </p>
          </div>
        </div>
      )}

      <div className="bg-surface border border-subtle rounded-3xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-surface text-amber-primary rounded-2xl flex items-center justify-center mx-auto border border-subtle">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Register B2B / B2C Account</h1>
          <p className="text-xs text-text-muted">
            Choose your business tier to access role-specific pricing and portals.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-amber-surface border border-subtle rounded-xl text-amber-primary text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Tier Selection Cards */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Select Business Account Role</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  role: "CUSTOMER" as Role,
                  title: "Consumer (B2C)",
                  desc: "Retail rates & direct cart checkout",
                  icon: UserCheck,
                },
                {
                  role: "RETAILER" as Role,
                  title: "Retailer (B2B)",
                  desc: "Trade discount pricing & tax invoices",
                  icon: Store,
                },
                {
                  role: "WHOLESALER" as Role,
                  title: "Wholesaler (B2B)",
                  desc: "Bulk rates, MOQs & Net-30 POs",
                  icon: Building2,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = accountType === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setAccountType(item.role)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? "bg-amber-surface border-amber-primary"
                        : "bg-canvas border-subtle text-text-muted hover:border-amber-primary/40"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? "text-amber-primary" : "text-text-muted"}`} />
                    <div className="mt-2">
                      <div className="text-xs font-bold text-foreground">{item.title}</div>
                      <div className="text-[10px] text-text-muted leading-tight mt-0.5">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {(accountType === "RETAILER" || accountType === "WHOLESALER") && (
            <div className="p-3 bg-amber-surface border border-subtle rounded-xl text-amber-primary text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-primary" />
              <span>
                Note: B2B Merchant accounts ({accountType}) require Super Admin approval after registration before placing orders.
              </span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Full Name / Business Title</label>
              <div className="relative">
                <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Acme Enterprises LLC"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-canvas border border-subtle rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-amber-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="merchant@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-canvas border border-subtle rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-amber-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Password (min. 8 chars)</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-canvas border border-subtle rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-amber-primary"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-primary hover:bg-amber-hover text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-text-muted">
          Already have an account?{" "}
          <Link href={loginUrl} className="text-amber-primary hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-text-muted py-10 text-center">Loading Registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
