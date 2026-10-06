import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getRolePriceAndMoq(product?: any, role?: string | null) {
  if (!product) {
    return {
      price: 0,
      moq: 1,
      label: "Standard Retail Price",
    };
  }

  const currentRole = role ?? "GUEST";

  if (currentRole === "WHOLESALER") {
    return {
      price: Number(product.wholesale_price ?? product.trade_price ?? product.retail_price ?? product.price ?? 0),
      moq: Number(product.min_order_quantity ?? product.moq ?? 1),
      label: "Wholesale Bulk Rate",
    };
  }

  if (currentRole === "RETAILER") {
    return {
      price: Number(product.trade_price ?? product.retail_price ?? product.price ?? 0),
      moq: 1,
      label: "Trade Partner Rate",
    };
  }

  // GUEST, CUSTOMER, or default normal user
  return {
    price: Number(product.retail_price ?? product.price ?? 0),
    moq: 1,
    label: "Standard Retail Price",
  };
}
