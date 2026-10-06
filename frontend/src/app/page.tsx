"use client";

import { ProductGrid } from "@/components/products/ProductGrid";
import { useAuth } from "@/store/auth-store";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { siteConfig } from "@/config/site.config";
import {
  ShieldCheck, ArrowRight, ShieldAlert, Award,
  Truck, Lock, CheckCircle2, Star
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const TRUST_BADGES = [
  { icon: Award, label: "ISO Certified Supplier", desc: "Verified ISO 9001:2025 standard quality control" },
  { icon: Lock, label: "Secure SSL Checkout", desc: "256-bit encrypted card & netbanking payments" },
  { icon: Truck, label: "Fast Dispatch", desc: "Same-day warehouse processing for in-stock inventory" },
  { icon: ShieldCheck, label: "Verified Quality Guarantee", desc: "100% authentic products backed by 1-year warranty" },
];

const TESTIMONIALS = [
  {
    quote: "The volume pricing tiers and Net-30 credit line streamlined our hardware inventory procurement completely. Outstanding delivery speeds.",
    name: "Marcus Vance",
    role: "Procurement Director",
    company: "Apex Tech Distribution",
    rating: 5,
  },
  {
    quote: "As a retail merchant, having transparent trade pricing and low MOQs allowed us to expand our product catalog without locking up excess capital.",
    name: "Elena Rostova",
    role: "Retail Store Owner",
    company: "Metro Boutique Goods",
    rating: 5,
  },
  {
    quote: "Fast dispatch, pristine packaging, and responsive corporate support. The ordering portal is intuitive and reliable.",
    name: "David Chen",
    role: "Verified Business Buyer",
    company: "Pacific Commerce Ltd.",
    rating: 5,
  },
];

function HomeContent() {
  const user = useAuth((s) => s.user);
  const searchParams = useSearchParams();
  const denied = searchParams.get("denied") === "1";

  return (
    <div className="space-y-12">
      {denied && (
        <div className="p-4 rounded-2xl bg-amber-surface border border-subtle text-amber-primary text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-primary shrink-0" />
            <div>
              <span className="font-bold text-foreground">Access Restricted</span>
              <p className="text-xs text-text-muted mt-0.5">
                Your account ({user?.role ?? "Guest"}) requires higher portal permissions to access that section.
              </p>
            </div>
          </div>
          <Link href="/login" className="text-xs font-bold bg-amber-primary hover:bg-amber-hover px-3 py-1.5 rounded-xl border border-subtle text-white transition-colors">
            Sign In / Switch Role
          </Link>
        </div>
      )}

      <section className="relative overflow-hidden rounded-3xl bg-surface border border-subtle p-8 sm:p-12 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-surface border border-subtle text-amber-primary text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-amber-primary" />
            ISO 9001:2025 Certified Commercial Supplier
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
            Quality Goods Delivered Wholesale & Direct to Your Doorstep
          </h1>

          <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-2xl">
            {siteConfig.brandName} is your trusted commercial supply partner. Access authentic electronics, commercial hardware, and consumer goods with verified quality guarantees, volume trade discounts, and express dispatch.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <RoleBadge role={user.role} size="lg" />
                {user.role === "WHOLESALER" && (
                  <Link
                    href="/wholesaler"
                    className="bg-amber-primary hover:bg-amber-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm"
                  >
                    Wholesaler Bulk Portal <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {user.role === "RETAILER" && (
                  <Link
                    href="/retailer"
                    className="bg-amber-primary hover:bg-amber-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm"
                  >
                    Retailer Trade Portal <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {user.role === "SUPER_ADMIN" && (
                  <Link
                    href="/admin"
                    className="bg-amber-primary hover:bg-amber-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm"
                  >
                    Management Dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/register"
                  className="bg-amber-primary hover:bg-amber-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm"
                >
                  Create Partner Account <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold border border-subtle bg-canvas hover:bg-surface text-foreground transition-colors"
                >
                  Sign In to Your Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRUST_BADGES.map((b, i) => {
          const Icon = b.icon;
          return (
            <div key={i} className="p-4 rounded-2xl bg-surface border border-subtle flex items-start gap-3.5 hover:border-amber-primary/40 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-surface border border-subtle text-amber-primary flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">{b.label}</h4>
                <p className="text-[11px] text-text-muted mt-0.5 leading-snug">{b.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-subtle pb-3">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Active Product Catalog</h2>
            <p className="text-xs text-text-muted">
              Prices dynamically adjust based on your commercial account membership status.
            </p>
          </div>
        </div>

        <ProductGrid />
      </section>

      <section className="space-y-6 pt-4 border-t border-subtle">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold text-amber-primary uppercase tracking-widest">
            Commercial Trust & Excellence
          </span>
          <h3 className="text-2xl font-black text-foreground tracking-tight">
            Trusted by Resellers, Wholesalers & Retail Consumers
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-surface border border-subtle flex flex-col justify-between space-y-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-primary">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-primary" />
                  ))}
                </div>
                <p className="text-xs text-text-muted leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-subtle flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">{t.name}</h4>
                  <p className="text-[10px] text-text-muted">{t.role}, <span className="text-foreground">{t.company}</span></p>
                </div>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-surface border border-subtle text-amber-primary px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-text-muted py-10 text-center">Loading Storefront...</div>}>
      <HomeContent />
    </Suspense>
  );
}
