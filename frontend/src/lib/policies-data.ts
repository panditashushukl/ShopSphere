export interface PolicyItem {
  id: string;
  title: string;
  category: "Customer Care & Policies" | "Legal & Compliance" | "Business Solutions & Programs";
  summary: string;
  sections: { heading: string; body: string }[];
}

export const POLICIES_DATA: Record<string, PolicyItem> = {
  "return-policy": {
    id: "return-policy",
    title: "Return & Refund Policy",
    category: "Customer Care & Policies",
    summary: "Comprehensive guidelines regarding standard 30-day retail returns and B2B wholesale restocking criteria.",
    sections: [
      {
        heading: "1. 30-Day Retail Return Window",
        body: "Retail Customer orders qualify for a full refund or exchange within 30 days of delivery. Items must be returned in original, unused condition with all original tags, packaging, and protective seals intact."
      },
      {
        heading: "2. Bulk Wholesale Restocking Criteria",
        body: "Wholesale and trade orders are subject to a standard 15% restocking fee upon return authorization. Returns must be requested within 14 business days of invoice receipt. Sealed master cartons must remain unopened unless defect is verified upon unboxing."
      },
      {
        heading: "3. Inspection & Refund Processing",
        body: "Upon receipt at our central distribution hub, returned merchandise undergoes quality inspection within 3-5 business days. Approved refunds are credited directly to the original payment method or issued as store credit for commercial accounts."
      }
    ]
  },
  "shipping-policy": {
    id: "shipping-policy",
    title: "Shipping & Delivery Policy",
    category: "Customer Care & Policies",
    summary: "Timelines and freight handling protocols for standard, express air, and palletized commercial orders.",
    sections: [
      {
        heading: "1. Standard & Express Transit Timelines",
        body: "Standard parcel shipping delivers within 3 to 5 business days nationwide. Express air dispatch is available for urgent orders with guaranteed 1-2 business day delivery."
      },
      {
        heading: "2. Palletized Freight & Liftgate Options",
        body: "Bulk wholesale orders exceeding 250 kg are shipped via insured palletized freight transit (5-7 business days). Commercial buyers can select dock delivery or scheduled liftgate offloading at checkout."
      },
      {
        heading: "3. Real-Time Tracking & Order Insurance",
        body: "Every shipment includes real-time GPS tracking link updates sent via email/SMS. All commercial freight shipments are 100% insured against loss or damage during transit."
      }
    ]
  },
  "cancellation-policy": {
    id: "cancellation-policy",
    title: "Cancellation Policy & Warranty Claims",
    category: "Customer Care & Policies",
    summary: "Order cancellation timelines, pre-dispatch refunds, and 1-Year manufacturer warranty procedure.",
    sections: [
      {
        heading: "1. Pre-Dispatch Order Cancellation",
        body: "Orders can be cancelled free of charge prior to warehouse packing and dispatch confirmation. Once dispatched, standard return protocols apply."
      },
      {
        heading: "2. 1-Year Limited Manufacturer Warranty",
        body: "All hardware and electronic products purchased through our verified catalog come with a 1-year limited warranty against manufacturing defects."
      },
      {
        heading: "3. Submitting a Warranty Claim",
        body: "To initiate a warranty claim, submit photo/video evidence along with your tax invoice through our support desk. Claims are processed and replacement units shipped within 48 hours."
      }
    ]
  },
  "faqs": {
    id: "faqs",
    title: "Help Center / Frequently Asked Questions",
    category: "Customer Care & Policies",
    summary: "Answers to common inquiries regarding account verification, MOQs, Net-30 credit terms, and order management.",
    sections: [
      {
        heading: "Q: How do I qualify for Wholesaler or Retailer pricing?",
        body: "Registered businesses can submit their business identification and tax documents. Upon verification by our compliance team (typically within 12 hours), tier discounts and MOQ terms activate automatically."
      },
      {
        heading: "Q: What is Minimum Order Quantity (MOQ)?",
        body: "MOQ represents the minimum number of units required to qualify for wholesale tier pricing. MOQs are strictly enforced at cart checkout for B2B accounts."
      },
      {
        heading: "Q: How does Net-30 Invoicing work?",
        body: "Verified wholesale partners with approved credit line status can select Net-30 payment at checkout. Invoices are due 30 days post-dispatch and can be settled via ACH, wire, or corporate check."
      }
    ]
  },
  "privacy-policy": {
    id: "privacy-policy",
    title: "Privacy Policy",
    category: "Legal & Compliance",
    summary: "Our commitment to data protection, 256-bit SSL encryption, GDPR compliance, and cookie safeguards.",
    sections: [
      {
        heading: "1. Data Protection & Encryption",
        body: "We implement 256-bit AES SSL encryption across all digital communications and checkout transactions. Sensitive credentials and payment authorizations are processed through PCI-DSS Level 1 compliant gateways."
      },
      {
        heading: "2. Compliance with GDPR & DPDP Standards",
        body: "We adhere strictly to global data protection frameworks including GDPR and DPDP. User data is never sold, rented, or commercialized to external third parties."
      },
      {
        heading: "3. Cookie Preferences & Consent Controls",
        body: "Users maintain total control over cookie preferences. Essential cookies required for session security and shopping cart functions are enabled by default, while analytical cookies require explicit consent."
      }
    ]
  },
  "terms-and-conditions": {
    id: "terms-and-conditions",
    title: "Terms & Conditions / Terms of Service",
    category: "Legal & Compliance",
    summary: "Legally binding terms governing platform access, commercial purchasing, intellectual property, and account liability.",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        body: "By accessing or purchasing through this platform, you agree to be bound by these Terms of Service and all incorporated commercial policies."
      },
      {
        heading: "2. Pricing & Catalog Accuracy",
        body: "Prices and stock availability are updated continuously. We reserve the right to correct typographical errors or adjust tiered pricing prior to order dispatch confirmation."
      },
      {
        heading: "3. Account Responsibility",
        body: "Account holders are responsible for maintaining credentials confidentiality. Commercial account holders are responsible for authorized purchases executed by team members."
      }
    ]
  },
  "wholesale-agreement": {
    id: "wholesale-agreement",
    title: "B2B Wholesale Trading Agreement & MOQ Terms",
    category: "Legal & Compliance",
    summary: "Terms governing trade reseller accounts, bulk price tiers, volume commitments, and Net-30 credit lines.",
    sections: [
      {
        heading: "1. Commercial Resale & Compliance",
        body: "Products purchased under Wholesale or Trade accounts are intended for authorized commercial resale, industrial use, or corporate procurement."
      },
      {
        heading: "2. Minimum Order Quantities (MOQ)",
        body: "Wholesale pricing is conditional upon meeting per-SKU Minimum Order Quantities. Orders falling below threshold quantities revert to trade or retail list prices."
      },
      {
        heading: "3. Credit Lines & Default Interest",
        body: "Net-30 credit terms are granted post financial audit. Overdue Net-30 balances beyond the 30-day window accrue interest at 1.5% per month until settled."
      }
    ]
  },
  "security-notice": {
    id: "security-notice",
    title: "Security & Anti-Fraud Notice",
    category: "Legal & Compliance",
    summary: "Protocols protecting commercial transactions, payment verification safeguards, and counterfeit prevention.",
    sections: [
      {
        heading: "1. Automated Fraud Scoring & 3DS 2.0",
        body: "All payment transactions undergo real-time 3D Secure 2.0 verification and automated risk evaluation to prevent unauthorized card usage."
      },
      {
        heading: "2. Anti-Counterfeiting & Serial Verification",
        body: "Every product unit dispatched carries a verifiable serial barcode linked to our origin certificate database, guaranteeing 100% authentic inventory."
      },
      {
        heading: "3. Incident Reporting",
        body: "Suspicious activities or security inquiries can be reported directly to compliance@shopsphere.com for immediate escalation."
      }
    ]
  },
  "wholesaler-application": {
    id: "wholesaler-application",
    title: "Wholesale Business Account Application",
    category: "Business Solutions & Programs",
    summary: "Apply for direct wholesale tier pricing, dedicated account management, and credit line facilities.",
    sections: [
      {
        heading: "1. Program Benefits",
        body: "Unlock maximum volume discounts up to 45% off retail list prices, priority dispatch queues, assigned enterprise account managers, and Net-30 credit eligibility."
      },
      {
        heading: "2. Document Requirements",
        body: "Applicants must provide a valid Business Registration Certificate, GST/VAT/Tax ID, and authorized signatory details."
      },
      {
        heading: "3. How to Register",
        body: "Navigate to the Registration page, select 'Wholesaler' as your account role, and upload required verification credentials."
      }
    ]
  },
  "retailer-partnership": {
    id: "retailer-partnership",
    title: "Retail Merchant Partner Program",
    category: "Business Solutions & Programs",
    summary: "Tailored trade pricing and flexible reordering for independent retail stores and digital merchants.",
    sections: [
      {
        heading: "1. Flexible Trade Pricing",
        body: "Enjoy competitive trade discounts with lower minimum order quantities tailored specifically for boutique and independent retailers."
      },
      {
        heading: "2. Rapid Restock Pad",
        body: "Access the streamlined 1-click reorder pad to quickly replenish high-velocity inventory lines without manual administrative delay."
      }
    ]
  },
  "corporate-inquiries": {
    id: "corporate-inquiries",
    title: "Corporate & Bulk Custom Orders",
    category: "Business Solutions & Programs",
    summary: "Custom procurement solutions, co-branding, and high-volume institutional orders.",
    sections: [
      {
        heading: "1. Specialized Sourcing",
        body: "Our procurement division offers custom product sourcing and factory-direct container shipments for enterprise orders exceeding $50,000."
      },
      {
        heading: "2. Dedicated Support Desk",
        body: "Contact corporate@shopsphere.com or call our commercial helpline for customized quotes, RFP submissions, and tax-exempt invoices."
      }
    ]
  }
};
