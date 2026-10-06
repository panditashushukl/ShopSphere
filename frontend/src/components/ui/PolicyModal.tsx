"use client";

import { X, ShieldCheck, FileText, CheckCircle } from "lucide-react";
import { POLICIES_DATA, PolicyItem } from "@/lib/policies-data";
import { BRAND_NAME } from "@/lib/config";

interface PolicyModalProps {
  policyId: string | null;
  onClose: () => void;
}

export function PolicyModal({ policyId, onClose }: PolicyModalProps) {
  if (!policyId) return null;

  const policy: PolicyItem | undefined = POLICIES_DATA[policyId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-surface border border-subtle rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-subtle flex items-start justify-between bg-canvas">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-surface border border-subtle text-amber-primary flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-primary uppercase tracking-wider">
                {policy?.category || "Corporate Policy"}
              </span>
              <h3 className="text-xl font-black text-foreground tracking-tight">
                {policy?.title || "Policy Information"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-foreground hover:bg-surface rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-text-muted text-sm leading-relaxed">
          {policy ? (
            <>
              <div className="p-4 bg-amber-surface border border-subtle rounded-2xl text-xs text-amber-primary flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-primary shrink-0" />
                <span>{policy.summary}</span>
              </div>

              {policy.sections.map((section, idx) => (
                <div key={idx} className="space-y-2 border-b border-subtle pb-4 last:border-none">
                  <h4 className="font-bold text-foreground text-base flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {section.heading}
                  </h4>
                  <p className="text-xs text-text-muted leading-relaxed pl-6">
                    {section.body}
                  </p>
                </div>
              ))}
            </>
          ) : (
            <p className="text-text-muted">Policy details not found.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-subtle bg-canvas flex items-center justify-between text-xs text-text-muted">
          <span>{BRAND_NAME} Compliance & Governance</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-primary hover:bg-amber-hover text-white font-bold rounded-xl transition-colors"
          >
            Close Policy
          </button>
        </div>
      </div>
    </div>
  );
}
