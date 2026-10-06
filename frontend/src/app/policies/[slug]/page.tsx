import Link from "next/link";
import { POLICIES_DATA, PolicyItem } from "@/lib/policies-data";
import { BRAND_NAME } from "@/lib/config";
import { ShieldCheck, ArrowLeft, CheckCircle, FileText } from "lucide-react";

export function generateStaticParams() {
  return Object.keys(POLICIES_DATA).map((slug) => ({
    slug,
  }));
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy: PolicyItem | undefined = POLICIES_DATA[slug];

  if (!policy) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Policy Not Found</h1>
        <p className="text-text-muted text-xs">The requested policy document could not be located.</p>
        <Link href="/" className="bg-amber-primary hover:bg-amber-hover text-white inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Back Link */}
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Storefront
      </Link>

      {/* Policy Card Header */}
      <div className="bg-surface border border-subtle rounded-3xl p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-surface border border-subtle text-amber-primary flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-primary uppercase tracking-wider">
              {policy.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {policy.title}
            </h1>
          </div>
        </div>

        <div className="p-4 bg-amber-surface border border-subtle rounded-2xl text-xs text-amber-primary flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-primary shrink-0" />
          <span>{policy.summary}</span>
        </div>

        {/* Policy Content Sections */}
        <div className="pt-4 space-y-6">
          {policy.sections.map((section, idx) => (
            <div key={idx} className="space-y-2 border-b border-subtle pb-6 last:border-none">
              <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {section.heading}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed pl-6">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-subtle text-xs text-text-muted flex items-center justify-between">
          <span>© 2026 {BRAND_NAME} Private Limited. Legal Compliance Department.</span>
          <span>Last Updated: October 2026</span>
        </div>
      </div>
    </div>
  );
}
