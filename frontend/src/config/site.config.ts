export const siteConfig = {
  name: "ShopSphere Enterprise",
  shortName: "ShopSphere",
  brandName: "ShopSphere",
  description: "Enterprise Multi-Tier Commerce Platform & SS Agent",
  url: "",
  ogImage: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d",
  company: {
    name: "ShopSphere Global Operations Private Limited",
    shortName: "ShopSphere",
    tagline: "Commercial Enterprise Procurement & Multi-Tier Distribution",
    mission: "Empowering commercial enterprises, trade resellers, and retail shoppers with nationwide distribution, authentic products, and transparent tiered pricing.",
    legalName: "",
    taxId: "",
    address: "Amethi",
    street: "",
    city: "Amethi",
    state: "UP",
    postalCode: "227405",
    country: "India",
    supportEmail: "surya.narayan.gos@gmail.com",
    salesEmail: "surya.narayan.gos@gmail.com",
    helpline: "",
    helplineHours: "Mon - Sat, 9:00 AM - 7:00 PM IST",
  },
  links: {
    docs: "/docs",
    terms: "/terms",
    privacy: "/privacy",
    github: "https://github.com/panditashushukl/ShopSphere",
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api/v1",
    endpoints: {
      auth: {
        login: "/auth/login",
        register: "/auth/register",
        logout: "/auth/logout",
        refresh: "/auth/refresh",
        me: "/auth/me",
      },
      products: {
        list: "/products",
        detail: (id: number | string) => `/products/${id}`,
        updateStock: (id: number | string) => `/products/${id}/stock`,
      },
      orders: {
        create: "/orders",
        list: "/orders",
      },
      admin: {
        metrics: "/admin/metrics",
        users: "/admin/users",
        updateUser: (uid: number | string) => `/admin/users/${uid}`,
        updateOrder: (oid: number | string) => `/admin/orders/${oid}/status`,
      },
      agent: {
        health: "/agent/health",
        tools: "/agent/tools",
        sessions: "/agent/sessions",
        history: (threadId: string) => `/agent/sessions/${threadId}/history`,
        query: "/agent/query",
        stream: "/agent/stream",
      },
      cart: {
        get: "/cart",
        add: "/cart",
        clear: "/cart",
      },
    },
  },
  nav: {
    main: [
      { title: "Products", href: "/products" },
      // { title: "Wholesale Exchange", href: "/wholesaler" },
      { title: "My Orders", href: "/orders" },
      { title: "SS Agent", href: "/agent" },
    ],
    admin: [
      { title: "Inventory Ledger", href: "/admin" },
      { title: "User Verifications", href: "/admin" },
      { title: "Exchange Metrics", href: "/admin" },
    ],
  },
};

export const BRAND_NAME = siteConfig.brandName;
export const COMPANY_INFO = siteConfig.company;

export type SiteConfig = typeof siteConfig;
