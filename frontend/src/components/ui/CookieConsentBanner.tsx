"use client";

import { useState, useEffect } from "react";
import { Cookie, Shield, Check, X, SlidersHorizontal } from "lucide-react";
import { BRAND_NAME } from "@/lib/config";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("shopsphere_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(
      "shopsphere_cookie_consent",
      JSON.stringify({ essential: true, analytics: true, marketing: true, timestamp: new Date().toISOString() })
    );
    setVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem(
      "shopsphere_cookie_consent",
      JSON.stringify({ essential: true, analytics: false, marketing: false, timestamp: new Date().toISOString() })
    );
    setVisible(false);
  };

  const saveCustomPreferences = () => {
    localStorage.setItem(
      "shopsphere_cookie_consent",
      JSON.stringify({ essential: true, analytics, marketing, timestamp: new Date().toISOString() })
    );
    setShowPreferences(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Banner */}
      <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-50 bg-surface border border-subtle rounded-3xl p-5 shadow-xl space-y-4 animate-slideUp">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-surface border border-subtle text-amber-primary flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-amber-primary" />
          </div>
          <div className="space-y-1 pr-4">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-primary" /> Privacy & Cookie Safeguards
            </h4>
            <p className="text-[11px] text-text-muted leading-relaxed">
              {BRAND_NAME} uses essential cookies to secure your shopping session, process transactions, and analyze store traffic in accordance with GDPR and DPDP privacy regulations.
            </p>
          </div>
          <button
            onClick={acceptEssential}
            className="text-text-muted hover:text-foreground p-1 rounded-lg transition-colors shrink-0"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={acceptEssential}
            className="flex-1 px-3.5 py-2 bg-canvas hover:bg-surface text-foreground border border-subtle text-xs font-bold rounded-xl transition-all text-center"
          >
            Accept Essential
          </button>
          <button
            onClick={acceptAll}
            className="flex-1 px-3.5 py-2 bg-amber-primary hover:bg-amber-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm text-center"
          >
            Accept All
          </button>
          <button
            onClick={() => setShowPreferences(true)}
            className="px-3 py-2 bg-canvas hover:bg-surface border border-subtle text-text-muted hover:text-foreground text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Manage Preferences</span>
          </button>
        </div>
      </div>

      {/* Preferences Modal Drawer */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-subtle rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-subtle pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Cookie className="w-4 h-4 text-amber-primary" /> Cookie Preferences
              </h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-text-muted hover:text-foreground p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-canvas border border-subtle rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground block">Strictly Essential Cookies</span>
                  <span className="text-[10px] text-text-muted">Required for authentication, security, and cart functionality.</span>
                </div>
                <span className="text-[10px] font-bold text-amber-primary bg-amber-surface border border-subtle px-2 py-0.5 rounded-full">
                  Always Active
                </span>
              </div>

              <div className="p-3 bg-canvas border border-subtle rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground block">Performance & Analytics</span>
                  <span className="text-[10px] text-text-muted">Helps us measure site traffic and optimize user experience.</span>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-primary bg-canvas border-subtle cursor-pointer"
                />
              </div>

              <div className="p-3 bg-canvas border border-subtle rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground block">Personalized Experience</span>
                  <span className="text-[10px] text-text-muted">Tailored product recommendations and catalog updates.</span>
                </div>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-primary bg-canvas border-subtle cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-subtle">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 bg-canvas text-text-muted text-xs font-semibold rounded-xl hover:bg-surface border border-subtle"
              >
                Cancel
              </button>
              <button
                onClick={saveCustomPreferences}
                className="px-4 py-2 bg-amber-primary text-white text-xs font-bold rounded-xl hover:bg-amber-hover flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
