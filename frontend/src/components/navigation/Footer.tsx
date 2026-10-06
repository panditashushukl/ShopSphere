"use client";

import React, { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { MapPin, Mail, Phone, Send, Check, Layers, ExternalLink } from "lucide-react";
import { PaymentBadges } from "@/components/ui/PaymentBadges";
import { PolicyModal } from "@/components/ui/PolicyModal";

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [activePolicyId, setActivePolicyId] = useState<string | null>(null);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail("");
    }, 3000);
  };

  return (
    <>
      <footer className="border-t border-subtle bg-surface text-text-muted mt-20 pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-subtle">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-primary flex items-center justify-center text-white shadow-sm">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-lg leading-tight tracking-tight text-foreground">
                    {siteConfig.brandName}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-amber-primary tracking-wider">
                    Commercial Enterprise
                  </span>
                </div>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                {siteConfig.company.mission}
              </p>

              <div className="space-y-2 pt-1 text-xs text-foreground">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-primary shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-snug">{siteConfig.company.address}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-amber-primary shrink-0" />
                  <a href={`mailto:${siteConfig.company.supportEmail}`} className="text-[11px] hover:text-amber-primary transition-colors">
                    {siteConfig.company.supportEmail}
                  </a>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-primary shrink-0" />
                  <div className="text-[11px]">
                    <span className="font-semibold text-foreground">{siteConfig.company.helpline}</span>
                    <span className="text-[10px] text-text-muted block">{siteConfig.company.helplineHours}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-foreground border-b border-subtle pb-2">
                Customer Care & Policies
              </h5>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button
                    onClick={() => setActivePolicyId("return-policy")}
                    className="hover:text-amber-primary transition-colors text-left flex items-center gap-1.5"
                  >
                    Return & Refund Policy
                    <span className="text-[10px] text-text-muted">(30-Day Window)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicyId("shipping-policy")}
                    className="hover:text-amber-primary transition-colors text-left flex items-center gap-1.5"
                  >
                    Shipping & Delivery Policy
                    <span className="text-[10px] text-text-muted">(Freight Transit)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicyId("cancellation-policy")}
                    className="hover:text-amber-primary transition-colors text-left"
                  >
                    Cancellation Policy & Warranty Claims
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicyId("faqs")}
                    className="hover:text-amber-primary transition-colors text-left"
                  >
                    Help Center / FAQs
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-foreground border-b border-subtle pb-2">
                Legal & Compliance
              </h5>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button
                    onClick={() => setActivePolicyId("privacy-policy")}
                    className="hover:text-amber-primary transition-colors text-left flex items-center gap-1.5"
                  >
                    Privacy Policy
                    <span className="text-[10px] text-text-muted">(GDPR & DPDP)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicyId("terms-and-conditions")}
                    className="hover:text-amber-primary transition-colors text-left"
                  >
                    Terms & Conditions / Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicyId("wholesale-agreement")}
                    className="hover:text-amber-primary transition-colors text-left flex items-center gap-1.5"
                  >
                    B2B Wholesale Trading Agreement
                    <span className="text-[10px] text-text-muted">(MOQ Terms)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicyId("security-notice")}
                    className="hover:text-amber-primary transition-colors text-left"
                  >
                    Security & Anti-Fraud Notice
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-foreground border-b border-subtle pb-2">
                Business Solutions & Programs
              </h5>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link
                    href="/register"
                    className="hover:text-amber-primary transition-colors text-left flex items-center gap-1.5"
                  >
                    Apply for Wholesaler Account
                    <ExternalLink className="w-3 h-3 text-amber-primary" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-amber-primary transition-colors text-left flex items-center gap-1.5"
                  >
                    Partner as a Retail Merchant
                    <ExternalLink className="w-3 h-3 text-amber-primary" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/agent"
                    className="hover:text-amber-primary transition-colors text-left flex items-center gap-1.5"
                  >
                    SS Agent
                    <ExternalLink className="w-3 h-3 text-amber-primary" />
                  </Link>
                </li>
              </ul>

              <div className="pt-2">
                <span className="text-xs font-bold text-foreground block mb-1.5">
                  Subscribe to Trade Insights
                </span>
                {newsletterSubscribed ? (
                  <div className="p-2.5 bg-amber-surface border border-subtle rounded-xl text-amber-primary text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-primary shrink-0" />
                    <span>Subscribed! Check your inbox for updates.</span>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="email"
                        required
                        placeholder="procurement@company.com"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="w-full bg-canvas border border-subtle rounded-xl px-3 py-2 text-xs text-foreground placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-amber-primary"
                      />
                      <button
                        type="submit"
                        className="p-2 bg-amber-primary hover:bg-amber-hover text-white rounded-xl transition-colors shrink-0"
                        title="Subscribe"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-text-muted leading-tight">
                      Subscribe for exclusive trade discounts & catalog updates. Zero spam guarantee. Unsubscribe anytime.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-text-muted">
              © 2026 {siteConfig.company.name}. All rights reserved.
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="text-[11px] font-semibold text-text-muted">Accepted Commercial Payments:</span>
              <PaymentBadges />
            </div>
          </div>
        </div>
      </footer>

      <PolicyModal
        policyId={activePolicyId}
        onClose={() => setActivePolicyId(null)}
      />
    </>
  );
}
