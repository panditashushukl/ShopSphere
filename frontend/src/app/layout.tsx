import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { ChatOverlay } from "@/components/agent/chat-overlay";
import { CookieConsentBanner } from "@/components/ui/CookieConsentBanner";
import { siteConfig } from "@/config/site.config";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.brandName} | Commercial Procurement & Multi-Tier Distribution`,
    template: `%s | ${siteConfig.brandName}`,
  },
  description: siteConfig.company.mission,
  keywords: [
    "Wholesale Procurement",
    "B2B Distribution",
    "Commercial Catalog",
    "Inventory Ledger",
    "SS Agent",
    "Trade Pricing",
  ],
  authors: [{ name: siteConfig.company.legalName }],
  creator: siteConfig.company.legalName,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: `${siteConfig.brandName} | Commercial Procurement & Multi-Tier Distribution`,
    description: siteConfig.company.mission,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.company.legalName,
    url: siteConfig.url,
    logo: siteConfig.ogImage,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.company.helpline,
      contactType: "customer service",
      email: siteConfig.company.supportEmail,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.company.street,
      addressLocality: siteConfig.company.city,
      addressRegion: siteConfig.company.state,
      postalCode: siteConfig.company.postalCode,
      addressCountry: siteConfig.company.country,
    },
  };

  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col bg-canvas text-foreground antialiased`}>
        <Providers>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
          <ChatOverlay />
          <CookieConsentBanner />
        </Providers>
      </body>
    </html>
  );
}
