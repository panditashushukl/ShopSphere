"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { useAuth } from "@/store/auth-store";
import { useCart } from "@/store/cart-store";
import { siteConfig } from "@/config/site.config";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Shield, Lock, Mail, ArrowRight, Loader2, KeyRound, ShoppingBag } from "lucide-react";
import Link from "next/link";

const TEST_ACCOUNTS = [
  { label: "Super Admin", email: "admin@shopsphere.com", role: "SUPER_ADMIN" as const, desc: "Platform Operations & Analytics" },
  { label: "Wholesaler", email: "wholesaler@shopsphere.com", role: "WHOLESALER" as const, desc: "Bulk Catalog & Wholesale Accounts" },
  { label: "Retailer", email: "retailer@shopsphere.com", role: "RETAILER" as const, desc: "Trade Reselling & Expedited Orders" },
  { label: "Customer", email: "customer@shopsphere.com", role: "CUSTOMER" as const, desc: "Direct B2C Catalog & Checkout" },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");

  const setUser = useAuth((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api<any>(siteConfig.api.endpoints.auth.login, {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      setUser(res);
      await useCart.getState().syncLocalCartToBackend();

      if (nextParam) {
        router.push(nextParam);
      } else {
        const destMap: Record<string, string> = {
          SUPER_ADMIN: "/admin",
          WHOLESALER: "/wholesaler",
          RETAILER: "/retailer",
          CUSTOMER: "/",
        };
        router.push(destMap[res.role] || "/");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const registerUrl = nextParam ? `/register?next=${encodeURIComponent(nextParam)}` : "/register";

  return (
    <div className="max-w-md mx-auto my-12 space-y-8">
      {nextParam && (
        <div className="p-4 bg-amber-surface border border-subtle rounded-2xl text-amber-primary text-xs flex items-center gap-3 shadow-sm">
          <ShoppingBag className="w-5 h-5 text-amber-primary shrink-0" />
          <div>
            <span className="font-bold text-foreground">Sign In Required to Complete Purchase</span>
            <p className="text-[11px] text-text-muted mt-0.5">
              Items in your cart are saved. Sign in or register to complete your order.
            </p>
          </div>
        </div>
      )}

      <div className="bg-surface border border-subtle rounded-3xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-surface text-amber-primary rounded-2xl flex items-center justify-center mx-auto border border-subtle">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Sign In to Your Account</h1>
          <p className="text-xs text-text-muted">
            Select a commercial role account below or enter your credentials.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-amber-surface border border-subtle rounded-xl text-amber-primary text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="user@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-canvas border border-subtle rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-amber-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-canvas border border-subtle rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-amber-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-primary hover:bg-amber-hover text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-text-muted">
          Need a B2B Merchant or Customer account?{" "}
          <Link href={registerUrl} className="text-amber-primary hover:underline font-semibold">
            Register Account
          </Link>
        </div>
      </div>

      <div className="bg-surface border border-subtle rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-subtle pb-3">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-primary" /> Commercial Account Presets
          </h3>
          <span className="text-[10px] text-text-muted font-mono">Default: Passw0rd!</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {TEST_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              onClick={() => {
                setEmail(acc.email);
                setPassword("Passw0rd!");
                performLogin(acc.email, "Passw0rd!");
              }}
              className="w-full p-3 bg-canvas hover:bg-surface border border-subtle hover:border-amber-primary rounded-xl text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <RoleBadge role={acc.role} size="sm" showIcon={true} />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground group-hover:text-amber-primary transition-colors">
                    {acc.email}
                  </div>
                  <div className="text-[10px] text-text-muted truncate">{acc.desc}</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-amber-primary transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-text-muted py-10 text-center">Loading Sign In...</div>}>
      <LoginContent />
    </Suspense>
  );
}
